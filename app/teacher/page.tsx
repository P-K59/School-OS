"use client";

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth/context';
import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  BookOpen,
  Calendar,
  GraduationCap,
  CheckCircle2,
  Clock,
  ClipboardList,
  CheckSquare,
  AlertCircle,
  Sparkles,
  Layers,
  Sliders,
  Check,
  UserCheck,
  Building,
  Mail,
  User
} from 'lucide-react';

export default function TeacherPortal() {
  const {
    currentUser: user,
    activeSchool,
    staff,
    teacherTasks,
    updateTeacherTaskStatus,
    students,
    attendanceRecords,
    markAttendance
  } = useAuth();

  // Find this teacher's staff profile
  const teacherProfile = useMemo(() => {
    if (!user) return null;
    return staff.find(
      s => s.email.toLowerCase() === user.email.toLowerCase() ||
           s.name.toLowerCase() === `${user.firstName} ${user.lastName}`.toLowerCase()
    ) || staff[0];
  }, [user, staff]);

  // Teacher's assigned tasks
  const myTasks = useMemo(() => {
    if (!teacherProfile && !user) return teacherTasks;
    return teacherTasks.filter(
      t => (teacherProfile && t.teacherId === teacherProfile.id) ||
           (user && t.teacherEmail?.toLowerCase() === user.email.toLowerCase())
    );
  }, [teacherTasks, teacherProfile, user]);

  const assignedGrades = teacherProfile?.assignedGrades || ['Grade 6', 'Grade 7', 'Grade 8'];
  const assignedSubjects = teacherProfile?.assignedSubjects || ['Computer Science & AI', 'Robotics & STEM'];
  const permissions = teacherProfile?.permissions || {
    canTakeAttendance: true,
    canGradeExams: true,
    canManageCurriculum: true,
    canManageAssignments: true,
    canApproveLeaves: false,
  };

  const [activeTab, setActiveTab] = useState<'TASKS' | 'ATTENDANCE' | 'GRADING' | 'CURRICULUM'>('TASKS');
  const [selectedGrade, setSelectedGrade] = useState<string>(assignedGrades[0] || 'Grade 8');
  const [todayAttendanceStatus, setTodayAttendanceStatus] = useState<Record<string, 'PRESENT' | 'ABSENT'>>({});

  // Scoped students in the teacher's selected class
  const classStudents = useMemo(() => {
    return students.filter(s => s.gradeName === selectedGrade || !s.gradeName);
  }, [students, selectedGrade]);

  const handleToggleAttendance = (studentId: string, status: 'PRESENT' | 'ABSENT') => {
    setTodayAttendanceStatus(prev => ({ ...prev, [studentId]: status }));
    markAttendance(studentId, status);
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Faculty Profile Hero Banner */}
        <Card className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 shadow-xl rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 border border-indigo-400/30 flex items-center justify-center font-black text-2xl text-white shadow-lg shrink-0">
                {(teacherProfile?.name || user?.firstName || 'T')[0]}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                    {teacherProfile?.name || `${user?.firstName || 'Faculty'} ${user?.lastName || 'Member'}`}
                  </h1>
                  <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-950/80 border border-indigo-500/30 px-2 py-0.5 rounded-md">
                    {teacherProfile?.employeeId || 'FACULTY'}
                  </span>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-bold">
                    Active Faculty
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                  <span className="flex items-center gap-1 font-semibold text-slate-200">
                    <Building className="w-3.5 h-3.5 text-indigo-400" />
                    {activeSchool.name}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-cyan-300">
                    <Mail className="w-3.5 h-3.5" />
                    {user?.email || teacherProfile?.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                    {teacherProfile?.department || 'STEM Department'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Summary Pill */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-slate-300 font-bold block">Assigned Tasks</span>
                <span className="text-lg font-black text-white">{myTasks.length} Assigned</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 border border-indigo-400/20 ml-2">
                <ClipboardList className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Assigned Classes, Subjects & Functional Rights Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] font-bold uppercase tracking-wider mb-1.5">
                Assigned Classes / Grades
              </span>
              <div className="flex flex-wrap gap-1.5">
                {assignedGrades.map(g => (
                  <span key={g} className="px-2.5 py-1 rounded-lg bg-indigo-900/60 text-indigo-200 border border-indigo-500/30 font-bold text-xs">
                    {g}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] font-bold uppercase tracking-wider mb-1.5">
                Assigned Subjects
              </span>
              <div className="flex flex-wrap gap-1.5">
                {assignedSubjects.map(s => (
                  <span key={s} className="px-2.5 py-1 rounded-lg bg-purple-900/60 text-purple-200 border border-purple-500/30 font-bold text-xs">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] font-bold uppercase tracking-wider mb-1.5">
                Assigned Functional Permissions
              </span>
              <div className="flex flex-wrap gap-1.5">
                {permissions.canTakeAttendance && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                    &bull; Mark Attendance
                  </span>
                )}
                {permissions.canGradeExams && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-950/80 text-blue-300 border border-blue-500/30 text-[10px] font-semibold">
                    &bull; Exam Grading
                  </span>
                )}
                {permissions.canManageCurriculum && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-500/30 text-[10px] font-semibold">
                    &bull; Lesson Planner
                  </span>
                )}
                {permissions.canManageAssignments && (
                  <span className="px-2 py-0.5 rounded-md bg-purple-950/80 text-purple-300 border border-purple-500/30 text-[10px] font-semibold">
                    &bull; Homework/Assignments
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Tab Toggle Navigation */}
        <div className="flex border-b border-slate-200 bg-white p-1 rounded-2xl shadow-xs">
          {[
            { id: 'TASKS' as const, label: `My Assigned Tasks (${myTasks.length})`, icon: ClipboardList },
            { id: 'ATTENDANCE' as const, label: 'Class Attendance', icon: UserCheck },
            { id: 'GRADING' as const, label: 'Exams & Project Marks', icon: GraduationCap },
            { id: 'CURRICULUM' as const, label: 'STEM Lesson Plan', icon: BookOpen },
          ].map(tab => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 px-4 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                  isSel
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: Assigned Duties & Tasks */}
        {activeTab === 'TASKS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Assigned Duties & Tasks from School Admin</h3>
                <p className="text-xs text-slate-500">Tasks assigned specifically to you by the School Administration.</p>
              </div>
              <div className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl">
                {myTasks.filter(t => t.status === 'COMPLETED').length} of {myTasks.length} Completed
              </div>
            </div>

            {myTasks.length === 0 ? (
              <Card className="light-glass p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">All Tasks Up to Date!</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  You have no pending tasks assigned by the School Admin at this moment.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myTasks.map((task) => (
                  <Card key={task.id} className="p-5 bg-white border border-slate-200/80 shadow-xs rounded-3xl space-y-4 flex flex-col justify-between hover:border-indigo-300 transition-all">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          task.priority === 'URGENT' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          task.priority === 'HIGH' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-indigo-50 text-indigo-700 border border-indigo-100'
                        }`}>
                          {task.priority} Priority
                        </span>

                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          task.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          task.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-base mt-2">{task.title}</h4>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed">{task.description}</p>

                      <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-1.5">
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="font-medium text-slate-400">Class & Subject:</span>
                          <span className="font-bold text-indigo-700">{task.assignedGrade} &bull; {task.subject}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="font-medium text-slate-400">Due Date:</span>
                          <span className="font-mono font-semibold text-slate-800">{task.dueDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-medium text-slate-400">Status:</span>
                      <div className="flex items-center gap-1.5">
                        {task.status !== 'IN_PROGRESS' && task.status !== 'COMPLETED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateTeacherTaskStatus(task.id, 'IN_PROGRESS')}
                            className="text-xs font-bold text-blue-700 border-blue-200 hover:bg-blue-50 h-8"
                          >
                            Start Task
                          </Button>
                        )}
                        {task.status !== 'COMPLETED' ? (
                          <Button
                            size="sm"
                            onClick={() => updateTeacherTaskStatus(task.id, 'COMPLETED')}
                            className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white h-8 gap-1 shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Mark Done
                          </Button>
                        ) : (
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Class Attendance */}
        {activeTab === 'ATTENDANCE' && (
          <div className="space-y-4">
            <Card className="light-glass p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700">Select Class:</span>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800"
                >
                  {assignedGrades.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    classStudents.forEach(s => handleToggleAttendance(s.id, 'PRESENT'));
                  }}
                  className="text-xs font-bold text-emerald-700 border-emerald-200 hover:bg-emerald-50 h-8"
                >
                  Mark All Present
                </Button>
              </div>
            </Card>

            <Card className="p-4 bg-white border border-slate-200 rounded-3xl shadow-xs">
              <div className="divide-y divide-slate-100">
                {classStudents.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 font-medium">
                    No enrolled students found in {selectedGrade}.
                  </div>
                ) : (
                  classStudents.map((st) => {
                    const status = todayAttendanceStatus[st.id] || st.todayAttendance || 'PRESENT';
                    return (
                      <div key={st.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                            {st.firstName[0]}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">{st.firstName} {st.lastName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">Roll: {st.admissionNumber}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleAttendance(st.id, 'PRESENT')}
                            className={`w-8 h-8 rounded-xl font-bold text-xs transition-all ${
                              status === 'PRESENT'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            P
                          </button>
                          <button
                            onClick={() => handleToggleAttendance(st.id, 'ABSENT')}
                            className={`w-8 h-8 rounded-xl font-bold text-xs transition-all ${
                              status === 'ABSENT'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            A
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>
        )}

        {/* TAB 3: Grading */}
        {activeTab === 'GRADING' && (
          <div className="space-y-4">
            <Card className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Student STEM Practical Projects & Submissions</h3>
                  <p className="text-xs text-slate-500">Grading queue for assigned classes ({assignedGrades.join(', ')})</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'Aria Sharma', grade: 'Grade 8', task: 'Python Automation Loop & Sensor Feedback', status: 'Pending Review' },
                  { name: 'Zane Thompson', grade: 'Grade 8', task: 'Arduino Obstacle Avoidance Robot Prototype', status: 'Graded (95/100)' },
                  { name: 'Liam Patel', grade: 'Grade 7', task: 'Scratch Game Logic & Variables', status: 'Pending Review' },
                  { name: 'Noah Verma', grade: 'Grade 9', task: 'AI Computer Vision Face Detection Script', status: 'Graded (90/100)' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-white transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{item.name}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {item.grade}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{item.task}</p>
                    </div>

                    <div>
                      {item.status.includes('Graded') ? (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                          {item.status}
                        </span>
                      ) : (
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-8 px-3">
                          Enter Marks
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* TAB 4: Curriculum */}
        {activeTab === 'CURRICULUM' && (
          <div className="space-y-4">
            <Card className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Curriculum & Daily Lecture Schedule</h3>
                <p className="text-xs text-slate-500">Scheduled lessons for your assigned subjects ({assignedSubjects.join(', ')})</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Period 1: Robotics Kinematics & Servo Calibration', grade: 'Grade 8 - Section A', time: '09:00 AM - 09:45 AM', room: 'STEM Lab 1' },
                  { title: 'Period 3: Python Data Structures & Lists', grade: 'Grade 9 - Section B', time: '11:00 AM - 11:45 AM', room: 'Computer Lab 2' },
                  { title: 'Period 5: AI Ethics & Neural Networks Overview', grade: 'Grade 10 - Section A', time: '01:30 PM - 02:15 PM', room: 'Smart Classroom 4' },
                ].map((period, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-200 transition-all space-y-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {period.time}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">{period.title}</h4>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>{period.grade}</span>
                      <span className="font-medium text-slate-700">{period.room}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
