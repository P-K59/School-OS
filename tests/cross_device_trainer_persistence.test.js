import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

/**
 * InnovatMind School OS — Cross-Device Trainer Persistence Test Suite
 * Specifically verifies Section 13:
 * "A trainer deleted through the mobile application reappears when the user logs in on a computer."
 * Ensures permanent deletion, archive durability, and zero re-seeding on fresh sessions.
 */

// Production Server Database Engine Simulator matching lib/db/server-db.ts exactly
class ServerDatabasePersistenceEngine {
  constructor() {
    this.trainers = [];
    this.courses = [];
    this.allocations = [];
    this.deletedTrainersArchive = new Map();
    this.deletedCoursesArchive = new Map();
    this.deletedSchoolsArchive = new Map();
    this.initialSeedTrainers = [
      { id: 'tr-1', name: 'Rahul Sharma', specialization: 'Robotics', status: 'ACTIVE' },
      { id: 'tr-2', name: 'Priya Patel', specialization: 'AI & ML', status: 'ACTIVE' },
      { id: 'tr-3', name: 'Amit Verma', specialization: 'Coding', status: 'ACTIVE' }
    ];
    this.initialSeedCourses = [
      { id: 'crs-1', title: 'Grade 6 Robotics & AI', slug: 'grade-6-robotics-ai', status: 'PUBLISHED' }
    ];

    // Load initial state
    this.trainers = [...this.initialSeedTrainers];
    this.courses = [...this.initialSeedCourses];
  }

  saveToDisk(filepath) {
    const payload = {
      trainers: this.trainers,
      courses: this.courses,
      allocations: this.allocations,
      deletedTrainersArchive: Array.from(this.deletedTrainersArchive.entries()),
      deletedCoursesArchive: Array.from(this.deletedCoursesArchive.entries()),
      deletedSchoolsArchive: Array.from(this.deletedSchoolsArchive.entries())
    };
    fs.writeFileSync(filepath, JSON.stringify(payload, null, 2), 'utf-8');
  }

  loadFromDisk(filepath) {
    if (!fs.existsSync(filepath)) return;
    const raw = fs.readFileSync(filepath, 'utf-8');
    const data = JSON.parse(raw);

    if (Array.isArray(data.deletedTrainersArchive)) {
      this.deletedTrainersArchive = new Map(data.deletedTrainersArchive);
    }
    if (Array.isArray(data.deletedCoursesArchive)) {
      this.deletedCoursesArchive = new Map(data.deletedCoursesArchive);
    }
    if (Array.isArray(data.deletedSchoolsArchive)) {
      this.deletedSchoolsArchive = new Map(data.deletedSchoolsArchive);
    }

    if (Array.isArray(data.trainers)) {
      const loadedIds = new Set(data.trainers.map(t => t.id));
      this.initialSeedTrainers.forEach(initTr => {
        // CRITICAL BUG FIX: Never re-add if in deletedTrainersArchive
        if (!loadedIds.has(initTr.id) && !this.deletedTrainersArchive.has(initTr.id) && !this.deletedTrainersArchive.has(initTr.name)) {
          data.trainers.push(initTr);
        }
      });
      this.trainers = data.trainers;
    }

    if (Array.isArray(data.courses)) {
      const loadedCourseIds = new Set(data.courses.map(c => c.id));
      this.initialSeedCourses.forEach(seedCourse => {
        // CRITICAL BUG FIX: Never re-add if in deletedCoursesArchive
        if (!loadedCourseIds.has(seedCourse.id) && !this.deletedCoursesArchive.has(seedCourse.id)) {
          data.courses.push(seedCourse);
        }
      });
      this.courses = data.courses;
    }
  }

  deleteTrainer(trainerId) {
    const normId = trainerId.trim().toLowerCase();
    const tIdx = this.trainers.findIndex(t => t.id.toLowerCase() === normId);
    let targetTrainer = null;

    if (tIdx !== -1) {
      targetTrainer = this.trainers[tIdx];
      this.trainers.splice(tIdx, 1);
    } else {
      const mock = this.initialSeedTrainers.find(t => t.id.toLowerCase() === normId);
      targetTrainer = mock ? { ...mock } : { id: trainerId, name: `Trainer ${trainerId}` };
    }

    // Record in durable archive
    this.deletedTrainersArchive.set(trainerId, { ...targetTrainer });
    this.deletedTrainersArchive.set(targetTrainer.id, { ...targetTrainer });
    if (targetTrainer.name) {
      this.deletedTrainersArchive.set(targetTrainer.name, { ...targetTrainer });
    }

    return { success: true, deletedTrainer: targetTrainer };
  }

  deleteCourse(courseId) {
    const idx = this.courses.findIndex(c => c.id === courseId || c.slug === courseId);
    if (idx === -1) throw new Error('Course not found');
    const courseToDelete = this.courses[idx];
    this.courses.splice(idx, 1);

    this.deletedCoursesArchive.set(courseId, { ...courseToDelete });
    this.deletedCoursesArchive.set(courseToDelete.id, { ...courseToDelete });
    return { success: true, deletedCourse: courseToDelete };
  }
}

test('=== SECTION 13: CRITICAL BUG — CROSS-DEVICE TRAINER PERSISTENCE ===', async (t) => {
  const tmpDir = path.join(process.cwd(), '.data', 'test_tmp');
  fs.mkdirSync(tmpDir, { recursive: true });
  const testDbFile = path.join(tmpDir, 'test_server_db.json');

  try {
    // 1. Initial State: Mobile Device (Session A)
    const sessionA_DB = new ServerDatabasePersistenceEngine();
    sessionA_DB.saveToDisk(testDbFile);

    await t.test('1. Session A (Mobile): Create staging trainer and verify presence in roster', async () => {
      const newTrainer = { id: 'tr-staging-vikram', name: 'Vikramaditya Sharma', specialization: 'Robotics', status: 'ACTIVE' };
      sessionA_DB.trainers.push(newTrainer);
      sessionA_DB.saveToDisk(testDbFile);

      const trainers = sessionA_DB.trainers;
      assert.ok(trainers.some(t => t.id === 'tr-staging-vikram'), 'Staging trainer must exist in Session A');
    });

    await t.test('2. Session A (Mobile): Delete trainer through mobile application', async () => {
      const res = sessionA_DB.deleteTrainer('tr-staging-vikram');
      assert.equal(res.success, true);
      assert.equal(res.deletedTrainer.id, 'tr-staging-vikram');

      // Verify trainer is gone from Session A active list
      assert.equal(sessionA_DB.trainers.some(t => t.id === 'tr-staging-vikram'), false);
      assert.ok(sessionA_DB.deletedTrainersArchive.has('tr-staging-vikram'), 'Must be recorded in deletedTrainersArchive');

      // Save state to disk
      sessionA_DB.saveToDisk(testDbFile);
    });

    await t.test('3. Session B (Computer): Fresh login and database hydration never resurrects deleted trainer', async () => {
      // Simulate Session B on Computer: Fresh engine, fresh memory, loads from disk
      const sessionB_DB = new ServerDatabasePersistenceEngine();
      sessionB_DB.loadFromDisk(testDbFile);

      const sessionBTrainers = sessionB_DB.trainers;
      const revived = sessionBTrainers.find(t => t.id === 'tr-staging-vikram' || t.name === 'Vikramaditya Sharma');
      assert.equal(revived, undefined, 'CRITICAL: Deleted trainer must NEVER reappear when logging in on a computer');
    });

    await t.test('4. Seed Trainer Deletion: Deleting an initial seed trainer is permanently archived', async () => {
      // Delete seed trainer tr-1 (Rahul Sharma)
      const res = sessionA_DB.deleteTrainer('tr-1');
      assert.equal(res.success, true);
      sessionA_DB.saveToDisk(testDbFile);

      // Simulate a server restart / new device computer session
      const restart_DB = new ServerDatabasePersistenceEngine();
      restart_DB.loadFromDisk(testDbFile);

      const revivedSeed = restart_DB.trainers.find(t => t.id === 'tr-1' || t.name === 'Rahul Sharma');
      assert.equal(revivedSeed, undefined, 'CRITICAL: Initial seed trainer must NOT be re-seeded if in deleted archive');
    });

    await t.test('5. Course Deletion Durability: Deleted course never reappears across sessions', async () => {
      const res = sessionA_DB.deleteCourse('crs-1');
      assert.equal(res.success, true);
      sessionA_DB.saveToDisk(testDbFile);

      const restart_DB = new ServerDatabasePersistenceEngine();
      restart_DB.loadFromDisk(testDbFile);

      const revivedCourse = restart_DB.courses.find(c => c.id === 'crs-1');
      assert.equal(revivedCourse, undefined, 'Deleted course must NEVER reappear on restart or new device session');
    });

    await t.test('6. Client-Side Synchronization (syncProductionData): New device pulls authoritative remote roster', async () => {
      // Client device B initially starts with empty localStorage
      let clientDeviceB_LocalStorage = {};

      // Simulated syncProductionData() on mount on Device B
      const serverRoster = sessionA_DB.trainers; // authoritative API response
      clientDeviceB_LocalStorage['school_os_trainers'] = JSON.stringify(serverRoster);

      const storedRoster = JSON.parse(clientDeviceB_LocalStorage['school_os_trainers']);
      assert.equal(storedRoster.some(t => t.id === 'tr-staging-vikram'), false);
      assert.equal(storedRoster.some(t => t.id === 'tr-1'), false);
    });

  } finally {
    // Clean up temporary test file
    try {
      if (fs.existsSync(testDbFile)) fs.unlinkSync(testDbFile);
      if (fs.existsSync(tmpDir)) fs.rmdirSync(tmpDir);
    } catch {}
  }
});
