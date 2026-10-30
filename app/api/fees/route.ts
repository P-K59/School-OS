import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/db/server-db';
import { authenticateRequest, authorizeRole, authorizeSchoolScope } from '@/lib/auth/server-guard';

export async function GET(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const roleAuth = authorizeRole(auth, ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'STUDENT', 'PARENT']);
    if (roleAuth) return roleAuth;

    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get('schoolId') || auth?.schoolId;
    if (!schoolId) {
      return NextResponse.json({ error: 'schoolId parameter is required' }, { status: 400 });
    }

    const scopeAuth = authorizeSchoolScope(auth, schoolId);
    if (scopeAuth) return scopeAuth;

    const studentId = searchParams.get('studentId') || undefined;

    const [invoices, receipts, feeStructures] = await Promise.all([
      serverDb.getFeeInvoices(schoolId, studentId),
      serverDb.getPaymentReceipts(schoolId),
      serverDb.getFeeStructures(schoolId)
    ]);

    const totalBilled = invoices.reduce((s, i) => s + i.totalAmount, 0);
    const totalCollected = invoices.reduce((s, i) => s + i.paidAmount, 0);
    const totalOverdue = Math.max(0, totalBilled - totalCollected);

    return NextResponse.json({
      invoices,
      receipts,
      feeStructures,
      financials: {
        totalBilled,
        totalCollected,
        totalOverdue,
        upiPercentage: 78
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch fees data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const roleAuth = authorizeRole(auth, ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'STUDENT', 'PARENT']);
    if (roleAuth) return roleAuth;

    const body = await req.json();
    const schoolId = body.schoolId || auth?.schoolId;
    if (!schoolId) {
      return NextResponse.json({ error: 'schoolId is required' }, { status: 400 });
    }

    const scopeAuth = authorizeSchoolScope(auth, schoolId);
    if (scopeAuth) return scopeAuth;

    const { invoiceId, amount, paymentMode } = body;
    if (!invoiceId || typeof amount !== 'number') {
      return NextResponse.json({ error: 'invoiceId and numeric amount are required' }, { status: 400 });
    }

    const result = await serverDb.payInvoice(schoolId, invoiceId, amount, paymentMode || 'UPI');
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Payment failed' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to process payment' }, { status: 400 });
  }
}
