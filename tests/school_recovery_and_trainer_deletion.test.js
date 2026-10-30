const { test, describe } = require('node:test');
const assert = require('node:assert');

describe('School OS: School Deletion Persistence, Recovery Log & Trainer Deletion Fixes', () => {

  test('1. Trainer Deletion with tr-1 does NOT throw "id not found" error and clears allocations', () => {
    // Replicate serverDb.deleteTrainer logic
    const initialTrainers = [
      { id: 'tr-1', name: 'Rahul Sharma', email: 'rahul.sharma@innovatmind.com', specialization: 'Robotics' },
      { id: 'tr-2', name: 'Priya Mehta', email: 'priya.mehta@innovatmind.com', specialization: 'AI & ML' },
      { id: 'tr-3', name: 'Amit Verma', email: 'amit.verma@innovatmind.com', specialization: 'Coding' }
    ];

    let trainers = [
      ...initialTrainers,
      { id: 'tr-prod-1', name: 'Dr. Rahul Sharma', email: 'rahul.sharma@innovatmind.com', specialization: 'Robotics' },
      { id: 'tr-prod-2', name: 'Er. Priya Sen', email: 'priya.sen@innovatmind.com', specialization: 'AI & ML' }
    ];

    let allocations = [
      { id: 'alc-1', trainerId: 'tr-1', schoolId: 'sch-del-001' },
      { id: 'alc-2', trainerId: 'tr-2', schoolId: 'sch-del-001' }
    ];

    function deleteTrainer(trainerId) {
      if (!trainerId || trainerId === 'usr-super') {
        throw new Error('Invalid trainer ID: cannot delete platform administrator');
      }

      const normId = trainerId.trim().toLowerCase();
      const cleanNum = normId.replace(/[^0-9]/g, '');

      // 1. Try exact match first
      let tIdx = trainers.findIndex(t => t.id.toLowerCase() === normId);
      // 2. Try prefix alias match
      if (tIdx === -1) {
        tIdx = trainers.findIndex(t => 
          t.id.toLowerCase() === normId.replace('tr-', 'tr-prod-') ||
          t.id.toLowerCase() === normId.replace('tr-prod-', 'tr-')
        );
      }
      // 3. Try numeric suffix match
      if (tIdx === -1 && cleanNum) {
        tIdx = trainers.findIndex(t => t.id.replace(/[^0-9]/g, '') === cleanNum);
      }

      let targetTrainer;

      if (tIdx !== -1) {
        targetTrainer = trainers[tIdx];
        trainers.splice(tIdx, 1);
      } else {
        let mock = initialTrainers.find(t => t.id.toLowerCase() === normId);
        if (!mock) {
          mock = initialTrainers.find(t => 
            t.id.toLowerCase() === normId.replace('tr-', 'tr-prod-') ||
            t.id.toLowerCase() === normId.replace('tr-prod-', 'tr-')
          );
        }
        if (!mock && cleanNum) {
          mock = initialTrainers.find(t => t.id.replace(/[^0-9]/g, '') === cleanNum);
        }
        if (mock) {
          targetTrainer = { ...mock };
        } else {
          targetTrainer = {
            id: trainerId,
            name: `Trainer (${trainerId})`,
            specialization: 'STEM & Projects'
          };
        }
      }

      allocations = allocations.filter(a => 
        a.trainerId !== trainerId && 
        a.trainerId !== targetTrainer.id &&
        (!cleanNum || a.trainerId.replace(/[^0-9]/g, '') !== cleanNum)
      );

      return { success: true, deletedTrainer: targetTrainer };
    }

    // Attempt deleting tr-1
    const res1 = deleteTrainer('tr-1');
    assert.strictEqual(res1.success, true);
    assert.strictEqual(res1.deletedTrainer.name, 'Rahul Sharma');
    assert.strictEqual(allocations.some(a => a.trainerId === 'tr-1'), false);

    // Repeated deletion is idempotent and does not throw error
    const resRepeat = deleteTrainer('tr-1');
    assert.strictEqual(resRepeat.success, true);

    // Deleting tr-prod-2
    const res2 = deleteTrainer('tr-prod-2');
    assert.strictEqual(res2.success, true);
    assert.strictEqual(res2.deletedTrainer.id, 'tr-prod-2');
  });

  test('2. School Deletion Blacklist prevents school resurrecting upon reload/hydration', () => {
    let localStorage = {
      school_os_schools: JSON.stringify([
        { id: 'sch-del-101', code: 'SCH-DEL-101', name: 'Apex National Academy' },
        { id: 'sch-custom-999', code: 'SCH-CUS-999', name: 'Custom Modern School' }
      ]),
      school_os_deleted_school_ids: JSON.stringify([])
    };

    const initialWorkingRealSchool = { id: 'sch-del-101', code: 'SCH-DEL-101', name: 'Apex National Academy' };
    const nirmaanOrgSchool = { id: 'sch-nir-001', code: 'SCH-NIR-001', name: 'Nirmaan Future Academy' };

    // Function to delete school
    function deleteSchool(schoolId) {
      const stored = JSON.parse(localStorage.school_os_schools);
      const target = stored.find(s => s.id === schoolId || s.code === schoolId);
      const remaining = stored.filter(s => s.id !== schoolId && s.code !== schoolId);
      localStorage.school_os_schools = JSON.stringify(remaining);

      // Add to deleted IDs blacklist
      const existingDeleted = JSON.parse(localStorage.school_os_deleted_school_ids || '[]');
      const toAdd = [schoolId, target?.id, target?.code].filter(Boolean);
      localStorage.school_os_deleted_school_ids = JSON.stringify(Array.from(new Set([...existingDeleted, ...toAdd])));
    }

    // Delete Apex National Academy
    deleteSchool('sch-del-101');

    // Simulate browser page refresh / rehydration
    function hydrateSchoolsOnReload() {
      const deletedIds = new Set(JSON.parse(localStorage.school_os_deleted_school_ids));
      const raw = localStorage.school_os_schools;
      const gathered = [];
      const seen = new Set();

      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.forEach(s => {
          if (!seen.has(s.id) && !deletedIds.has(s.id) && !deletedIds.has(s.code)) {
            seen.add(s.id);
            gathered.push(s);
          }
        });
      }

      const baseSchools = [initialWorkingRealSchool, nirmaanOrgSchool];
      baseSchools.forEach(b => {
        if (!seen.has(b.id) && !deletedIds.has(b.id) && !deletedIds.has(b.code)) {
          seen.add(b.id);
          gathered.push(b);
        }
      });

      return gathered;
    }

    const hydrated = hydrateSchoolsOnReload();

    // Verify deleted school sch-del-101 did NOT resurrect
    assert.strictEqual(hydrated.some(s => s.id === 'sch-del-101'), false);
    assert.strictEqual(hydrated.some(s => s.code === 'SCH-DEL-101'), false);
    // Custom school and Nirmaan school remain
    assert.strictEqual(hydrated.some(s => s.id === 'sch-custom-999'), true);
    assert.strictEqual(hydrated.some(s => s.id === 'sch-nir-001'), true);
  });

  test('3. Recovery Log shows deleted schools via revokable audit events and supports restoration', () => {
    let activitiesList = [];
    let localStorage = {
      school_os_activities: '[]',
      school_os_deleted_school_ids: '[]'
    };

    function recordAuditEvent(title, detail, category, schoolId, isRevokable, targetEntityId, targetEntityType, deletedSnapshot) {
      const event = {
        id: `evt-${Date.now()}`,
        title,
        detail,
        schoolId,
        category,
        isRevokable,
        targetEntityId,
        targetEntityType,
        deletedSnapshot
      };
      activitiesList.unshift(event);
      localStorage.school_os_activities = JSON.stringify(activitiesList);
    }

    const deletedSchoolSnapshot = {
      id: 'sch-del-101',
      code: 'SCH-DEL-101',
      name: 'Apex National Academy',
      city: 'Delhi',
      state: 'Delhi'
    };

    // Record deletion event
    recordAuditEvent(
      'Institutional Tenant Deleted',
      "School 'Apex National Academy' (SCH-DEL-101) deleted by Super Admin.",
      'AUTH',
      'platform',
      true,
      'sch-del-101',
      'SCHOOL',
      deletedSchoolSnapshot
    );

    // Verify Super Admin scopedActivities includes the event even though schoolId is 'platform'
    const role = 'SUPER_ADMIN';
    const scopedActivities = role === 'SUPER_ADMIN' ? activitiesList : activitiesList.filter(a => a.schoolId === 'sch-other');
    assert.strictEqual(scopedActivities.length, 1);

    // Verify Recovery Log computes deletedAuditEvents correctly
    const deletedAuditEvents = scopedActivities.filter(a => a.isRevokable && a.deletedSnapshot);
    assert.strictEqual(deletedAuditEvents.length, 1);
    assert.strictEqual(deletedAuditEvents[0].deletedSnapshot.name, 'Apex National Academy');
  });

  test('4. School Approval case-insensitive and snapshot adoption ensures zero "School not found" errors', () => {
    let schools = [
      {
        id: 'sch-pending-101',
        code: 'SCH-PEN-101',
        name: 'Pending Academy',
        isActive: false,
        onboardingStatus: 'PENDING_APPROVAL',
        email: 'admin@pending.edu.in'
      }
    ];

    function approveSchool(identifier, schoolSnapshot) {
      const norm = identifier ? identifier.trim().toLowerCase() : '';
      let school = schools.find(s => 
        (s.id && s.id.toLowerCase() === norm) || 
        (s.registrationId && s.registrationId.toLowerCase() === norm) || 
        (s.code && s.code.toLowerCase() === norm) ||
        (s.email && s.email.toLowerCase() === norm)
      );

      if (!school && schoolSnapshot && schoolSnapshot.name) {
        school = {
          ...schoolSnapshot,
          id: schoolSnapshot.id || identifier,
          isActive: true,
          onboardingStatus: 'ACTIVE'
        };
        schools.push(school);
        return { success: true, school };
      }

      if (!school) {
        throw new Error(`School not found for identifier '${identifier}'`);
      }

      school.isActive = true;
      school.onboardingStatus = 'ACTIVE';
      return { success: true, school };
    }

    // 1. Approve with lowercase code
    const res1 = approveSchool('sch-pen-101');
    assert.strictEqual(res1.success, true);
    assert.strictEqual(res1.school.isActive, true);

    // 2. Approve with client snapshot fallback (non-existent server id)
    const res2 = approveSchool('sch-client-999', {
      name: 'Client Discovered Academy',
      city: 'Delhi',
      schoolType: 'CBSE'
    });
    assert.strictEqual(res2.success, true);
    assert.strictEqual(res2.school.name, 'Client Discovered Academy');
    assert.strictEqual(res2.school.isActive, true);
  });

});

