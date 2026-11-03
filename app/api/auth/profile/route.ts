import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isServiceRoleConfigured } from '@/lib/supabase/server-client';
import { serverDb } from '@/lib/db/server-db';
import { demoUsers, isDemoSchool } from '@/lib/db/mock-data';
import { UserProfile, UserRole } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const body = await req.json().catch(() => ({}));
    const requestEmail = body.email ? String(body.email).trim().toLowerCase() : null;
    const requestAuthId = body.authId ? String(body.authId).trim() : null;

    let verifiedEmail: string | null = null;
    let verifiedAuthId: string | null = null;

    // 1. If a Supabase Auth JWT token was provided, verify it cryptographically
    if (token && supabaseAdmin && supabaseAdmin.auth) {
      try {
        const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
        if (userData?.user && !userError) {
          verifiedEmail = userData.user.email?.toLowerCase().trim() || null;
          verifiedAuthId = userData.user.id;
        }
      } catch (err: any) {
        console.warn('[api/auth/profile] Supabase token verification failed:', err.message);
      }
    }

    // Fall back to body parameters if token verification was not applicable
    // Security Hardening: If token was provided but failed verification, or in production mode, require cryptographic verification
    const isProductionEnv = process.env.NODE_ENV === 'production';
    if (!verifiedEmail) {
      if (isProductionEnv || token) {
        return NextResponse.json(
          { success: false, error: 'Valid Supabase authentication token is required.', code: 'UNAUTHORIZED' },
          { status: 401 }
        );
      }
    }

    if (requestEmail && verifiedEmail && requestEmail !== verifiedEmail) {
      return NextResponse.json(
        { success: false, error: 'Identity mismatch: Authentication token does not match requested email.', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const emailToResolve = verifiedEmail || requestEmail;
    const authIdToResolve = verifiedAuthId || requestAuthId;

    if (!emailToResolve) {
      return NextResponse.json(
        { success: false, error: 'Authentication token or verified email is required.', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // 2. Query trusted profile from Supabase public.profiles
    let trustedProfile: any = null;

    if (supabaseAdmin && typeof supabaseAdmin.from === 'function') {
      try {
        // Query by auth_id first if available, else by email
        let query = supabaseAdmin.from('profiles').select('*');
        if (authIdToResolve) {
          query = query.or(`auth_id.eq.${authIdToResolve},email.ilike.${emailToResolve}`);
        } else {
          query = query.ilike('email', emailToResolve);
        }

        const { data, error } = await query.maybeSingle();
        if (data && !error) {
          trustedProfile = data;

          // Safe Account Linking: If auth_id is not yet set, link it now
          if (authIdToResolve && !data.auth_id) {
            try {
              await supabaseAdmin.from('profiles').update({ auth_id: authIdToResolve, updated_at: new Date().toISOString() }).eq('id', data.id);
              trustedProfile.auth_id = authIdToResolve;
            } catch (linkErr: any) {
              console.warn('[api/auth/profile] Failed to link auth_id:', linkErr.message);
            }
          }
        }
      } catch (err: any) {
        console.warn('[api/auth/profile] Supabase profiles lookup error:', err.message);
      }
    }

    // 3. Fallback: Search in-memory / local serverDb user profiles
    if (!trustedProfile) {
      const serverUsers = serverDb.getUserProfiles();
      const match = serverUsers.find((u: any) => u.email && u.email.toLowerCase() === emailToResolve);
      if (match) {
        trustedProfile = {
          id: match.id,
          auth_id: authIdToResolve || undefined,
          school_id: match.schoolId,
          role: match.role,
          first_name: match.firstName,
          last_name: match.lastName,
          email: match.email,
          phone: match.phone,
          designation: match.designation,
          is_active: match.isActive !== false && match.status !== 'SUSPENDED'
        };
      }
    }

    // 4. Fallback: Check core system demo/production seeded accounts
    if (!trustedProfile) {
      const demoMatch = demoUsers.find(u => u.email.toLowerCase() === emailToResolve);
      if (demoMatch) {
        trustedProfile = {
          id: demoMatch.id,
          auth_id: authIdToResolve || undefined,
          school_id: demoMatch.schoolId,
          role: demoMatch.role,
          first_name: demoMatch.firstName,
          last_name: demoMatch.lastName,
          email: demoMatch.email,
          phone: demoMatch.phone,
          designation: demoMatch.designation,
          is_active: demoMatch.isActive !== false && (demoMatch as any).status !== 'SUSPENDED'
        };
      }
    }

    // 5. Fallback: Check approved School Admin accounts in serverDb
    if (!trustedProfile) {
      const schools = await serverDb.getSchools();
      const schoolMatch = schools.find(s => 
        (s.email && s.email.toLowerCase() === emailToResolve) ||
        (s.adminCredentials?.email && s.adminCredentials.email.toLowerCase() === emailToResolve) ||
        (s.adminCredentials?.loginId && s.adminCredentials.loginId.toLowerCase() === emailToResolve)
      );
      if (schoolMatch) {
        trustedProfile = {
          id: `usr-admin-${schoolMatch.id}`,
          auth_id: authIdToResolve || undefined,
          school_id: schoolMatch.id,
          role: 'SCHOOL_ADMIN',
          first_name: schoolMatch.principalName?.split(' ')[0] || 'Principal',
          last_name: schoolMatch.principalName?.split(' ').slice(1).join(' ') || schoolMatch.name,
          email: schoolMatch.email || schoolMatch.adminCredentials?.email || emailToResolve,
          phone: schoolMatch.phone,
          designation: 'Principal & Director',
          is_active: schoolMatch.isActive && schoolMatch.onboardingStatus === 'ACTIVE'
        };
      }
    }

    // 6. Security Enforcement: Unknown accounts MUST NOT receive dashboard access!
    if (!trustedProfile) {
      return NextResponse.json(
        {
          success: false,
          error: `Access Denied: The account "${emailToResolve}" is not authorized on InnovatMind School OS. Please contact your school administrator.`,
          code: 'ACCOUNT_NOT_AUTHORIZED'
        },
        { status: 403 }
      );
    }

    // 7. Status Enforcement: Inactive or suspended accounts
    if (trustedProfile.is_active === false) {
      return NextResponse.json(
        {
          success: false,
          error: 'Your account has been deactivated or suspended. Please contact your institution administrator.',
          code: 'ACCOUNT_SUSPENDED'
        },
        { status: 403 }
      );
    }

    // 8. School Tenant Validation: Ensure assigned school is active
    let schoolName: string | undefined;
    if (trustedProfile.school_id) {
      const school = await serverDb.getSchoolById(trustedProfile.school_id);
      if (school) {
        schoolName = school.name;
        if (!school.isActive || school.onboardingStatus === 'SUSPENDED') {
          return NextResponse.json(
            {
              success: false,
              error: `Portal access for ${school.name} is currently suspended. Please contact platform administration.`,
              code: 'SCHOOL_SUSPENDED'
            },
            { status: 403 }
          );
        }
      }
    }

    // 9. Construct trusted authoritative UserProfile
    const normalizedRole = String(trustedProfile.role).trim().toUpperCase() as UserRole;
    const authorativeUser: UserProfile = {
      id: trustedProfile.id,
      schoolId: trustedProfile.school_id || undefined,
      schoolName: schoolName,
      role: normalizedRole,
      firstName: trustedProfile.first_name || 'User',
      lastName: trustedProfile.last_name || '',
      displayName: `${trustedProfile.first_name || ''} ${trustedProfile.last_name || ''}`.trim() || emailToResolve.split('@')[0],
      email: trustedProfile.email,
      phone: trustedProfile.phone || undefined,
      designation: trustedProfile.designation || undefined,
      avatarUrl: trustedProfile.avatar_url || undefined,
      isActive: true,
      status: 'ACTIVE'
    };

    // 10. Prepare secure HTTP response with server cookie
    const response = NextResponse.json({
      success: true,
      user: authorativeUser
    });

    const cookiePayload = encodeURIComponent(JSON.stringify({
      id: authorativeUser.id,
      role: authorativeUser.role,
      schoolId: authorativeUser.schoolId,
      email: authorativeUser.email,
      displayName: authorativeUser.displayName
    }));

    response.cookies.set('school_os_user', cookiePayload, {
      path: '/',
      httpOnly: true, // Secure: Protected from client-side script theft/tampering
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to resolve user profile' },
      { status: 500 }
    );
  }
}
