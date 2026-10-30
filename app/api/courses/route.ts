import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/db/server-db';
import { authenticateRequest, authorizeRole } from '@/lib/auth/server-guard';

export async function GET(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const roleAuth = authorizeRole(auth, ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT']);
    if (roleAuth) return roleAuth;

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const analytics = searchParams.get('analytics');
    const curriculum = searchParams.get('curriculum');

    if (courseId && curriculum === 'true') {
      const lectures = await serverDb.getCourseCurriculum(courseId);
      return NextResponse.json({ courseId, lectures });
    }

    if (courseId && analytics === 'true') {
      const data = await serverDb.getCourseAnalytics(courseId);
      return NextResponse.json({ analytics: data });
    }

    if (courseId) {
      const course = await serverDb.getCourseById(courseId);
      if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      return NextResponse.json({ course });
    }

    const [courses, pricingRules, assignments] = await Promise.all([
      serverDb.getCourses(),
      serverDb.getPricingRules(),
      serverDb.getSchoolCourseAssignments()
    ]);

    // If School Admin, Teacher, or Student, they can see catalog and school assignments
    return NextResponse.json({ courses, pricingRules, assignments });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch course catalog' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const roleAuth = authorizeRole(auth, ['SUPER_ADMIN']);
    if (roleAuth) return roleAuth;

    const body = await req.json();
    const { action, courseId, folderId, folderName, grade, lectures, ...courseData } = body;

    if (action === 'duplicate' && courseId) {
      const duplicated = await serverDb.duplicateCourse(courseId);
      return NextResponse.json({ success: true, course: duplicated, message: 'Course duplicated successfully' }, { status: 201 });
    }

    if (action === 'map_drive_folder' && courseId && folderId) {
      const result = await serverDb.mapDriveFolderToCourse(courseId, folderId, folderName);
      return NextResponse.json({ success: true, course: result.course, mappedCount: result.mappedCount, message: `Successfully mapped Google Drive folder to all 30 lectures` });
    }

    if (action === 'bulk_update_lectures' && courseId && Array.isArray(lectures)) {
      const updatedCourse = await serverDb.bulkUpdateCourseLectures(courseId, lectures);
      return NextResponse.json({ success: true, course: updatedCourse, message: `Successfully updated ${lectures.length} curriculum lectures` });
    }

    const newCourse = await serverDb.createCourse(courseData);
    return NextResponse.json({ success: true, course: newCourse, message: 'Course created successfully' }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create course' }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const roleAuth = authorizeRole(auth, ['SUPER_ADMIN']);
    if (roleAuth) return roleAuth;

    const body = await req.json();
    const { courseId, action, ...updates } = body;

    if (!courseId) {
      return NextResponse.json({ error: 'Missing required field: courseId' }, { status: 400 });
    }

    if (action === 'archive') {
      const archived = await serverDb.archiveCourse(courseId, true);
      return NextResponse.json({ success: true, course: archived, message: 'Course archived successfully' });
    }

    if (action === 'unarchive') {
      const unarchived = await serverDb.archiveCourse(courseId, false);
      return NextResponse.json({ success: true, course: unarchived, message: 'Course restored from archive' });
    }

    if (action === 'publish') {
      const published = await serverDb.toggleCoursePublish(courseId, true);
      return NextResponse.json({ success: true, course: published, message: 'Course published to catalog' });
    }

    if (action === 'unpublish') {
      const unpublished = await serverDb.toggleCoursePublish(courseId, false);
      return NextResponse.json({ success: true, course: unpublished, message: 'Course moved to draft' });
    }

    const updated = await serverDb.updateCourse(courseId, updates);
    return NextResponse.json({ success: true, course: updated, message: 'Course updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update course' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const roleAuth = authorizeRole(auth, ['SUPER_ADMIN']);
    if (roleAuth) return roleAuth;

    const { searchParams } = new URL(req.url);
    let courseId = searchParams.get('courseId');
    const force = searchParams.get('force') === 'true';

    if (!courseId) {
      try {
        const body = await req.json();
        courseId = body.courseId;
      } catch {}
    }

    if (!courseId) {
      return NextResponse.json({ error: 'Missing required parameter: courseId' }, { status: 400 });
    }

    const result = await serverDb.deleteCourse(courseId, force);
    return NextResponse.json({
      success: true,
      deletedCourse: result.deletedCourse,
      affectedAssignments: result.affectedAssignments,
      message: `Course '${result.deletedCourse.title}' was successfully deleted.`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete course' }, { status: 400 });
  }
}
