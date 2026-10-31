import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * InnovatMind School OS — Trainer Onboarding & Notification Verification
 */

class MockServerDatabase {
  constructor() {
    this.trainers = [
      { id: 'tr-1', name: 'Rahul Sharma', email: 'rahul@innovatmind.com', phone: '+91 99999 11111', specialization: 'Robotics', status: 'ACTIVE', experienceYears: 3, maxWorkloadHours: 40, rating: 5.0 },
      { id: 'tr-2', name: 'Priya Patel', email: 'priya@innovatmind.com', phone: '+91 99999 22222', specialization: 'AI & ML', status: 'ACTIVE', experienceYears: 5, maxWorkloadHours: 35, rating: 4.9 }
    ];
    this.deletedTrainersArchive = new Map();
  }

  async getTrainers() {
    return [...this.trainers];
  }

  async createTrainer(data) {
    if (!data.name || !data.name.trim()) {
      throw new Error('Trainer name is required');
    }
    if (!data.email || !data.email.trim()) {
      throw new Error('Trainer email is required');
    }

    const normEmail = data.email.trim().toLowerCase();
    const existing = this.trainers.find(t => t.email.toLowerCase() === normEmail);
    if (existing) {
      throw new Error(`A trainer with email '${data.email}' already exists on the roster.`);
    }

    const trainerId = data.id || `tr-${Date.now()}`;
    const newTrainer = {
      id: trainerId,
      name: data.name.trim(),
      email: normEmail,
      phone: data.phone?.trim() || '+91 99999 00000',
      avatarUrl: data.avatarUrl?.trim(),
      specialization: data.specialization || 'Robotics',
      experienceYears: Number(data.experienceYears) || 1,
      status: data.status || 'ACTIVE',
      assignedSchoolIds: data.assignedSchoolIds || [],
      assignedSchoolsCount: data.assignedSchoolIds?.length || 0,
      maxWorkloadHours: Number(data.maxWorkloadHours) || 40,
      currentWorkloadHours: 0,
      totalStudentsMentored: 0,
      rating: Number(data.rating) || 5.0,
      joinDate: data.joinDate || new Date().toISOString().split('T')[0]
    };

    this.deletedTrainersArchive.delete(newTrainer.id);
    this.deletedTrainersArchive.delete(newTrainer.name);

    this.trainers.unshift(newTrainer);
    return { success: true, trainer: newTrainer };
  }

  async deleteTrainer(trainerId) {
    const normId = trainerId.trim().toLowerCase();
    const idx = this.trainers.findIndex(t => t.id.toLowerCase() === normId);
    if (idx === -1) throw new Error('Trainer not found');

    const target = this.trainers[idx];
    this.trainers.splice(idx, 1);
    this.deletedTrainersArchive.set(target.id, target);
    this.deletedTrainersArchive.set(target.name, target);

    return { success: true, deletedTrainer: target };
  }
}

test('=== TRAINER ONBOARDING & NOTIFICATION SYSTEM VERIFICATION ===', async (t) => {
  const db = new MockServerDatabase();
  const testEmail = `trainer.kalpana.${Date.now()}@innovatmind.com`;
  let onboardedTrainerId = '';

  await t.test('1. Super Admin can onboard a new specialist trainer', async () => {
    const res = await db.createTrainer({
      name: 'Dr. Kalpana Chawla',
      email: testEmail,
      phone: '+91 98765 00001',
      specialization: 'Robotics',
      experienceYears: 7,
      maxWorkloadHours: 35,
      status: 'ACTIVE'
    });

    assert.equal(res.success, true);
    assert.ok(res.trainer.id);
    assert.equal(res.trainer.name, 'Dr. Kalpana Chawla');
    assert.equal(res.trainer.email, testEmail);
    assert.equal(res.trainer.specialization, 'Robotics');
    assert.equal(res.trainer.maxWorkloadHours, 35);
    assert.equal(res.trainer.rating, 5.0);

    onboardedTrainerId = res.trainer.id;

    // Verify it appears in active trainers list
    const activeTrainers = await db.getTrainers();
    const found = activeTrainers.find(t => t.id === onboardedTrainerId);
    assert.ok(found, 'Onboarded trainer must appear in active roster');
    assert.equal(activeTrainers.length, 3);
  });

  await t.test('2. Prevents duplicate trainer onboarding with existing email', async () => {
    await assert.rejects(
      async () => {
        await db.createTrainer({
          name: 'Duplicate Kalpana',
          email: testEmail,
          phone: '+91 98765 00002',
          specialization: 'AI & ML'
        });
      },
      /already exists on the roster/
    );
  });

  await t.test('3. Enforces required fields for trainer onboarding', async () => {
    await assert.rejects(
      async () => {
        await db.createTrainer({
          name: '',
          email: 'no.name@innovatmind.com'
        });
      },
      /Trainer name is required/
    );

    await assert.rejects(
      async () => {
        await db.createTrainer({
          name: 'No Email Trainer',
          email: ''
        });
      },
      /Trainer email is required/
    );
  });

  await t.test('4. Safely deletes onboarded trainer and persists to archive', async () => {
    const delRes = await db.deleteTrainer(onboardedTrainerId);
    assert.equal(delRes.success, true);
    assert.equal(delRes.deletedTrainer.id, onboardedTrainerId);

    // Verify archive records deletion
    assert.ok(db.deletedTrainersArchive.has(onboardedTrainerId));

    // Verify active roster no longer lists the trainer
    const activeTrainers = await db.getTrainers();
    assert.ok(!activeTrainers.some(t => t.id === onboardedTrainerId));
    assert.equal(activeTrainers.length, 2);
  });

  await t.test('5. Re-onboarding a previously deleted trainer clears the archive', async () => {
    const reOnboardRes = await db.createTrainer({
      id: onboardedTrainerId,
      name: 'Dr. Kalpana Chawla Reborn',
      email: `reborn.${Date.now()}@innovatmind.com`,
      phone: '+91 98765 00003',
      specialization: 'AI & ML'
    });

    assert.equal(reOnboardRes.success, true);
    assert.ok(!db.deletedTrainersArchive.has(onboardedTrainerId), 'Deletion archive must be cleared upon re-onboarding');

    const activeTrainers = await db.getTrainers();
    assert.ok(activeTrainers.some(t => t.id === onboardedTrainerId));
    assert.equal(activeTrainers.length, 3);
  });

  await t.test('6. Notification popover unread items calculation & mark read mechanism', async () => {
    const sampleNotices = [
      { id: 'not-1', title: 'Emergency Drill', messageContent: 'Annual safety drill', priority: 'URGENT', sentAt: 'Today' },
      { id: 'not-2', title: 'Holiday Circular', messageContent: 'School closed tomorrow', priority: 'HOLIDAY', sentAt: 'Yesterday' }
    ];
    const sampleActivities = [
      { id: 'act-1', title: 'Trainer Onboarded', detail: 'Dr. Kalpana Chawla joined', category: 'STEM', time: 'Just now' }
    ];

    let readItemIds = new Set();

    const getUnreadCount = () => {
      const items = [
        ...sampleNotices.map(n => `notif-notice-${n.id}`),
        ...sampleActivities.map(a => `notif-act-${a.id}`)
      ];
      return items.filter(id => !readItemIds.has(id)).length;
    };

    assert.equal(getUnreadCount(), 3, 'Initial unread count must be 3');

    // Mark single item read
    readItemIds.add('notif-notice-not-1');
    assert.equal(getUnreadCount(), 2, 'Unread count must decrease to 2');

    // Mark all as read
    sampleNotices.forEach(n => readItemIds.add(`notif-notice-${n.id}`));
    sampleActivities.forEach(a => readItemIds.add(`notif-act-${a.id}`));
    assert.equal(getUnreadCount(), 0, 'Unread count must be 0 when all marked read');
  });

});
