import test from 'node:test';
import assert from 'node:assert/strict';

// ============================================================================
// InnovatMind School OS - School Admin Workflow Milestone Automated Test Suite
// Milestones:
// 1. Student Admissions (Validation, ID Generation, Deduplication, Persistence)
// 2. Attendance Management (Date/Grade/Section, Scoped Students, Records, Summaries)
// 3. Fees Management (Fee Structures, Balances, Authorized Payments, Receipts)
// 4. Security & Multi-Tenant Isolation
// ============================================================================

test('School Admin Workflow Milestone Test Suite', async (t) => {

  // Isolated Persistent Storage Engine Simulation
  class MockLocalStorage {
    constructor() {
      this.store = new Map();
    }
    getItem(key) {
      return this.store.get(key) || null;
    }
    setItem(key, value) {
      this.store.set(key, String(value));
    }
    removeItem(key) {
      this.store.delete(key);
    }
    clear() {
      this.store.clear();
    }
  }

  const storage = new MockLocalStorage();

  // Seed Data
  const SCHOOL_1_ID = 'school-1';
  const SCHOOL_2_ID = 'school-2';

  const initialSchools = [
    { id: SCHOOL_1_ID, code: 'SCH-DEL-001', name: 'Delhi Public School (STEM Excellence)', city: 'Delhi', state: 'Delhi' },
    { id: SCHOOL_2_ID, code: 'SCH-MUM-002', name: 'Bombay Scottish School (Robotics Wing)', city: 'Mumbai', state: 'Maharashtra' }
  ];

  const initialFeeStructures = [
    {
      id: 'fs-1-gr6',
      schoolId: SCHOOL_1_ID,
      gradeName: 'Grade 6',
      academicSession: '2025-2026',
      tuitionFee: 48000,
      stemLabFee: 15000,
      examLibraryFee: 8000,
      annualCharges: 14000,
      totalAnnualFee: 85000,
    },
    {
      id: 'fs-1-gr7',
      schoolId: SCHOOL_1_ID,
      gradeName: 'Grade 7',
      academicSession: '2025-2026',
      tuitionFee: 52000,
      stemLabFee: 16000,
      examLibraryFee: 9000,
      annualCharges: 15000,
      totalAnnualFee: 92000,
    },
    {
      id: 'fs-2-gr6',
      schoolId: SCHOOL_2_ID,
      gradeName: 'Grade 6',
      academicSession: '2025-2026',
      tuitionFee: 45000,
      stemLabFee: 14000,
      examLibraryFee: 7500,
      annualCharges: 13500,
      totalAnnualFee: 80000,
    }
  ];

  let studentsList = [
    {
      id: 'stud-1',
      schoolId: SCHOOL_1_ID,
      profileId: 'prof-stud-1',
      admissionNumber: 'ADM-2025-001',
      rollNumber: '101',
      firstName: 'Aarav',
      lastName: 'Sharma',
      email: 'aarav.sharma@dps.edu',
      gradeId: 'grade-6',
      gradeName: 'Grade 6',
      sectionId: 'sec-6a',
      sectionName: 'A',
      sessionId: 'sess-2025',
      dob: '2013-05-12',
      gender: 'MALE',
      address: 'Sector 14, Rohini, Delhi',
      parentName: 'Ramesh Sharma',
      parentPhone: '+91 98110 12345',
      parentEmail: 'ramesh.sharma@gmail.com',
      currentXp: 320,
      currentLevel: 3,
      currentStreak: 5,
      attendancePercentage: 92,
      todayAttendance: 'PRESENT',
      status: 'ACTIVE',
      feeStatus: 'PAID',
      createdAt: '2025-01-10T08:00:00Z',
    },
    {
      id: 'stud-2',
      schoolId: SCHOOL_1_ID,
      profileId: 'prof-stud-2',
      admissionNumber: 'ADM-2025-002',
      rollNumber: '102',
      firstName: 'Diya',
      lastName: 'Patel',
      email: 'diya.patel@dps.edu',
      gradeId: 'grade-6',
      gradeName: 'Grade 6',
      sectionId: 'sec-6a',
      sectionName: 'A',
      sessionId: 'sess-2025',
      dob: '2013-08-22',
      gender: 'FEMALE',
      address: 'Pocket B, Dwarka, Delhi',
      parentName: 'Suresh Patel',
      parentPhone: '+91 98220 54321',
      parentEmail: 'suresh.patel@gmail.com',
      currentXp: 450,
      currentLevel: 4,
      currentStreak: 8,
      attendancePercentage: 96,
      todayAttendance: 'PRESENT',
      status: 'ACTIVE',
      feeStatus: 'PENDING',
      createdAt: '2025-01-12T08:00:00Z',
    },
    {
      id: 'stud-sch2-1',
      schoolId: SCHOOL_2_ID,
      profileId: 'prof-stud-sch2-1',
      admissionNumber: 'BSS-2025-001',
      rollNumber: '201',
      firstName: 'Vihaan',
      lastName: 'Mehta',
      email: 'vihaan.mehta@bss.edu',
      gradeId: 'grade-6-sch2',
      gradeName: 'Grade 6',
      sectionId: 'sec-6a-sch2',
      sectionName: 'A',
      sessionId: 'sess-2025',
      dob: '2013-03-15',
      gender: 'MALE',
      address: 'Bandra West, Mumbai',
      parentName: 'Rajesh Mehta',
      parentPhone: '+91 98330 99887',
      parentEmail: 'rajesh.mehta@gmail.com',
      currentXp: 210,
      currentLevel: 2,
      currentStreak: 3,
      attendancePercentage: 88,
      todayAttendance: 'PRESENT',
      status: 'ACTIVE',
      feeStatus: 'PAID',
      createdAt: '2025-01-15T08:00:00Z',
    }
  ];

  let attendanceRecordsList = [
    {
      id: 'att-seed-1',
      schoolId: SCHOOL_1_ID,
      studentId: 'stud-1',
      date: '2025-05-10',
      status: 'PRESENT',
      remarks: 'Biometric verified',
      markedAt: '2025-05-10T08:15:00Z',
      markedBy: 'usr-admin-school-1',
    },
    {
      id: 'att-seed-2',
      schoolId: SCHOOL_1_ID,
      studentId: 'stud-2',
      date: '2025-05-10',
      status: 'ABSENT',
      remarks: 'Parent notified',
      markedAt: '2025-05-10T08:16:00Z',
      markedBy: 'usr-admin-school-1',
    }
  ];

  let invoicesList = [
    {
      id: 'inv-1',
      schoolId: SCHOOL_1_ID,
      studentId: 'stud-1',
      studentName: 'Aarav Sharma',
      invoiceNumber: 'INV-2025-001',
      category: 'Annual Tuition & STEM Lab Fee',
      totalAmount: 85000,
      discountAmount: 5000,
      paidAmount: 80000,
      dueDate: '2025-06-30',
      status: 'PAID',
    },
    {
      id: 'inv-2',
      schoolId: SCHOOL_1_ID,
      studentId: 'stud-2',
      studentName: 'Diya Patel',
      invoiceNumber: 'INV-2025-002',
      category: 'Term 1 Tuition & Robotics Fee',
      totalAmount: 45000,
      discountAmount: 0,
      paidAmount: 20000,
      dueDate: '2025-06-15',
      status: 'PARTIAL',
    },
    {
      id: 'inv-sch2-1',
      schoolId: SCHOOL_2_ID,
      studentId: 'stud-sch2-1',
      studentName: 'Vihaan Mehta',
      invoiceNumber: 'INV-2025-099',
      category: 'Annual Robotics Lab Fee',
      totalAmount: 35000,
      discountAmount: 0,
      paidAmount: 0,
      dueDate: '2025-07-01',
      status: 'PENDING',
    }
  ];

  let paymentReceiptsList = [];

  // Seed persistent storage
  storage.setItem('school_os_students', JSON.stringify(studentsList));
  storage.setItem('school_os_attendance_records', JSON.stringify(attendanceRecordsList));
  storage.setItem('school_os_invoices', JSON.stringify(invoicesList));
  storage.setItem('school_os_fee_structures', JSON.stringify(initialFeeStructures));
  storage.setItem('school_os_payment_receipts', JSON.stringify(paymentReceiptsList));

  // ==========================================================================
  // School Admin Service Implementation (mirrors lib/auth/context.tsx)
  // ==========================================================================
  const schoolAdminService = {
    activeSchoolId: SCHOOL_1_ID,

    generateNextAdmissionNumber(schoolId = this.activeSchoolId) {
      const year = new Date().getFullYear();
      const schoolStudents = studentsList.filter(s => s.schoolId === schoolId);
      let maxSeq = 0;
      for (const s of schoolStudents) {
        const match = (s.admissionNumber || '').match(/^ADM-(\d{4})-(\d+)$/);
        if (match && match[1] === String(year)) {
          const num = parseInt(match[2], 10);
          if (!isNaN(num) && num > maxSeq) {
            maxSeq = num;
          }
        }
      }
      return `ADM-${year}-${String(maxSeq + 1).padStart(3, '0')}`;
    },

    addStudent(studentData) {
      const targetSchoolId = studentData.schoolId || this.activeSchoolId;
      if (targetSchoolId !== this.activeSchoolId) {
        throw new Error(`Unauthorized cross-school admission: School Admin cannot enroll student to school '${targetSchoolId}'`);
      }

      // Mandatory validation
      if (!studentData.firstName || !studentData.firstName.trim()) {
        throw new Error('Student first name is required');
      }
      if (!studentData.lastName || !studentData.lastName.trim()) {
        throw new Error('Student last name is required');
      }
      if (!studentData.parentName || !studentData.parentName.trim()) {
        throw new Error('Parent/Guardian full name is required');
      }
      if (!studentData.parentPhone || !studentData.parentPhone.trim()) {
        throw new Error('Parent primary contact phone number is required');
      }

      const admissionNumber = (studentData.admissionNumber && studentData.admissionNumber.trim())
        ? studentData.admissionNumber.trim()
        : this.generateNextAdmissionNumber(targetSchoolId);

      // Duplicate admission number check within school
      const duplicateAdm = studentsList.find(
        s => s.schoolId === targetSchoolId && s.admissionNumber.toLowerCase() === admissionNumber.toLowerCase()
      );
      if (duplicateAdm) {
        throw new Error(`Duplicate admission number: A student with admission number '${admissionNumber}' is already registered in this school`);
      }

      // Duplicate email check
      if (studentData.email && studentData.email.trim()) {
        const duplicateEmail = studentsList.find(
          s => s.email.toLowerCase() === studentData.email.trim().toLowerCase()
        );
        if (duplicateEmail) {
          throw new Error(`Duplicate email address: A student or account with email '${studentData.email}' already exists`);
        }
      }

      const newStudent = {
        ...studentData,
        id: `stud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        schoolId: targetSchoolId,
        admissionNumber,
        profileId: `prof-${Date.now()}`,
        status: 'ACTIVE',
        currentXp: 100,
        currentLevel: 1,
        currentStreak: 0,
        attendancePercentage: 100,
        todayAttendance: 'PRESENT',
        feeStatus: 'PENDING',
        provisioningStatus: 'PROVISIONED',
        credentials: {
          cadetId: `CADET-${admissionNumber}`,
          temporaryPassword: `Cadet@${admissionNumber.replace(/[^a-zA-Z0-9]/g, '')}`,
          credentialsIssued: true,
        },
        createdAt: new Date().toISOString(),
      };

      studentsList = [newStudent, ...studentsList];
      storage.setItem('school_os_students', JSON.stringify(studentsList));

      // Auto-generate initial tuition invoice for student
      const invNumber = `INV-${new Date().getFullYear()}-${String(invoicesList.length + 1).padStart(3, '0')}`;
      const newInvoice = {
        id: `inv-${Date.now()}`,
        schoolId: targetSchoolId,
        studentId: newStudent.id,
        studentName: `${newStudent.firstName} ${newStudent.lastName}`,
        invoiceNumber: invNumber,
        category: `${newStudent.gradeName} Admission & STEM Lab Fee`,
        totalAmount: 25000,
        discountAmount: 0,
        paidAmount: 0,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'PENDING',
      };
      invoicesList = [newInvoice, ...invoicesList];
      storage.setItem('school_os_invoices', JSON.stringify(invoicesList));

      return newStudent;
    },

    markAttendance(studentId, status, date, remarks) {
      const student = studentsList.find(s => s.id === studentId);
      if (!student) {
        throw new Error(`Student with id '${studentId}' was not found.`);
      }
      if (student.schoolId !== this.activeSchoolId) {
        throw new Error(`Unauthorized cross-school operation: Student does not belong to active school.`);
      }

      const attDate = date || new Date().toISOString().split('T')[0];

      // Upsert record preventing duplicates for (schoolId, studentId, date)
      const existingIdx = attendanceRecordsList.findIndex(
        r => r.schoolId === this.activeSchoolId && r.studentId === studentId && r.date === attDate
      );

      const record = {
        id: existingIdx >= 0 ? attendanceRecordsList[existingIdx].id : `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        schoolId: this.activeSchoolId,
        studentId,
        date: attDate,
        status,
        remarks: remarks || (existingIdx >= 0 ? attendanceRecordsList[existingIdx].remarks : ''),
        markedAt: new Date().toISOString(),
        markedBy: 'usr-admin-school-1',
      };

      if (existingIdx >= 0) {
        attendanceRecordsList[existingIdx] = record;
      } else {
        attendanceRecordsList = [...attendanceRecordsList, record];
      }
      storage.setItem('school_os_attendance_records', JSON.stringify(attendanceRecordsList));

      // Update student todayAttendance if date is today
      const todayDate = new Date().toISOString().split('T')[0];
      if (attDate === todayDate && (status === 'PRESENT' || status === 'ABSENT' || status === 'LATE')) {
        student.todayAttendance = status;
        storage.setItem('school_os_students', JSON.stringify(studentsList));
      }

      return record;
    },

    markBatchAttendance(marks, date) {
      const attDate = date || new Date().toISOString().split('T')[0];
      const results = [];
      for (const m of marks) {
        results.push(this.markAttendance(m.studentId, m.status, attDate, m.remarks));
      }
      return results;
    },

    getAttendanceForDate(date, gradeName, sectionName) {
      const schoolStudents = studentsList.filter(s => {
        if (s.schoolId !== this.activeSchoolId) return false;
        if (gradeName && s.gradeName !== gradeName) return false;
        if (sectionName && s.sectionName !== sectionName) return false;
        return true;
      });

      const records = attendanceRecordsList.filter(
        r => r.schoolId === this.activeSchoolId && r.date === date
      );

      const recordMap = new Map();
      records.forEach(r => recordMap.set(r.studentId, r));

      let presentCount = 0;
      let absentCount = 0;
      let lateCount = 0;
      let excusedCount = 0;

      schoolStudents.forEach(st => {
        const rec = recordMap.get(st.id);
        if (rec) {
          if (rec.status === 'PRESENT') presentCount++;
          else if (rec.status === 'ABSENT') absentCount++;
          else if (rec.status === 'LATE') lateCount++;
          else if (rec.status === 'EXCUSED') excusedCount++;
        }
      });

      const totalMarked = presentCount + absentCount + lateCount + excusedCount;
      const effectivePresent = presentCount + (lateCount * 0.5);
      const attendanceRate = totalMarked > 0 ? Math.round((effectivePresent / totalMarked) * 100) : 0;

      return {
        date,
        totalStudents: schoolStudents.length,
        totalMarked,
        presentCount,
        absentCount,
        lateCount,
        excusedCount,
        attendanceRate,
        records
      };
    },

    payInvoice(invoiceId, amount, paymentMode = 'UPI') {
      const invoice = invoicesList.find(i => i.id === invoiceId);
      if (!invoice) {
        return { success: false, error: 'Invoice not found' };
      }
      if (invoice.schoolId !== this.activeSchoolId) {
        return { success: false, error: 'Unauthorized: Cannot collect payment for another school invoice' };
      }
      if (amount <= 0) {
        return { success: false, error: 'Payment amount must be greater than zero' };
      }

      const netPayable = invoice.totalAmount - (invoice.discountAmount || 0);
      const remainingBefore = netPayable - invoice.paidAmount;
      if (amount > remainingBefore) {
        return { success: false, error: `Payment amount (₹${amount}) exceeds remaining balance of ₹${remainingBefore}` };
      }

      const previousPaid = invoice.paidAmount;
      const newPaidAmount = previousPaid + amount;
      const remainingAfter = netPayable - newPaidAmount;
      const newStatus = remainingAfter <= 0 ? 'PAID' : 'PARTIAL';

      invoice.paidAmount = newPaidAmount;
      invoice.status = newStatus;
      storage.setItem('school_os_invoices', JSON.stringify(invoicesList));

      const student = studentsList.find(s => s.id === invoice.studentId);
      if (student && newStatus === 'PAID') {
        student.feeStatus = 'PAID';
        storage.setItem('school_os_students', JSON.stringify(studentsList));
      }

      const receiptNumber = `REC-${invoice.invoiceNumber.replace('INV-', '')}-${Date.now().toString().slice(-4)}`;
      const receipt = {
        receiptNumber,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        schoolId: invoice.schoolId,
        schoolName: initialSchools.find(s => s.id === invoice.schoolId)?.name || 'Delhi Public School',
        studentId: invoice.studentId,
        studentName: invoice.studentName,
        admissionNumber: student?.admissionNumber || 'ADM-UNKNOWN',
        gradeName: student?.gradeName || 'Grade 6',
        sectionName: student?.sectionName || 'A',
        category: invoice.category,
        amountPaid: amount,
        paymentMode,
        totalAmount: invoice.totalAmount,
        discountAmount: invoice.discountAmount || 0,
        previousPaidAmount: previousPaid,
        remainingBalance: remainingAfter,
        status: newStatus,
        paidAt: new Date().toISOString(),
        authorizedSignatory: 'Accounts Officer, InnovatMind School OS'
      };

      paymentReceiptsList = [receipt, ...paymentReceiptsList];
      storage.setItem('school_os_payment_receipts', JSON.stringify(paymentReceiptsList));

      return {
        success: true,
        receiptNumber,
        receipt
      };
    },

    getInvoiceReceipt(invoiceNumberOrId) {
      return paymentReceiptsList.find(
        r => r.invoiceId === invoiceNumberOrId || r.invoiceNumber === invoiceNumberOrId || r.receiptNumber === invoiceNumberOrId
      );
    }
  };

  // ==========================================================================
  // MILESTONE 1: STUDENT ADMISSIONS
  // ==========================================================================
  await t.test('1. Student Admissions - Form validation, ID generation, and record creation', () => {
    // 1.1 Verify auto admission number generation
    const expectedYear = new Date().getFullYear();
    const nextAdm = schoolAdminService.generateNextAdmissionNumber(SCHOOL_1_ID);
    assert.match(nextAdm, new RegExp(`^ADM-${expectedYear}-\\d{3}$`), 'Admission number should follow ADM-YYYY-NNN format');
    assert.equal(nextAdm, `ADM-${expectedYear}-001`, 'Next sequential admission ID for new year should be 001');

    // 1.2 Reject if mandatory fields are missing
    assert.throws(
      () => schoolAdminService.addStudent({ firstName: '', lastName: 'Kumar' }),
      /Student first name is required/,
      'Should reject missing first name'
    );

    assert.throws(
      () => schoolAdminService.addStudent({ firstName: 'Rohan', lastName: '' }),
      /Student last name is required/,
      'Should reject missing last name'
    );

    assert.throws(
      () => schoolAdminService.addStudent({ firstName: 'Rohan', lastName: 'Kumar', parentName: '' }),
      /Parent\/Guardian full name is required/,
      'Should reject missing parent name'
    );

    assert.throws(
      () => schoolAdminService.addStudent({ firstName: 'Rohan', lastName: 'Kumar', parentName: 'Sunil Kumar', parentPhone: '' }),
      /Parent primary contact phone number is required/,
      'Should reject missing parent phone'
    );

    // 1.3 Successfully create valid student record
    const createdStudent = schoolAdminService.addStudent({
      schoolId: SCHOOL_1_ID,
      firstName: 'Kabir',
      lastName: 'Saxena',
      email: 'kabir.saxena@dps.edu',
      gradeId: 'grade-6',
      gradeName: 'Grade 6',
      sectionId: 'sec-6a',
      sectionName: 'A',
      parentName: 'Anil Saxena',
      parentPhone: '+91 98450 11223',
      parentEmail: 'anil.saxena@gmail.com',
      gender: 'MALE',
      dob: '2013-09-10',
      address: 'Pocket 4, Mayur Vihar, Delhi',
      rollNumber: '103',
      sessionId: 'sess-2025'
    });

    assert.ok(createdStudent.id, 'Created student must have an ID');
    assert.equal(createdStudent.schoolId, SCHOOL_1_ID, 'Student must be bound to school-1');
    assert.equal(createdStudent.gradeName, 'Grade 6');
    assert.equal(createdStudent.sectionName, 'A');
    assert.equal(createdStudent.admissionNumber, `ADM-${expectedYear}-001`);
    assert.equal(createdStudent.provisioningStatus, 'PROVISIONED');
    assert.equal(createdStudent.credentials.cadetId, `CADET-ADM-${expectedYear}-001`);
    assert.ok(createdStudent.credentials.temporaryPassword.startsWith('Cadet@'));

    // 1.4 Verify persistence in storage
    const persistedStudents = JSON.parse(storage.getItem('school_os_students'));
    const foundInStorage = persistedStudents.find(s => s.id === createdStudent.id);
    assert.ok(foundInStorage, 'Newly admitted student must persist in storage');
    assert.equal(foundInStorage.admissionNumber, createdStudent.admissionNumber);

    // 1.5 Verify associated initial invoice creation
    const persistedInvoices = JSON.parse(storage.getItem('school_os_invoices'));
    const admissionInvoice = persistedInvoices.find(i => i.studentId === createdStudent.id);
    assert.ok(admissionInvoice, 'Initial tuition & lab invoice must be generated');
    assert.equal(admissionInvoice.status, 'PENDING');
    assert.equal(admissionInvoice.totalAmount, 25000);
  });

  await t.test('2. Student Admissions - Deduplication and collision prevention', () => {
    // 2.1 Prevent duplicate admission number within school
    assert.throws(
      () => schoolAdminService.addStudent({
        schoolId: SCHOOL_1_ID,
        admissionNumber: 'ADM-2025-001', // Already belongs to Aarav Sharma
        firstName: 'Imposter',
        lastName: 'Student',
        parentName: 'Test Parent',
        parentPhone: '+91 99999 00000',
      }),
      /Duplicate admission number/,
      'Should reject duplicate admission number in the same school'
    );

    // 2.2 Prevent duplicate email address
    assert.throws(
      () => schoolAdminService.addStudent({
        schoolId: SCHOOL_1_ID,
        admissionNumber: 'ADM-2025-999',
        firstName: 'Duplicate',
        lastName: 'EmailUser',
        email: 'aarav.sharma@dps.edu', // Already registered
        parentName: 'Test Parent',
        parentPhone: '+91 99999 00000',
      }),
      /Duplicate email address/,
      'Should reject already registered student email address'
    );
  });

  // ==========================================================================
  // MILESTONE 2: ATTENDANCE MANAGEMENT
  // ==========================================================================
  await t.test('3. Attendance Management - Date, Grade, Section selection & scoped students', () => {
    const today = new Date().toISOString().split('T')[0];

    // 3.1 Fetch attendance for Grade 6 Section A
    const attendanceSummary = schoolAdminService.getAttendanceForDate('2025-05-10', 'Grade 6', 'A');
    assert.equal(attendanceSummary.totalStudents, 3, 'Should filter only Grade 6-A students of school-1 (Aarav, Diya, Kabir)');
    assert.equal(attendanceSummary.presentCount, 1, 'Aarav is present');
    assert.equal(attendanceSummary.absentCount, 1, 'Diya is absent');
    assert.equal(attendanceSummary.totalMarked, 2, '2 students had records seeded');

    // 3.2 Ensure school-2 students are never included in school-1 attendance
    const allRecordsForDate = attendanceSummary.records;
    const hasSchool2Student = allRecordsForDate.some(r => r.studentId === 'stud-sch2-1');
    assert.equal(hasSchool2Student, false, 'School 2 students must never leak into School 1 attendance');
  });

  await t.test('4. Attendance Management - Mark and update attendance with deduplication', () => {
    const targetDate = '2025-05-10';

    // 4.1 Mark Kabir as LATE
    const kabir = studentsList.find(s => s.firstName === 'Kabir');
    assert.ok(kabir);

    const markResult = schoolAdminService.markAttendance(kabir.id, 'LATE', targetDate, 'Traffic delay at bridge');
    assert.equal(markResult.status, 'LATE');
    assert.equal(markResult.studentId, kabir.id);

    // Verify record persistence
    let persistedRecords = JSON.parse(storage.getItem('school_os_attendance_records'));
    const kabirRecord = persistedRecords.find(r => r.studentId === kabir.id && r.date === targetDate);
    assert.ok(kabirRecord, 'Kabir attendance record must exist in storage');
    assert.equal(kabirRecord.status, 'LATE');

    // 4.2 Updating attendance for the same student on the same date should UPSERT, NOT DUPLICATE
    const initialRecordsCount = persistedRecords.filter(r => r.studentId === kabir.id && r.date === targetDate).length;
    assert.equal(initialRecordsCount, 1, 'Only one record should exist before update');

    schoolAdminService.markAttendance(kabir.id, 'PRESENT', targetDate, 'Updated by Admin: Medical slip provided');

    persistedRecords = JSON.parse(storage.getItem('school_os_attendance_records'));
    const recordsAfterUpdate = persistedRecords.filter(r => r.studentId === kabir.id && r.date === targetDate);
    assert.equal(recordsAfterUpdate.length, 1, 'Duplicate record must not be created on re-marking same date');
    assert.equal(recordsAfterUpdate[0].status, 'PRESENT', 'Status should be updated to PRESENT');
    assert.equal(recordsAfterUpdate[0].remarks, 'Updated by Admin: Medical slip provided');

    // 4.3 Verify recalculated summary metrics from actual saved data
    const updatedSummary = schoolAdminService.getAttendanceForDate(targetDate, 'Grade 6', 'A');
    assert.equal(updatedSummary.presentCount, 2, 'Aarav and Kabir are PRESENT');
    assert.equal(updatedSummary.absentCount, 1, 'Diya is ABSENT');
    assert.equal(updatedSummary.totalMarked, 3, 'All 3 Grade 6-A students marked');
    assert.equal(updatedSummary.attendanceRate, 67, '2/3 = ~67% calculated from real records');
  });

  await t.test('5. Attendance Management - Batch class attendance marking', () => {
    const batchDate = '2025-05-11';
    const batchPayload = [
      { studentId: 'stud-1', status: 'PRESENT', remarks: 'Roll call' },
      { studentId: 'stud-2', status: 'PRESENT', remarks: 'Roll call' },
    ];

    const results = schoolAdminService.markBatchAttendance(batchPayload, batchDate);
    assert.equal(results.length, 2);

    const batchSummary = schoolAdminService.getAttendanceForDate(batchDate, 'Grade 6', 'A');
    assert.equal(batchSummary.presentCount, 2);
    assert.equal(batchSummary.absentCount, 0);
    assert.equal(batchSummary.attendanceRate, 100);
  });

  // ==========================================================================
  // MILESTONE 3: FEES MANAGEMENT
  // ==========================================================================
  await t.test('6. Fees Management - Configured fee schedules and balance calculations', () => {
    // 6.1 Display configured fee structures for School 1
    const school1Structures = initialFeeStructures.filter(fs => fs.schoolId === SCHOOL_1_ID);
    assert.equal(school1Structures.length, 2, 'School 1 should have 2 grade fee structures configured');
    
    const gr6Structure = school1Structures.find(fs => fs.gradeName === 'Grade 6');
    assert.ok(gr6Structure);
    assert.equal(gr6Structure.tuitionFee, 48000);
    assert.equal(gr6Structure.stemLabFee, 15000);
    assert.equal(gr6Structure.totalAnnualFee, 85000);
    assert.equal(
      gr6Structure.tuitionFee + gr6Structure.stemLabFee + gr6Structure.examLibraryFee + gr6Structure.annualCharges,
      gr6Structure.totalAnnualFee,
      'Components must sum exactly to totalAnnualFee'
    );

    // 6.2 Check student balances calculation: (totalAmount - discountAmount) - paidAmount
    const inv2 = invoicesList.find(i => i.id === 'inv-2');
    assert.ok(inv2);
    const netPayable = inv2.totalAmount - inv2.discountAmount;
    const remainingBalance = netPayable - inv2.paidAmount;
    assert.equal(netPayable, 45000);
    assert.equal(remainingBalance, 25000, 'Remaining balance for Diya Patel should be 25,000');
    assert.equal(inv2.status, 'PARTIAL');
  });

  await t.test('7. Fees Management - Payment processing, overpayment rejection, and receipts', () => {
    const inv2 = invoicesList.find(i => i.id === 'inv-2');
    assert.ok(inv2);

    // 7.1 Reject payment with amount <= 0
    const zeroRes = schoolAdminService.payInvoice(inv2.id, 0, 'UPI');
    assert.equal(zeroRes.success, false);
    assert.match(zeroRes.error, /greater than zero/);

    // 7.2 Reject overpayment: amount > remainingBalance (remaining is 25000)
    const overpayRes = schoolAdminService.payInvoice(inv2.id, 30000, 'UPI');
    assert.equal(overpayRes.success, false);
    assert.match(overpayRes.error, /exceeds remaining balance/);

    // 7.3 Collect partial payment: ₹10,000
    const partialPaymentRes = schoolAdminService.payInvoice(inv2.id, 10000, 'UPI');
    assert.equal(partialPaymentRes.success, true);
    assert.ok(partialPaymentRes.receiptNumber);
    assert.equal(inv2.paidAmount, 30000, 'Paid amount should be 20000 + 10000 = 30000');
    assert.equal(inv2.status, 'PARTIAL', 'Status should remain PARTIAL');

    // Verify generated receipt
    const partialReceipt = partialPaymentRes.receipt;
    assert.ok(partialReceipt);
    assert.equal(partialReceipt.amountPaid, 10000);
    assert.equal(partialReceipt.previousPaidAmount, 20000);
    assert.equal(partialReceipt.remainingBalance, 15000);
    assert.equal(partialReceipt.paymentMode, 'UPI');
    assert.equal(partialReceipt.studentName, 'Diya Patel');
    assert.equal(partialReceipt.authorizedSignatory, 'Accounts Officer, InnovatMind School OS');

    // 7.4 Collect full settlement of remaining ₹15,000
    const fullSettlementRes = schoolAdminService.payInvoice(inv2.id, 15000, 'NET_BANKING');
    assert.equal(fullSettlementRes.success, true);
    assert.equal(inv2.paidAmount, 45000);
    assert.equal(inv2.status, 'PAID', 'Status must transition to PAID');

    const finalReceipt = fullSettlementRes.receipt;
    assert.equal(finalReceipt.amountPaid, 15000);
    assert.equal(finalReceipt.remainingBalance, 0, 'Remaining balance should be 0 on full settlement');
    assert.equal(finalReceipt.status, 'PAID');

    // 7.5 Retrieve receipt by invoice number
    const retrievedReceipt = schoolAdminService.getInvoiceReceipt(inv2.invoiceNumber);
    assert.ok(retrievedReceipt, 'Should retrieve stored receipt by invoice number');
    assert.equal(retrievedReceipt.invoiceNumber, inv2.invoiceNumber);
  });

  // ==========================================================================
  // MILESTONE 4: SECURITY & MULTI-TENANT ISOLATION
  // ==========================================================================
  await t.test('8. Security & Multi-Tenant Scoping - Strict boundary enforcement', () => {
    // 8.1 School Admin 1 cannot add student to School 2
    assert.throws(
      () => schoolAdminService.addStudent({
        schoolId: SCHOOL_2_ID, // Cross-tenant target
        firstName: 'Intruder',
        lastName: 'Student',
        parentName: 'Fake Parent',
        parentPhone: '+91 99999 11111'
      }),
      /Unauthorized cross-school admission/,
      'School Admin must be strictly barred from enrolling students into another school'
    );

    // 8.2 School Admin 1 cannot mark attendance for School 2 student
    assert.throws(
      () => schoolAdminService.markAttendance('stud-sch2-1', 'PRESENT', '2025-05-10'),
      /Unauthorized cross-school operation/,
      'School Admin must be barred from marking attendance for another school student'
    );

    // 8.3 School Admin 1 cannot collect payment on School 2 invoice
    const crossSchoolPay = schoolAdminService.payInvoice('inv-sch2-1', 10000, 'UPI');
    assert.equal(crossSchoolPay.success, false);
    assert.match(crossSchoolPay.error, /Unauthorized: Cannot collect payment for another school invoice/);
  });

});
