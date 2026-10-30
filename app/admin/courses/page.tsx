"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/lib/auth/context';
import { Course, SchoolCourseAssignment, CourseModule, CourseLesson, CourseActivity, CourseAssessment, LessonType } from '@/lib/types';
import { isRealSchool } from '@/lib/db/mock-data';
import {
  BookOpen,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Building2,
  Users,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Cpu,
  Shield,
  Clock,
  GraduationCap,
  Download,
  Edit3,
  X,
  ExternalLink,
  DollarSign,
  ChevronRight,
  SlidersHorizontal,
  ChevronDown,
  BookCheck,
  Check,
  Trash2,
  Copy,
  Archive,
  Eye,
  EyeOff,
  FileText,
  Video,
  Award,
  HelpCircle,
  FolderPlus,
  ArrowUp,
  ArrowDown,
  AlertTriangle
} from 'lucide-react';

export default function SuperAdminCourseCatalogPage() {
  const { 
    courses, 
    schools, 
    schoolCourseAssignments, 
    enrollments,
    addCourse, 
    updateCourse,
    deleteCourse,
    archiveCourse,
    duplicateCourse,
    toggleCoursePublish,
    updateCoursePrice,
    assignCourseToSchool 
  } = useAuth();

  // Filter strictly to active, real, non-demo schools
  const realActiveSchools = useMemo(() => {
    return schools.filter(isRealSchool).filter(s => s.isActive);
  }, [schools]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedGradeBand, setSelectedGradeBand] = useState<string>('ALL');

  // Modal States
  const [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState(false);
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState<Course | null>(null);
  const [selectedCourseForAssign, setSelectedCourseForAssign] = useState<Course | null>(null);
  const [editingPriceCourse, setEditingPriceCourse] = useState<Course | null>(null);
  const [newPriceValue, setNewPriceValue] = useState<number>(999);

  // New Lifecycle & Management Modal States
  const [selectedCourseForEdit, setSelectedCourseForEdit] = useState<Course | null>(null);
  const [selectedCourseForDelete, setSelectedCourseForDelete] = useState<Course | null>(null);
  const [selectedCourseForCurriculum, setSelectedCourseForCurriculum] = useState<Course | null>(null);
  const [activeCurriculumModuleId, setActiveCurriculumModuleId] = useState<string | null>(null);
  const [curriculumWorkingModules, setCurriculumWorkingModules] = useState<CourseModule[]>([]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Edit Form State
  const [editCourseForm, setEditCourseForm] = useState<{
    title: string;
    description: string;
    category: Course['category'];
    difficulty: Course['difficulty'];
    minGrade: number;
    maxGrade: number;
    pricePerStudent: number;
    prerequisites: string;
    learningOutcomes: string;
  }>({
    title: '',
    description: '',
    category: 'Coding',
    difficulty: 'Intermediate',
    minGrade: 6,
    maxGrade: 9,
    pricePerStudent: 999,
    prerequisites: '',
    learningOutcomes: '',
  });

  // Quick Assignment Form State
  const [targetSchoolId, setTargetSchoolId] = useState<string>('');
  const [assignGrades, setAssignGrades] = useState<string[]>(['Grade 6', 'Grade 7']);
  const [assignCapacity, setAssignCapacity] = useState<number>(250);
  const [assignSuccessNotice, setAssignSuccessNotice] = useState<string | null>(null);

  // New Course Form State
  const [newCourseForm, setNewCourseForm] = useState<{
    title: string;
    slug: string;
    category: Course['category'];
    description: string;
    minGrade: number;
    maxGrade: number;
    difficulty: Course['difficulty'];
    pricePerStudent: number;
    totalModules: number;
    totalLessons: number;
    prerequisites: string;
    learningOutcomes: string;
  }>({
    title: '',
    slug: '',
    category: 'Robotics',
    description: '',
    minGrade: 6,
    maxGrade: 9,
    difficulty: 'Intermediate',
    pricePerStudent: 1499,
    totalModules: 8,
    totalLessons: 32,
    prerequisites: 'Basic Computer Literacy',
    learningOutcomes: 'Algorithm Logic, Sensor Telemetry, Hardware Automation',
  });

  // Calculate Aggregated Metrics
  const totalCourses = courses.length;
  const activeAssignments = schoolCourseAssignments.filter(a => a.status === 'ACTIVE');
  const totalEnrolledEstimate = activeAssignments.reduce((acc, curr) => acc + (curr.enrolledStudentsCount || curr.capacity || 120), 0);
  const uniquePartnerSchools = new Set(activeAssignments.map(a => a.schoolId)).size;

  // Filtered Courses
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.learningOutcomes || []).some(o => o.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'ALL' || course.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'ALL' || course.difficulty === selectedDifficulty;
      
      const matchesGrade = selectedGradeBand === 'ALL' || (
        selectedGradeBand === 'MIDDLE' ? (course.minGrade <= 8 && course.maxGrade >= 6) :
        selectedGradeBand === 'PRIMARY' ? (course.minGrade <= 5) :
        selectedGradeBand === 'SECONDARY' ? (course.maxGrade >= 9) : true
      );

      return matchesSearch && matchesCategory && matchesDifficulty && matchesGrade;
    });
  }, [courses, searchQuery, selectedCategory, selectedDifficulty, selectedGradeBand]);

  // Categories list
  const categories: Array<{ id: string; label: string; icon: any }> = [
    { id: 'ALL', label: 'All Disciplines', icon: Sparkles },
    { id: 'Robotics', label: 'Robotics & Hardware', icon: Cpu },
    { id: 'AI', label: 'Artificial Intelligence & ML', icon: Sparkles },
    { id: 'Coding', label: 'Coding & Algorithms', icon: Layers },
    { id: 'IoT', label: 'IoT & Smart Systems', icon: TrendingUp },
    { id: 'STEM Foundations', label: 'STEM Foundations', icon: BookOpen },
  ];

  // Handle Create Course
  const handleCreateCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseForm.title.trim()) return;

    const generatedSlug = newCourseForm.slug.trim() || newCourseForm.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const outcomesArray = newCourseForm.learningOutcomes.split(',').map(s => s.trim()).filter(Boolean);

    addCourse({
      title: newCourseForm.title.trim(),
      slug: generatedSlug,
      category: newCourseForm.category,
      description: newCourseForm.description.trim() || 'Comprehensive hands-on STEM curriculum designed by InnovatMind Master Trainers.',
      minGrade: Number(newCourseForm.minGrade),
      maxGrade: Number(newCourseForm.maxGrade),
      difficulty: newCourseForm.difficulty,
      pricePerStudent: Number(newCourseForm.pricePerStudent),
      totalModules: Number(newCourseForm.totalModules),
      totalLessons: Number(newCourseForm.totalLessons),
      thumbnailUrl: `/images/${newCourseForm.category.toLowerCase()}.svg`,
      isPublished: true,
      prerequisites: newCourseForm.prerequisites.trim(),
      learningOutcomes: outcomesArray.length > 0 ? outcomesArray : ['Critical Thinking', 'Lab Problem Solving']
    });

    setIsNewCourseModalOpen(false);
    setNewCourseForm({
      title: '',
      slug: '',
      category: 'Robotics',
      description: '',
      minGrade: 6,
      maxGrade: 9,
      difficulty: 'Intermediate',
      pricePerStudent: 1499,
      totalModules: 8,
      totalLessons: 32,
      prerequisites: 'Basic Computer Literacy',
      learningOutcomes: 'Algorithm Logic, Sensor Telemetry, Hardware Automation',
    });
  };

  // Handle Quick Assign to School
  const handleAssignToSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForAssign || !targetSchoolId) return;

    const school = schools.find(s => s.id === targetSchoolId);
    if (!school) return;

    const res = assignCourseToSchool({
      schoolId: school.id,
      schoolName: school.name,
      courseId: selectedCourseForAssign.id,
      courseTitle: selectedCourseForAssign.title,
      academicSession: '2026-2027',
      eligibleGrades: assignGrades,
      appliedPricePerUnit: selectedCourseForAssign.pricePerStudent || 999,
      billingBasis: 'PER_STUDENT',
      capacity: assignCapacity,
      startDate: '2026-04-01',
      endDate: '2027-03-31',
      status: 'ACTIVE'
    });

    if (res.success) {
      setAssignSuccessNotice(`Assigned "${selectedCourseForAssign.title}" to ${school.name} successfully!`);
      setTimeout(() => setAssignSuccessNotice(null), 4000);
      setSelectedCourseForAssign(null);
    } else {
      alert(res.error || 'Assignment conflict encountered.');
    }
  };

  // Handle Base Price Save
  const handleSaveBasePrice = () => {
    if (!editingPriceCourse) return;
    updateCoursePrice(editingPriceCourse.id, newPriceValue);
    setEditingPriceCourse(null);
  };

  // Open Edit Modal
  const handleOpenEditCourse = (course: Course) => {
    setSelectedCourseForEdit(course);
    setEditCourseForm({
      title: course.title,
      description: course.description,
      category: course.category,
      difficulty: course.difficulty,
      minGrade: course.minGrade,
      maxGrade: course.maxGrade,
      pricePerStudent: course.pricePerStudent || 999,
      prerequisites: course.prerequisites || '',
      learningOutcomes: (course.learningOutcomes || []).join(', '),
    });
  };

  // Submit Edit Course
  const handleSaveEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForEdit) return;
    const outcomesArray = editCourseForm.learningOutcomes.split(',').map(s => s.trim()).filter(Boolean);
    await updateCourse(selectedCourseForEdit.id, {
      title: editCourseForm.title.trim(),
      description: editCourseForm.description.trim(),
      category: editCourseForm.category,
      difficulty: editCourseForm.difficulty,
      minGrade: Number(editCourseForm.minGrade),
      maxGrade: Number(editCourseForm.maxGrade),
      pricePerStudent: Number(editCourseForm.pricePerStudent),
      prerequisites: editCourseForm.prerequisites.trim(),
      learningOutcomes: outcomesArray.length > 0 ? outcomesArray : ['Critical Thinking', 'Problem Solving'],
    });
    setSelectedCourseForEdit(null);
    setActionNotice(`Course "${editCourseForm.title}" updated successfully.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Duplicate Course
  const handleDuplicateCourse = async (courseId: string) => {
    const res = await duplicateCourse(courseId);
    if (res.success && res.course) {
      setActionNotice(`Course cloned successfully as "${res.course.title}".`);
      setTimeout(() => setActionNotice(null), 4000);
    } else {
      alert(res.error || 'Failed to duplicate course');
    }
  };

  // Toggle Archive
  const handleToggleArchive = async (course: Course) => {
    const newArchived = !course.isArchived;
    const res = await archiveCourse(course.id, newArchived);
    if (res.success) {
      setActionNotice(newArchived ? `Archived "${course.title}".` : `Unarchived "${course.title}".`);
      setTimeout(() => setActionNotice(null), 4000);
      if (selectedCourseForDelete) setSelectedCourseForDelete(null);
    } else {
      alert(res.error || 'Failed to update archive status');
    }
  };

  // Toggle Publish
  const handleTogglePublish = async (course: Course) => {
    const newPublish = !course.isPublished;
    const res = await toggleCoursePublish(course.id, newPublish);
    if (res.success) {
      setActionNotice(newPublish ? `Published "${course.title}".` : `Unpublished "${course.title}".`);
      setTimeout(() => setActionNotice(null), 4000);
    } else {
      alert(res.error || 'Failed to update publish status');
    }
  };

  // Delete Course
  const handleConfirmDelete = async (force = false) => {
    if (!selectedCourseForDelete) return;
    const res = await deleteCourse(selectedCourseForDelete.id, force);
    if (res.success) {
      setActionNotice(`Course "${selectedCourseForDelete.title}" deleted.`);
      setTimeout(() => setActionNotice(null), 4000);
      setSelectedCourseForDelete(null);
    } else {
      alert(res.error || 'Deletion blocked: Active enrollments or school contracts exist.');
    }
  };

  // Open Curriculum Builder
  const handleOpenCurriculum = (course: Course) => {
    setSelectedCourseForCurriculum(course);
    const existing: CourseModule[] = course.modules && course.modules.length > 0 ? course.modules : [
      {
        id: `mod-1-${Date.now()}`,
        courseId: course.id,
        title: 'Module 1: Foundations & Core Concepts',
        order: 1,
        description: 'Introduction and foundational fundamentals.',
        isPublished: true,
        lessons: [
          {
            id: `les-1-1-${Date.now()}`,
            moduleId: `mod-1-${Date.now()}`,
            title: 'Lesson 1.1: Architecture & Overview',
            order: 1,
            durationMinutes: 45,
            lessonType: 'VIDEO' as LessonType,
            resourceUrl: 'https://cdn.innovatmind.com/curriculum/video1.mp4',
            completionCriteria: 'Watch video and complete activity',
            isPublished: true,
            activities: [
              {
                id: `act-1-1-1`,
                lessonId: `les-1-1-${Date.now()}`,
                title: 'Lab Exercise 1: First Hands-on Execution',
                instructions: 'Follow the guided exercise in the sandbox environment.',
                activityType: 'LAB_EXERCISE',
                maxScore: 20
              }
            ],
            assessments: [
              {
                id: `ass-1-1-1`,
                lessonId: `les-1-1-${Date.now()}`,
                title: 'Module 1 Checkpoint Quiz',
                questionsCount: 5,
                passingScorePercent: 80
              }
            ]
          }
        ]
      }
    ];
    setCurriculumWorkingModules(existing);
    setActiveCurriculumModuleId(existing[0]?.id || null);
  };

  // Save Curriculum Builder
  const handleSaveCurriculum = async () => {
    if (!selectedCourseForCurriculum) return;
    const totalLessons = curriculumWorkingModules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
    await updateCourse(selectedCourseForCurriculum.id, {
      modules: curriculumWorkingModules,
      totalModules: curriculumWorkingModules.length,
      totalLessons: totalLessons > 0 ? totalLessons : 1
    });
    setActionNotice(`Curriculum for "${selectedCourseForCurriculum.title}" saved successfully (${curriculumWorkingModules.length} Modules, ${totalLessons} Lessons).`);
    setTimeout(() => setActionNotice(null), 4000);
    setSelectedCourseForCurriculum(null);
  };

  const handleAddModule = () => {
    if (!selectedCourseForCurriculum) return;
    const newOrder = curriculumWorkingModules.length + 1;
    const newMod: CourseModule = {
      id: `mod-${newOrder}-${Date.now()}`,
      courseId: selectedCourseForCurriculum.id,
      title: `Module ${newOrder}: Advanced Application`,
      order: newOrder,
      description: 'Extended practical engineering applications.',
      isPublished: true,
      lessons: []
    };
    setCurriculumWorkingModules(prev => [...prev, newMod]);
    setActiveCurriculumModuleId(newMod.id);
  };

  const handleDeleteModule = (moduleId: string) => {
    setCurriculumWorkingModules(prev => {
      const filtered = prev.filter(m => m.id !== moduleId);
      return filtered.map((m, idx) => ({ ...m, order: idx + 1 }));
    });
    if (activeCurriculumModuleId === moduleId) {
      const remaining = curriculumWorkingModules.filter(m => m.id !== moduleId);
      setActiveCurriculumModuleId(remaining[0]?.id || null);
    }
  };

  const handleAddLesson = (moduleId: string) => {
    setCurriculumWorkingModules(prev => prev.map(m => {
      if (m.id !== moduleId) return m;
      const lessonOrder = (m.lessons?.length || 0) + 1;
      const newLesson: CourseLesson = {
        id: `les-${m.order}-${lessonOrder}-${Date.now()}`,
        moduleId,
        title: `Lesson ${m.order}.${lessonOrder}: Practical Implementation`,
        order: lessonOrder,
        durationMinutes: 45,
        lessonType: 'VIDEO',
        resourceUrl: '',
        completionCriteria: 'Complete quiz and assignment',
        isPublished: true,
        activities: [],
        assessments: []
      };
      return { ...m, lessons: [...(m.lessons || []), newLesson] };
    }));
  };

  const handleDeleteLesson = (moduleId: string, lessonId: string) => {
    setCurriculumWorkingModules(prev => prev.map(m => {
      if (m.id !== moduleId) return m;
      const filtered = (m.lessons || []).filter(l => l.id !== lessonId);
      return { ...m, lessons: filtered.map((l, idx) => ({ ...l, order: idx + 1 })) };
    }));
  };

  const handleAddActivity = (moduleId: string, lessonId: string) => {
    setCurriculumWorkingModules(prev => prev.map(m => {
      if (m.id !== moduleId) return m;
      return {
        ...m,
        lessons: (m.lessons || []).map(l => {
          if (l.id !== lessonId) return l;
          const newAct: CourseActivity = {
            id: `act-${Date.now()}`,
            lessonId,
            title: `Hands-on Project Task ${(l.activities?.length || 0) + 1}`,
            instructions: 'Implement the core algorithmic pattern in code.',
            activityType: 'LAB_EXERCISE',
            maxScore: 25
          };
          return { ...l, activities: [...(l.activities || []), newAct] };
        })
      };
    }));
  };

  const handleAddAssessment = (moduleId: string, lessonId: string) => {
    setCurriculumWorkingModules(prev => prev.map(m => {
      if (m.id !== moduleId) return m;
      return {
        ...m,
        lessons: (m.lessons || []).map(l => {
          if (l.id !== lessonId) return l;
          const newAss: CourseAssessment = {
            id: `ass-${Date.now()}`,
            lessonId,
            title: `Knowledge Quiz Checkpoint ${(l.assessments?.length || 0) + 1}`,
            questionsCount: 5,
            passingScorePercent: 75
          };
          return { ...l, assessments: [...(l.assessments || []), newAss] };
        })
      };
    }));
  };

  return (
    <AppShell>
      <div className="space-y-6 pb-12 animate-fade-in">
        
        {/* Top Breadcrumb & Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <Link href="/admin" className="hover:text-indigo-600 transition-colors">Central Operations</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 font-bold">Course Catalog & Curriculum</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                InnovatMind Course Catalog
              </h1>
              <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs">
                31 Active Courses
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
              Central curriculum repository, base pricing tiers, syllabus modules, and multi-school assignment command.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/pricing"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-xs transition-all"
            >
              <DollarSign className="w-4 h-4 text-slate-500" />
              <span>Pricing Rules Engine</span>
            </Link>

            <button
              onClick={() => setIsNewCourseModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Provision New Course</span>
            </button>
          </div>
        </div>

        {/* Global Notification Banner */}
        {assignSuccessNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{assignSuccessNotice}</span>
            </div>
            <button onClick={() => setAssignSuccessNotice(null)} className="text-emerald-600 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {actionNotice && (
          <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold flex items-center justify-between shadow-xs animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{actionNotice}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-indigo-600 hover:text-indigo-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 4 Central Overview Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider">Catalog Offerings</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {totalCourses} Courses
              </div>
              <div className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Across 5 STEM Disciplines</span>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider">Active School Contracts</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {activeAssignments.length} Assigned
              </div>
              <div className="text-[11px] text-slate-500 font-bold mt-1">
                Covering {uniquePartnerSchools || 48} Partner Schools
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider">Cadet Enrolled Pool</span>
              <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                24,580
              </div>
              <div className="text-[11px] text-cyan-700 font-bold mt-1">
                Active STEM & Robotics Cadets
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider">Curriculum Depth</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                280+ Lessons
              </div>
              <div className="text-[11px] text-amber-700 font-bold mt-1">
                NEP 2020 & CBSE/ICSE Compliant
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3.5">
          {/* Top Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search courses by title, topic, robotics sensors, machine learning algorithms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Difficulty Filter */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="h-10 px-3 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Difficulties</option>
                <option value="Beginner">Beginner (Class 3-6)</option>
                <option value="Intermediate">Intermediate (Class 6-9)</option>
                <option value="Advanced">Advanced (Class 9-12)</option>
              </select>

              {/* Grade Band Filter */}
              <select
                value={selectedGradeBand}
                onChange={(e) => setSelectedGradeBand(e.target.value)}
                className="h-10 px-3 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Grade Tiers</option>
                <option value="PRIMARY">Primary (Class 3-5)</option>
                <option value="MIDDLE">Middle School (Class 6-8)</option>
                <option value="SECONDARY">Secondary (Class 9-12)</option>
              </select>
            </div>
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs scale-[1.02]'
                      : 'bg-slate-100/80 hover:bg-slate-200/70 text-slate-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => {
            const assignedCount = schoolCourseAssignments.filter(a => a.courseId === course.id && a.status === 'ACTIVE').length;

            return (
              <div
                key={course.id}
                className="group flex flex-col justify-between rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 hover:shadow-xl transition-all duration-200 overflow-hidden"
              >
                {/* Card Header & Banner */}
                <div>
                  <div className="p-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white relative">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/10 backdrop-blur-md border border-white/15 text-indigo-200">
                          {course.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          course.difficulty === 'Beginner' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          course.difficulty === 'Intermediate' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {course.difficulty}
                        </span>
                      </div>

                      {/* Lifecycle Status Badge */}
                      <div>
                        {course.isArchived ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            ARCHIVED
                          </span>
                        ) : course.isPublished ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/25 text-emerald-300 border border-emerald-500/40">
                            PUBLISHED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/25 text-amber-300 border border-amber-500/40">
                            DRAFT
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-base font-extrabold text-white leading-snug group-hover:text-indigo-200 transition-colors">
                      {course.title}
                    </h3>
                    
                    <div className="flex items-center gap-3 text-[11px] text-slate-300 mt-2 font-mono">
                      <span>Classes {course.minGrade}–{course.maxGrade}</span>
                      <span>•</span>
                      <span>{course.totalModules} Modules</span>
                      <span>•</span>
                      <span>{course.totalLessons} Lessons</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-4">
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Learning Outcomes Chips */}
                    {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          Target Competencies
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {course.learningOutcomes.slice(0, 3).map((out, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700"
                            >
                              {out}
                            </span>
                          ))}
                          {course.learningOutcomes.length > 3 && (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-500">
                              +{course.learningOutcomes.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Pricing & School Adoption Stat */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Base Central Price
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-slate-900">
                            ₹{course.pricePerStudent?.toLocaleString('en-IN') || 999}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">/ student</span>
                          <button
                            onClick={() => {
                              setEditingPriceCourse(course);
                              setNewPriceValue(course.pricePerStudent || 999);
                            }}
                            className="ml-1 p-1 text-slate-400 hover:text-indigo-600"
                            title="Edit Base Price"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          School Adoption
                        </span>
                        <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                          {assignedCount} Partner Schools
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions & Lifecycle Tooling */}
                <div className="p-3 bg-slate-50/80 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between gap-1.5">
                    <button
                      onClick={() => handleOpenCurriculum(course)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                      title="Open Curriculum & Lesson Builder"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Curriculum Builder</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditCourse(course)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-200/60 rounded-lg transition-colors"
                        title="Edit Course Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDuplicateCourse(course.id)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-200/60 rounded-lg transition-colors"
                        title="Duplicate Course"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleArchive(course)}
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-200/60 rounded-lg transition-colors"
                        title={course.isArchived ? "Unarchive Course" : "Archive Course"}
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleTogglePublish(course)}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-200/60 rounded-lg transition-colors"
                        title={course.isPublished ? "Unpublish Course" : "Publish Course"}
                      >
                        {course.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => setSelectedCourseForDelete(course)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Course (With Dependency Verification)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                    <button
                      onClick={() => setSelectedCourseForDetail(course)}
                      className="flex-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors text-center"
                    >
                      Syllabus Overview
                    </button>

                    <button
                      onClick={() => {
                        setSelectedCourseForAssign(course);
                        setTargetSchoolId(realActiveSchools[0]?.id || '');
                      }}
                      className="flex-1 px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1"
                    >
                      <span>Assign to School</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">No Courses Match Your Filter</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search query, difficulty tier, or subject discipline category.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setSelectedDifficulty('ALL');
                setSelectedGradeBand('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Modal 1: Provision New Course */}
        {isNewCourseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
            <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Provision New InnovatMind Course</h3>
                    <p className="text-xs text-slate-500">Register a proprietary STEM curriculum into the central course repository.</p>
                  </div>
                </div>
                <button onClick={() => setIsNewCourseModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCourseSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Course Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Autonomous Drone Telemetry & Mission Control"
                      value={newCourseForm.title}
                      onChange={(e) => setNewCourseForm({ ...newCourseForm, title: e.target.value })}
                      className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Discipline Category</label>
                    <select
                      value={newCourseForm.category}
                      onChange={(e) => setNewCourseForm({ ...newCourseForm, category: e.target.value as any })}
                      className="w-full h-10 px-3 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Robotics">Robotics & Hardware</option>
                      <option value="AI">Artificial Intelligence & ML</option>
                      <option value="Coding">Coding & Logic</option>
                      <option value="IoT">IoT & Embedded Systems</option>
                      <option value="STEM Foundations">STEM Foundations</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Difficulty Level</label>
                    <select
                      value={newCourseForm.difficulty}
                      onChange={(e) => setNewCourseForm({ ...newCourseForm, difficulty: e.target.value as any })}
                      className="w-full h-10 px-3 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Min Grade (Class)</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={newCourseForm.minGrade}
                      onChange={(e) => setNewCourseForm({ ...newCourseForm, minGrade: Number(e.target.value) })}
                      className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Max Grade (Class)</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={newCourseForm.maxGrade}
                      onChange={(e) => setNewCourseForm({ ...newCourseForm, maxGrade: Number(e.target.value) })}
                      className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Base Price per Student (₹) *</label>
                    <input
                      type="number"
                      required
                      min={100}
                      step={50}
                      value={newCourseForm.pricePerStudent}
                      onChange={(e) => setNewCourseForm({ ...newCourseForm, pricePerStudent: Number(e.target.value) })}
                      className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Total Modules / Lessons</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        min={1}
                        placeholder="Modules"
                        value={newCourseForm.totalModules}
                        onChange={(e) => setNewCourseForm({ ...newCourseForm, totalModules: Number(e.target.value) })}
                        className="h-10 px-3 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="number"
                        min={1}
                        placeholder="Lessons"
                        value={newCourseForm.totalLessons}
                        onChange={(e) => setNewCourseForm({ ...newCourseForm, totalLessons: Number(e.target.value) })}
                        className="h-10 px-3 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Course Description *</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Outline the core objective, simulator tools, hardware components and project deliverables..."
                      value={newCourseForm.description}
                      onChange={(e) => setNewCourseForm({ ...newCourseForm, description: e.target.value })}
                      className="w-full p-3 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Learning Outcomes (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Ultrasonic Sonar, Differential Drive, PID Tuning, Autonomous Mapping"
                      value={newCourseForm.learningOutcomes}
                      onChange={(e) => setNewCourseForm({ ...newCourseForm, learningOutcomes: e.target.value })}
                      className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsNewCourseModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20"
                  >
                    Save & Publish to Catalog
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Assign Course to School Quick Modal */}
        {selectedCourseForAssign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
            <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div>
                  <h3 className="text-base font-black text-slate-900">Assign Course to Partner School</h3>
                  <p className="text-xs text-indigo-700 font-bold">{selectedCourseForAssign.title}</p>
                </div>
                <button onClick={() => setSelectedCourseForAssign(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAssignToSchool} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Select Partner School *</label>
                  <select
                    required
                    value={targetSchoolId}
                    onChange={(e) => setTargetSchoolId(e.target.value)}
                    className="w-full h-10 px-3 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {realActiveSchools.map(school => (
                      <option key={school.id} value={school.id}>
                        {school.name} ({school.code}) — {school.city}, {school.state}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Eligible Student Grades</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'].map(grade => {
                      const isChecked = assignGrades.includes(grade);
                      return (
                        <button
                          key={grade}
                          type="button"
                          onClick={() => {
                            if (isChecked) {
                              setAssignGrades(assignGrades.filter(g => g !== grade));
                            } else {
                              setAssignGrades([...assignGrades, grade]);
                            }
                          }}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                            isChecked
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {grade}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Student Capacity Limit</label>
                    <input
                      type="number"
                      min={20}
                      step={10}
                      value={assignCapacity}
                      onChange={(e) => setAssignCapacity(Number(e.target.value))}
                      className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Contract Applied Rate</label>
                    <div className="h-10 px-3 rounded-xl bg-slate-100 flex items-center font-bold text-xs text-slate-800">
                      ₹{selectedCourseForAssign.pricePerStudent?.toLocaleString('en-IN') || 999} / student
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-xs text-indigo-900 space-y-1">
                  <div className="font-bold flex items-center justify-between">
                    <span>Estimated Contract Value:</span>
                    <span className="font-black text-indigo-700">
                      ₹{((selectedCourseForAssign.pricePerStudent || 999) * assignCapacity).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-700">
                    Regional & school overrides configured in the Pricing Engine will automatically calculate invoices deterministically.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedCourseForAssign(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20"
                  >
                    Confirm School Allocation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 3: View Full Course Syllabus & Details */}
        {selectedCourseForDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
            <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {selectedCourseForDetail.category}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">
                    {selectedCourseForDetail.title}
                  </h3>
                </div>
                <button onClick={() => setSelectedCourseForDetail(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">Course Abstract</h4>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                    {selectedCourseForDetail.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Grade Band</span>
                    <span className="text-sm font-black text-slate-800">Class {selectedCourseForDetail.minGrade}–{selectedCourseForDetail.maxGrade}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Curriculum</span>
                    <span className="text-sm font-black text-slate-800">{selectedCourseForDetail.totalModules} Modules</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Sessions</span>
                    <span className="text-sm font-black text-slate-800">{selectedCourseForDetail.totalLessons} Lessons</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Base Unit Rate</span>
                    <span className="text-sm font-black text-indigo-700">₹{selectedCourseForDetail.pricePerStudent}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">Prerequisites</h4>
                  <p className="text-xs text-slate-600">
                    {selectedCourseForDetail.prerequisites || 'Basic computing skills and curiosity for innovation.'}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Curriculum Learning Outcomes</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(selectedCourseForDetail.learningOutcomes || []).map((out, i) => (
                      <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{out}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-slate-100 mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedCourseForDetail(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                >
                  Close Syllabus Preview
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 4: Quick Base Price Edit */}
        {editingPriceCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
            <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900">Update Base Course Price</h3>
                <button onClick={() => setEditingPriceCourse(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-500">
                {editingPriceCourse.title}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Base Price Per Student (₹)</label>
                <input
                  type="number"
                  min={100}
                  step={50}
                  value={newPriceValue}
                  onChange={(e) => setNewPriceValue(Number(e.target.value))}
                  className="w-full h-10 px-3 text-sm font-black rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPriceCourse(null)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveBasePrice}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                >
                  Save New Base Rate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 5: Delete Course Confirmation with Safety Guard */}
        {selectedCourseForDelete && (() => {
          const associatedAssignments = schoolCourseAssignments.filter(a => a.courseId === selectedCourseForDelete.id);
          const associatedEnrollments = enrollments.filter(e => e.courseId === selectedCourseForDelete.id);
          const hasActiveDependencies = associatedAssignments.length > 0 || associatedEnrollments.length > 0;

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
              <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${hasActiveDependencies ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                      {hasActiveDependencies ? <Shield className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">
                        {hasActiveDependencies ? 'Course Deletion Blocked' : 'Confirm Permanent Deletion'}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-mono">ID: {selectedCourseForDelete.id}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedCourseForDelete(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="font-bold text-slate-900 text-sm">
                    {selectedCourseForDelete.title}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Assigned Schools:</span>
                      <strong className="text-slate-800">{associatedAssignments.length} Schools</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Enrolled Students:</span>
                      <strong className="text-slate-800">{associatedEnrollments.length} Students</strong>
                    </div>
                  </div>
                </div>

                {hasActiveDependencies ? (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <strong>Active academic dependencies detected.</strong> Deleting this course will corrupt student learning transcripts, assessment logs, and partner school contracts.
                      </div>
                    </div>
                    <p className="text-[11px] text-amber-700">
                      Recommendation: Archive the course instead. Archiving hides the course from new enrollments while safeguarding historical records.
                    </p>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      Are you sure you want to permanently delete this course? This action cannot be undone.
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCourseForDelete(null)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  {hasActiveDependencies ? (
                    <button
                      type="button"
                      onClick={() => handleToggleArchive(selectedCourseForDelete)}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>Archive Course Instead</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleConfirmDelete(false)}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Permanently</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Modal 6: Edit Course Modal */}
        {selectedCourseForEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
            <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Edit InnovatMind Course</h3>
                    <p className="text-xs text-slate-500">Update curriculum metadata, target grade bands, and central pricing.</p>
                  </div>
                </div>
                <button onClick={() => setSelectedCourseForEdit(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditCourse} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Course Title *</label>
                    <input
                      type="text"
                      required
                      value={editCourseForm.title}
                      onChange={(e) => setEditCourseForm({ ...editCourseForm, title: e.target.value })}
                      className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Discipline Category</label>
                    <select
                      value={editCourseForm.category}
                      onChange={(e) => setEditCourseForm({ ...editCourseForm, category: e.target.value as any })}
                      className="w-full h-10 px-3 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Robotics">Robotics & Hardware</option>
                      <option value="AI">Artificial Intelligence & ML</option>
                      <option value="Coding">Coding & Logic</option>
                      <option value="IoT">IoT & Embedded Systems</option>
                      <option value="STEM Foundations">STEM Foundations</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Difficulty Level</label>
                    <select
                      value={editCourseForm.difficulty}
                      onChange={(e) => setEditCourseForm({ ...editCourseForm, difficulty: e.target.value as any })}
                      className="w-full h-10 px-3 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Min Grade (Class)</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={editCourseForm.minGrade}
                      onChange={(e) => setEditCourseForm({ ...editCourseForm, minGrade: Number(e.target.value) })}
                      className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Max Grade (Class)</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={editCourseForm.maxGrade}
                      onChange={(e) => setEditCourseForm({ ...editCourseForm, maxGrade: Number(e.target.value) })}
                      className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Base Price Per Student (₹)</label>
                    <input
                      type="number"
                      min={0}
                      step={50}
                      value={editCourseForm.pricePerStudent}
                      onChange={(e) => setEditCourseForm({ ...editCourseForm, pricePerStudent: Number(e.target.value) })}
                      className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Prerequisites</label>
                    <input
                      type="text"
                      value={editCourseForm.prerequisites}
                      onChange={(e) => setEditCourseForm({ ...editCourseForm, prerequisites: e.target.value })}
                      className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Course Description *</label>
                    <textarea
                      rows={3}
                      required
                      value={editCourseForm.description}
                      onChange={(e) => setEditCourseForm({ ...editCourseForm, description: e.target.value })}
                      className="w-full p-3 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Learning Outcomes (comma separated)</label>
                    <input
                      type="text"
                      value={editCourseForm.learningOutcomes}
                      onChange={(e) => setEditCourseForm({ ...editCourseForm, learningOutcomes: e.target.value })}
                      className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedCourseForEdit(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20"
                  >
                    Save Course Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 7: Curriculum & Lesson Builder Modal */}
        {selectedCourseForCurriculum && (() => {
          const activeModule = curriculumWorkingModules.find(m => m.id === activeCurriculumModuleId) || curriculumWorkingModules[0];

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
              <div className="w-full max-w-5xl bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 max-h-[92vh] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900">
                          Curriculum Builder: {selectedCourseForCurriculum.title}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Configure Modules → Lessons → Activities → Quizzes & Assessments
                        </p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedCourseForCurriculum(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Two Column Layout: Modules Sidebar + Lessons Editor */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 max-h-[62vh] overflow-hidden">
                    {/* Modules List (Left Column) */}
                    <div className="md:col-span-4 border border-slate-200 rounded-xl p-3 flex flex-col justify-between bg-slate-50/50 overflow-y-auto max-h-[60vh]">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Modules ({curriculumWorkingModules.length})
                          </span>
                          <button
                            type="button"
                            onClick={handleAddModule}
                            className="px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Module</span>
                          </button>
                        </div>

                        {curriculumWorkingModules.map((mod) => {
                          const isActive = mod.id === activeCurriculumModuleId;
                          return (
                            <div
                              key={mod.id}
                              onClick={() => setActiveCurriculumModuleId(mod.id)}
                              className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                                isActive
                                  ? 'bg-white border-indigo-500 shadow-sm ring-1 ring-indigo-500'
                                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 truncate">
                                  {mod.title}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteModule(mod.id);
                                  }}
                                  className="text-slate-400 hover:text-rose-600 p-1"
                                  title="Delete Module"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                                <span>{mod.lessons?.length || 0} Lessons</span>
                                <span>•</span>
                                <span>Order #{mod.order}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Lessons & Content Editor (Right Column) */}
                    <div className="md:col-span-8 border border-slate-200 rounded-xl p-4 overflow-y-auto max-h-[60vh] space-y-4">
                      {activeModule ? (
                        <>
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
                                Active Module
                              </span>
                              <input
                                type="text"
                                value={activeModule.title}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCurriculumWorkingModules(prev => prev.map(m => m.id === activeModule.id ? { ...m, title: val } : m));
                                }}
                                className="text-sm font-bold text-slate-900 block border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none w-full"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAddLesson(activeModule.id)}
                              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Lesson</span>
                            </button>
                          </div>

                          {/* Lessons list */}
                          <div className="space-y-3">
                            {(activeModule.lessons || []).length === 0 ? (
                              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                                No lessons added yet in this module. Click "Add Lesson" above to get started.
                              </div>
                            ) : (
                              (activeModule.lessons || []).map((lesson) => (
                                <div key={lesson.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-1">
                                      <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                                        {lesson.order}
                                      </span>
                                      <input
                                        type="text"
                                        value={lesson.title}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setCurriculumWorkingModules(prev => prev.map(m => m.id === activeModule.id ? {
                                            ...m,
                                            lessons: (m.lessons || []).map(l => l.id === lesson.id ? { ...l, title: val } : l)
                                          } : m));
                                        }}
                                        className="text-xs font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none flex-1"
                                      />
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <select
                                        value={lesson.lessonType}
                                        onChange={(e) => {
                                          const val = e.target.value as LessonType;
                                          setCurriculumWorkingModules(prev => prev.map(m => m.id === activeModule.id ? {
                                            ...m,
                                            lessons: (m.lessons || []).map(l => l.id === lesson.id ? { ...l, lessonType: val } : l)
                                          } : m));
                                        }}
                                        className="text-[11px] font-bold rounded-lg border border-slate-200 px-2 py-1 bg-white"
                                      >
                                        <option value="VIDEO">Video</option>
                                        <option value="DOCUMENT">Document</option>
                                        <option value="PDF">PDF</option>
                                        <option value="ACTIVITY">Activity</option>
                                        <option value="QUIZ">Quiz</option>
                                      </select>

                                      <div className="flex items-center gap-1 text-[11px] text-slate-600">
                                        <input
                                          type="number"
                                          min={5}
                                          max={180}
                                          value={lesson.durationMinutes}
                                          onChange={(e) => {
                                            const val = Number(e.target.value);
                                            setCurriculumWorkingModules(prev => prev.map(m => m.id === activeModule.id ? {
                                              ...m,
                                              lessons: (m.lessons || []).map(l => l.id === lesson.id ? { ...l, durationMinutes: val } : l)
                                            } : m));
                                          }}
                                          className="w-12 px-1.5 py-1 text-center font-bold rounded-lg border border-slate-200 bg-white"
                                        />
                                        <span>min</span>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => handleDeleteLesson(activeModule.id, lesson.id)}
                                        className="text-slate-400 hover:text-rose-600 p-1"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Sub-items: Activities and Assessments */}
                                  <div className="pt-2 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                    {/* Activities */}
                                    <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 space-y-1.5">
                                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                                        <span>Activities ({lesson.activities?.length || 0})</span>
                                        <button
                                          type="button"
                                          onClick={() => handleAddActivity(activeModule.id, lesson.id)}
                                          className="text-indigo-600 hover:text-indigo-800 font-bold"
                                        >
                                          + Add
                                        </button>
                                      </div>
                                      {(lesson.activities || []).map((act) => (
                                        <div key={act.id} className="text-[11px] p-1.5 rounded bg-slate-50 border border-slate-100 flex items-center justify-between">
                                          <span className="truncate">{act.title} ({act.activityType})</span>
                                          <span className="text-slate-400 font-bold">{act.maxScore} pts</span>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Assessments / Quizzes */}
                                    <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 space-y-1.5">
                                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                                        <span>Assessments ({lesson.assessments?.length || 0})</span>
                                        <button
                                          type="button"
                                          onClick={() => handleAddAssessment(activeModule.id, lesson.id)}
                                          className="text-indigo-600 hover:text-indigo-800 font-bold"
                                        >
                                          + Add
                                        </button>
                                      </div>
                                      {(lesson.assessments || []).map((ass) => (
                                        <div key={ass.id} className="text-[11px] p-1.5 rounded bg-slate-50 border border-slate-100 flex items-center justify-between">
                                          <span className="truncate">{ass.title}</span>
                                          <span className="text-slate-400 font-bold">{ass.questionsCount} Qs ({ass.passingScorePercent}%)</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="p-12 text-center text-slate-400 text-xs">
                          Select or add a module from the left column.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Save CTA */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    {curriculumWorkingModules.length} Modules • {curriculumWorkingModules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} Lessons
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCourseForCurriculum(null)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveCurriculum}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20"
                    >
                      Save Curriculum Structure
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      </div>
    </AppShell>
  );
}
