import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isServiceRoleConfigured } from '@/lib/supabase/server-client';
import { serverDb } from '@/lib/db/server-db';
import { demoUsers } from '@/lib/db/mock-data';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'REQUEST'; // 'REQUEST' | 'RESET'
    const rawEmail = body.email ? String(body.email).trim().toLowerCase() : null;
    const newPassword = body.newPassword ? String(body.newPassword).trim() : null;
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : (body.token || null);

    // ========================================================
    // ACTION 1: REQUEST PASSWORD RESET
    // ========================================================
    if (action === 'REQUEST') {
      if (!rawEmail || !rawEmail.includes('@')) {
        return NextResponse.json(
          { success: false, error: 'Please enter a valid registered email address.' },
          { status: 400 }
        );
      }

      // Check if profile exists in authoritative sources
      let profileFound = false;
      const isSuperAdmin = 
        rawEmail === 'pkvbspu2020@gmail.com' ||
        rawEmail === 'superadmin@innovatmind.com' ||
        rawEmail === 'admin@innovatmind.com';

      if (isSuperAdmin) {
        profileFound = true;
      }

      if (!profileFound && supabaseAdmin && typeof supabaseAdmin.from === 'function') {
        try {
          const { data } = await supabaseAdmin
            .from('profiles')
            .select('id, email, is_active')
            .ilike('email', rawEmail)
            .maybeSingle();
          if (data && data.is_active !== false) {
            profileFound = true;
          }
        } catch (e: any) {
          console.warn('[api/auth/reset-password] Supabase check error:', e.message);
        }
      }

      if (!profileFound) {
        const localMatch = serverDb.getUserProfiles().find((u: any) => u.email && u.email.toLowerCase() === rawEmail);
        if (localMatch && localMatch.isActive !== false) {
          profileFound = true;
        }
      }

      if (!profileFound) {
        const demoMatch = demoUsers.find(u => u.email.toLowerCase() === rawEmail);
        if (demoMatch && demoMatch.isActive !== false) {
          profileFound = true;
        }
      }

      // Dispatch reset email via Supabase Auth if service is available
      if (profileFound && supabaseAdmin && supabaseAdmin.auth) {
        try {
          const host = req.headers.get('host') || 'localhost:3000';
          const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
          const origin = `${proto}://${host}`;
          
          await supabaseAdmin.auth.resetPasswordForEmail(rawEmail, {
            redirectTo: `${origin}/auth/reset-password`
          });
        } catch (dispatchErr: any) {
          console.warn('[api/auth/reset-password] Supabase reset dispatch error:', dispatchErr.message);
        }
      }

      // Record audit event
      try {
        await serverDb.recordAuditEvent({
          schoolId: 'platform',
          title: 'Password Reset Requested',
          detail: `Password reset instructions requested for email: ${rawEmail}.`,
          category: 'AUTH'
        });
      } catch {}

      // Anti-enumeration generic response
      return NextResponse.json({
        success: true,
        message: `If an authorized account exists for ${rawEmail}, a password reset link has been dispatched to your email.`
      });
    }

    // ========================================================
    // ACTION 2: RESET / UPDATE PASSWORD
    // ========================================================
    if (action === 'RESET') {
      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 6 characters in length.' },
          { status: 400 }
        );
      }

      let targetEmail = rawEmail;

      // Cryptographically verify token if supplied
      if (token && supabaseAdmin && supabaseAdmin.auth) {
        try {
          const { data, error } = await supabaseAdmin.auth.getUser(token);
          if (data?.user && !error) {
            targetEmail = data.user.email?.toLowerCase().trim() || targetEmail;
            
            // Update password in Supabase Auth via admin API
            if (isServiceRoleConfigured && supabaseAdmin.auth.admin) {
              await supabaseAdmin.auth.admin.updateUserById(data.user.id, {
                password: newPassword
              });
            }
          }
        } catch (tokErr: any) {
          console.warn('[api/auth/reset-password] Token verification note:', tokErr.message);
        }
      }

      // Update password in local serverDb and active memory
      if (targetEmail) {
        await serverDb.updateUserPassword(targetEmail, newPassword);
        const demoMatch = demoUsers.find(u => u.email.toLowerCase() === targetEmail);
        if (demoMatch) {
          demoMatch.password = newPassword;
        }
      }

      try {
        await serverDb.recordAuditEvent({
          schoolId: 'platform',
          title: 'Password Reset Completed',
          detail: `Password was successfully updated for account: ${targetEmail || 'unknown'}.`,
          category: 'AUTH'
        });
      } catch {}

      return NextResponse.json({
        success: true,
        message: 'Your password has been successfully updated! You can now log in with your new password.'
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action specified.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Password reset request encountered an unexpected error.' },
      { status: 500 }
    );
  }
}
