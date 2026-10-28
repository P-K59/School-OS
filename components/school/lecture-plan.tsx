"use client";

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Plus,
  Search,
  Check,
  Play,
  RotateCcw,
  Sparkles,
  GraduationCap
} from 'lucide-react';

export interface LectureItem {
  id: string;
  className: string;
  period: string;
  timeSlot: string;
  subject: string;
  chapterTitle: string;
  teacherName: string;
  room: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
  isTeacherAbsent?: boolean;
  substituteTeacher?: string;
  homeworkGiven?: string;
}

export function LecturePlan() {
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Initial lecture plan mock data with localStorage persistence
  const [lectures, setLectures] = useState<LectureItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('school_os_lecture_plans');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return [
      {
        id: 'lec-1',
        className: 'Class 6-A',
        period: 'Period 1',
        timeSlot: '08:30 - 09:15 AM',
        subject: 'Mathematics',
        chapterTitle: 'Chapter 3: Integers & Number Line (Exercise 3.2)',
        teacherName: 'Rajesh Kumar',
        room: 'Room 101',
        status: 'COMPLETED',
        homeworkGiven: 'Solve questions 1 to 5 from Exercise 3.2 in notebook'
      },
      {
        id: 'lec-2',
        className: 'Class 7-B',
        period: 'Period 2',
        timeSlot: '09:15 - 10:00 AM',
        subject: 'Science',
        chapterTitle: 'Chapter 5: Acids, Bases & Salts (Litmus Paper Indicators)',
        teacherName: 'Sunita Meena',
        room: 'Science STEM Lab',
        status: 'IN_PROGRESS',
        homeworkGiven: 'Record observations of pH experiment in lab journal'
      },
      {
        id: 'lec-3',
        className: 'Class 8-A',
        period: 'Period 3',
        timeSlot: '10:15 - 11:00 AM',
        subject: 'English',
        chapterTitle: 'Poetry: The Road Not Taken (Rhyme Scheme & Symbolism)',
        teacherName: 'Dr. Farhan Qureshi',
        room: 'Room 104',
        status: 'PLANNED',
        isTeacherAbsent: true,
        substituteTeacher: 'Anita Joshi (Covering Faculty)'
      },
      {
        id: 'lec-4',
        className: 'Class 6-B',
        period: 'Period 3',
        timeSlot: '10:15 - 11:00 AM',
        subject: 'Language Arts',
        chapterTitle: 'Grammar: Sentence Structure, Conjunctions & Active Voice',
        teacherName: 'Manoj Verma',
        room: 'Room 102',
        status: 'PLANNED'
      },
      {
        id: 'lec-5',
        className: 'Class 9-A',
        period: 'Period 4',
        timeSlot: '11:00 - 11:45 AM',
        subject: 'Computer & Coding',
        chapterTitle: 'Python Fundamentals: For Loops & Conditional Statements',
        teacherName: 'Sneha Patel',
        room: 'Computer Lab',
        status: 'PLANNED'
      },
      {
        id: 'lec-6',
        className: 'Class 5',
        period: 'Period 5',
        timeSlot: '12:30 - 01:15 PM',
        subject: 'Social Studies',
        chapterTitle: 'Global Geography: Earth Spheres, Continents & Ocean Basins',
        teacherName: 'Kavita Singh',
        room: 'Room 105',
        status: 'PLANNED',
        isTeacherAbsent: true
      }
    ];
  });

  // Modal State for adding new lecture
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClass, setNewClass] = useState('Class 6-A');
  const [newPeriod, setNewPeriod] = useState('Period 4 (11:00 - 11:45 AM)');
  const [newSubject, setNewSubject] = useState('Mathematics');
  const [newChapter, setNewChapter] = useState('');
  const [newTeacher, setNewTeacher] = useState('Rajesh Kumar');
  const [newRoom, setNewRoom] = useState('Room 101');
  const [newHomework, setNewHomework] = useState('');

  // Substitute modal
  const [substituteLecture, setSubstituteLecture] = useState<LectureItem | null>(null);
  const [selectedSubstitute, setSelectedSubstitute] = useState('Anita Joshi (English Faculty)');

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('school_os_lecture_plans', JSON.stringify(lectures));
    } catch {}
  }, [lectures]);

  const handleCreateLecture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapter.trim()) return;

    const newItem: LectureItem = {
      id: `lec-${Date.now()}`,
      className: newClass,
      period: newPeriod.split(' ')[0] + ' ' + newPeriod.split(' ')[1],
      timeSlot: newPeriod.includes('(') ? newPeriod.split('(')[1].replace(')', '') : 'Today',
      subject: newSubject,
      chapterTitle: newChapter.trim(),
      teacherName: newTeacher.trim() || 'Assigned Faculty',
      room: newRoom.trim() || 'Classroom',
      status: 'PLANNED',
      homeworkGiven: newHomework.trim() || undefined
    };

    setLectures([newItem, ...lectures]);
    setNewChapter('');
    setNewHomework('');
    setShowAddModal(false);
  };

  const updateLectureStatus = (id: string, status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED') => {
    setLectures(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  };

  const handleAssignSubstitute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!substituteLecture) return;

    setLectures(prev => prev.map(l => {
      if (l.id === substituteLecture.id) {
        return {
          ...l,
          substituteTeacher: selectedSubstitute,
          isTeacherAbsent: true
        };
      }
      return l;
    }));

    setSubstituteLecture(null);
  };

  const filteredLectures = lectures.filter(l => {
    const matchesClass = selectedClass === 'ALL' || l.className.startsWith(selectedClass);
    const matchesSearch = l.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.chapterTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesSearch;
  });

  const completedCount = lectures.filter(l => l.status === 'COMPLETED').length;
  const inProgressCount = lectures.filter(l => l.status === 'IN_PROGRESS').length;
  const totalCount = lectures.length;

  return (
    <div className="space-y-6">
      {/* Clean Executive Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              Academic Schedule
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Daily Lecture Plan
          </h2>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-3d-primary px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Lecture</span>
        </button>
      </div>

      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-3d rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Total Periods</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {totalCount}
          </div>
          <div className="text-xs font-semibold text-slate-500 mt-1">
            Scheduled Today
          </div>
        </div>

        <div className="card-3d rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Delivered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {completedCount}
          </div>
          <div className="text-xs font-semibold text-emerald-600 mt-1">
            Finished Periods
          </div>
        </div>

        <div className="card-3d rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>In Session</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {inProgressCount}
          </div>
          <div className="text-xs font-semibold text-amber-600 mt-1">
            Active Classes
          </div>
        </div>

        <div className="card-3d rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Completion</span>
            <GraduationCap className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {totalCount ? Math.round((completedCount / totalCount) * 100) : 0}%
          </div>
          <div className="text-xs font-semibold text-purple-600 mt-1">
            Delivered Today
          </div>
        </div>
      </div>

      {/* Class Filter Bar & Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Class Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {['ALL', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'].map(cls => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedClass === cls
                  ? 'btn-3d-primary'
                  : 'btn-3d-secondary text-slate-600'
              }`}
            >
              {cls === 'ALL' ? 'All Classes' : cls}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search subject, chapter or faculty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 text-xs font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
          />
        </div>
      </div>

      {/* Daily Periods Schedule Cards */}
      <div className="space-y-3">
        {filteredLectures.map((lec) => {
          const isDone = lec.status === 'COMPLETED';
          const isInProgress = lec.status === 'IN_PROGRESS';
          const isPlanned = lec.status === 'PLANNED';

          return (
            <div
              key={lec.id}
              className={`rounded-2xl p-4 sm:p-5 transition-all ${
                isDone
                  ? 'card-3d border-emerald-300 bg-emerald-50/20'
                  : isInProgress
                  ? 'card-3d border-indigo-400 bg-indigo-50/20'
                  : 'card-3d bg-white'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Left: Timing & Class badge */}
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-center shrink-0 ${
                    isDone
                      ? 'bg-emerald-100 text-emerald-800'
                      : isInProgress
                      ? 'bg-indigo-100 text-indigo-800 animate-pulse'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    <span className="text-[10px] uppercase font-bold tracking-tight">Period</span>
                    <span className="text-sm font-extrabold">{lec.period.replace('Period ', '')}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-slate-900 text-white">
                        {lec.className}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {lec.subject}
                      </span>
                      <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {lec.timeSlot}
                      </span>
                      <span className="text-xs text-slate-400 font-normal">
                        • {lec.room}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {lec.chapterTitle}
                    </h4>

                    {/* Teacher / Substitute Status */}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-xs text-slate-600 font-normal">
                        Faculty: <strong className="text-slate-800 font-semibold">{lec.teacherName}</strong>
                      </span>

                      {lec.isTeacherAbsent && !lec.substituteTeacher && (
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Faculty Away
                          </span>
                          <button
                            onClick={() => { setSubstituteLecture(lec); }}
                            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline ml-1"
                          >
                            Assign Substitute
                          </button>
                        </div>
                      )}

                      {lec.substituteTeacher && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-amber-600" /> Substitute: {lec.substituteTeacher}
                        </span>
                      )}
                    </div>

                    {lec.homeworkGiven && (
                      <p className="text-xs text-slate-500 mt-1 italic font-normal">
                        Assignment: {lec.homeworkGiven}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Instant 3-Way Status Changer (3D Tactile Buttons) */}
                <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                  <button
                    onClick={() => updateLectureStatus(lec.id, 'PLANNED')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isPlanned
                        ? 'btn-3d-secondary bg-slate-800 text-white border-slate-700'
                        : 'btn-3d-secondary text-slate-600 opacity-70 hover:opacity-100'
                    }`}
                  >
                    Scheduled
                  </button>

                  <button
                    onClick={() => updateLectureStatus(lec.id, 'IN_PROGRESS')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isInProgress
                        ? 'btn-3d-primary'
                        : 'btn-3d-secondary text-slate-600 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    In Session
                  </button>

                  <button
                    onClick={() => updateLectureStatus(lec.id, 'COMPLETED')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isDone
                        ? 'btn-3d-success'
                        : 'btn-3d-secondary text-slate-600 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Completed ✓
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add New Period / Lesson */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Add Daily Lesson Schedule
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLecture} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Class Level *
                  </label>
                  <select
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm font-normal bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Class 5">Class 5</option>
                    <option value="Class 6-A">Class 6-A</option>
                    <option value="Class 6-B">Class 6-B</option>
                    <option value="Class 7-A">Class 7-A</option>
                    <option value="Class 7-B">Class 7-B</option>
                    <option value="Class 8-A">Class 8-A</option>
                    <option value="Class 9-A">Class 9-A</option>
                    <option value="Class 10">Class 10</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Period Slot *
                  </label>
                  <select
                    value={newPeriod}
                    onChange={(e) => setNewPeriod(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm font-normal bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Period 1 (08:30 - 09:15 AM)">Period 1 (08:30 - 09:15 AM)</option>
                    <option value="Period 2 (09:15 - 10:00 AM)">Period 2 (09:15 - 10:00 AM)</option>
                    <option value="Period 3 (10:15 - 11:00 AM)">Period 3 (10:15 - 11:00 AM)</option>
                    <option value="Period 4 (11:00 - 11:45 AM)">Period 4 (11:00 - 11:45 AM)</option>
                    <option value="Period 5 (12:30 - 01:15 PM)">Period 5 (12:30 - 01:15 PM)</option>
                    <option value="Period 6 (01:15 - 02:00 PM)">Period 6 (01:15 - 02:00 PM)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Academic Subject *
                  </label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm font-normal bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="English">English</option>
                    <option value="Language Arts">Language Arts</option>
                    <option value="Social Studies">Social Studies</option>
                    <option value="Computer & Coding">Computer & Coding</option>
                    <option value="General Knowledge">General Knowledge</option>
                    <option value="Physical Education">Physical Education</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Room Assignment
                  </label>
                  <input
                    type="text"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    placeholder="e.g. Room 102, Science Lab"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Chapter & Topic Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 4: Fractions and Decimal Conversions"
                  value={newChapter}
                  onChange={(e) => setNewChapter(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Assigned Faculty Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kumar, Sunita Meena, Dr. Farhan"
                  value={newTeacher}
                  onChange={(e) => setNewTeacher(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Student Assignment (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Practice questions 1 to 5 from chapter exercise"
                  value={newHomework}
                  onChange={(e) => setNewHomework(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-3d-secondary px-4 py-2.5 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-bold"
                >
                  Save Schedule Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Substitute Teacher Assignment Modal */}
      {substituteLecture && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-600" />
                Assign Substitute Faculty
              </h3>
              <button
                onClick={() => setSubstituteLecture(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3 font-normal leading-relaxed">
              Regular faculty for <strong>{substituteLecture.className} ({substituteLecture.subject})</strong> is absent today. Select an available teacher to cover this period:
            </p>

            <form onSubmit={handleAssignSubstitute} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Available Faculty on Standby
                </label>
                <select
                  value={selectedSubstitute}
                  onChange={(e) => setSelectedSubstitute(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm font-normal bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Anita Joshi (English Faculty - Free Period 3)">Anita Joshi (Free Period 3)</option>
                  <option value="Kavita Singh (Social Studies)">Kavita Singh (Social Studies)</option>
                  <option value="Sneha Patel (STEM Lab Specialist)">Sneha Patel (STEM Lab Specialist)</option>
                  <option value="Headmaster / Self Cover">Headmaster / Principal Direct Cover</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSubstituteLecture(null)}
                  className="btn-3d-secondary px-4 py-2.5 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-bold"
                >
                  Confirm Substitute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
