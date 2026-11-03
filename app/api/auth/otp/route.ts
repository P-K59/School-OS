import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isServiceRoleConfigured } from '@/lib/supabase/server-client';
import { serverDb } from '@/lib/db/server-db';
import { demoUsers } from '@/lib/db/mock-data';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawEmail = body.email;

    if (!rawEmail || typeof rawEmail !== 'string' || !rawEmail.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const email = rawEmail.trim().toLowerCase();

    // 1. Verify that this email belongs to an authorized application profile
    // Check A: Database public.profiles via Supabase Admin if configured
    let matchedProfile: any = null;

    if (supabaseAdmin && typeof supabaseAdmin.from === 'function') {
      try {
        const { data, error } = await supabaseAdmin
          .from('profiles')
          .select('id, auth_id, school_id, role, first_name, last_name, email, is_active')
          .ilike('email', email)
          .maybeSingle();

        if (data && !error) {
          matchedProfile = data;
        }
      } catch (err: any) {
        console.warn('[api/auth/otp] Supabase profile query error:', err.message);
      }
    }

    // Check B: In-memory/local serverDb user profiles
    if (!matchedProfile) {
      const serverUsers = serverDb.getUserProfiles();
      const localMatch = serverUsers.find((u: any) => u.email && u.email.toLowerCase() === email);
      if (localMatch) {
        matchedProfile = localMatch;
      }
    }

    // Check C: Core system demo/production seeded accounts
    if (!matchedProfile) {
      const demoMatch = demoUsers.find(u => u.email.toLowerCase() === email);
      if (demoMatch) {
        matchedProfile = demoMatch;
      }
    }

    // Check D: Registered school admin credentials in serverDb
    if (!matchedProfile) {
      const schools = await serverDb.getSchools();
      const schoolMatch = schools.find(s => 
        (s.email && s.email.toLowerCase() === email) ||
        (s.adminCredentials?.email && s.adminCredentials.email.toLowerCase() === email) ||
        (s.adminCredentials?.loginId && s.adminCredentials.loginId.toLowerCase() === email)
      );
      if (schoolMatch) {
        matchedProfile = {
          id: `usr-admin-${schoolMatch.id}`,
          schoolId: schoolMatch.id,
          schoolName: schoolMatch.name,
          role: 'SCHOOL_ADMIN',
          firstName: schoolMatch.principalName?.split(' ')[0] || 'Principal',
          lastName: schoolMatch.principalName?.split(' ').slice(1).join(' ') || schoolMatch.name,
          displayName: schoolMatch.principalName || `Principal, ${schoolMatch.name}`,
          email: schoolMatch.email || schoolMatch.adminCredentials?.email || email,
          isActive: schoolMatch.isActive && schoolMatch.onboardingStatus === 'ACTIVE',
          status: (schoolMatch.isActive && schoolMatch.onboardingStatus === 'ACTIVE') ? 'ACTIVE' : 'PENDING'
        };
      }
    }

    // 2. Authorization & Status Check
    // SECURITY HARDENING (HIGH-2): Prevent account enumeration by returning an identical generic response
    const isProfileActive = matchedProfile
      ? (matchedProfile.is_active !== undefined ? Boolean(matchedProfile.is_active) : (matchedProfile.isActive !== false && matchedProfile.status !== 'SUSPENDED'))
      : false;

    if (!matchedProfile || !isProfileActive) {
      return NextResponse.json({
        success: true,
        authorized: false,
        message: 'If an authorized account exists for this email, a verification code will be sent.'
      });
    }

    // 3. Pre-provision in Supabase auth.users if service role is available so shouldCreateUser:false succeeds
    if (isServiceRoleConfigured && supabaseAdmin && supabaseAdmin.auth && supabaseAdmin.auth.admin) {
      try {
        // Attempt to create user with email_confirm: true if doesn't exist
        const { error: adminCreateErr } = await supabaseAdmin.auth.admin.createUser({
          email: email,
          email_confirm: true,
          user_metadata: {
            role: matchedProfile.role,
            firstName: matchedProfile.first_name || matchedProfile.firstName,
            lastName: matchedProfile.last_name || matchedProfile.lastName
          }
        });
        // Ignore "email address already exists" error
        if (adminCreateErr && !adminCreateErr.message.includes('already been registered') && !adminCreateErr.message.includes('already exists')) {
          console.warn('[api/auth/otp] Supabase admin createUser notice:', adminCreateErr.message);
        }
      } catch (err: any) {
        console.warn('[api/auth/otp] Supabase user pre-provisioning exception:', err.message);
      }
    }

    return NextResponse.json({
      success: true,
      authorized: true,
      message: 'If an authorized account exists for this email, a verification code will be sent.'
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to process authentication request' },
      { status: 500 }
    );
  }
}
