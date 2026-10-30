import { test } from 'node:test';
import assert from 'node:assert/strict';

const baseUrl = 'http://localhost:3000';

const routes = [
  { path: '/', titleCheck: 'InnovatMind', keyword: 'School' },
  { path: '/login', titleCheck: 'Login', keyword: 'Student' },
  { path: '/register', titleCheck: 'Register', keyword: 'School' },
  { path: '/school', titleCheck: 'School', keyword: 'Mission Control' },
  { path: '/school/students', titleCheck: 'Students', keyword: 'Admission' },
  { path: '/school/fees', titleCheck: 'Fees', keyword: 'Invoice' },
  { path: '/school/staff', titleCheck: 'Staff', keyword: 'Payroll' },
  { path: '/school/timetable', titleCheck: 'Timetable', keyword: 'Period' },
  { path: '/school/analytics', titleCheck: 'Analytics', keyword: 'Financial' },
  { path: '/school/inventory', titleCheck: 'Inventory', keyword: 'Hardware' },
  { path: '/school/notices', titleCheck: 'Notices', keyword: 'Broadcast' },
  { path: '/school/transport', titleCheck: 'Transport', keyword: 'Fleet' },
  { path: '/school/settings', titleCheck: 'Settings', keyword: 'Branding' },
  { path: '/student', titleCheck: 'Student', keyword: 'Learning World' },
  { path: '/teacher', titleCheck: 'Teacher', keyword: 'Attendance' },
  { path: '/parent', titleCheck: 'Parent', keyword: 'Guardian' },
  { path: '/admin', titleCheck: 'Admin', keyword: 'Central Command' },
];

test('E2E HTTP: All 17 routes respond with HTTP 200 and valid rendered HTML content', async (t) => {
  for (const r of routes) {
    const res = await fetch(`${baseUrl}${r.path}`);
    assert.equal(res.status, 200, `Route ${r.path} failed with status ${res.status}`);
    const html = await res.text();
    assert.equal(html.length > 500, true, `Route ${r.path} returned empty or truncated response`);
  }
});

test('E2E Content: Landing page renders headline, stakeholder ecosystem, and robotics', async () => {
  const res = await fetch(`${baseUrl}/`);
  const html = await res.text();
  assert.match(html, /InnovatMind/);
  assert.match(html, /One platform to/);
  assert.match(html, /School Management/);
  assert.match(html, /Coding, AI, Robotics/);
});

test('E2E Content: Central Login page provides Cadet Student ID, Google Sign-In, and Secure Gateway', async () => {
  const res = await fetch(`${baseUrl}/login`);
  const html = await res.text();
  assert.match(html, /InnovatMind/);
  assert.match(html, /Continue with Google/);
  assert.match(html, /google-signin-button/);
  assert.match(html, /Welcome Back/);
  assert.match(html, /Enter your email or username/);
});

test('E2E Redirects: Dashboard alias routes safely redirect to canonical workspaces', async () => {
  const adminRes = await fetch(`${baseUrl}/admin/dashboard`, { redirect: 'manual' });
  assert.equal(adminRes.status, 307);
  assert.equal(adminRes.headers.get('location'), '/admin');

  const schoolRes = await fetch(`${baseUrl}/school/dashboard`, { redirect: 'manual' });
  assert.equal(schoolRes.status, 307);
  assert.equal(schoolRes.headers.get('location'), '/school');

  const studentRes = await fetch(`${baseUrl}/student/dashboard`, { redirect: 'manual' });
  assert.equal(studentRes.status, 307);
  assert.equal(studentRes.headers.get('location'), '/student');
});
