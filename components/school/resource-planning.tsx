"use client";

import React, { useState, useEffect } from 'react';
import {
  Layers,
  MonitorPlay,
  FlaskConical,
  Laptop,
  BookOpen,
  Volume2,
  Trophy,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Filter,
  X,
  UserCheck,
  Calendar
} from 'lucide-react';

export interface SchoolResource {
  id: string;
  name: string;
  category: 'ROOM' | 'EQUIPMENT' | 'LAB' | 'SPORTS';
  location: string;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';
  bookedBy?: {
    className: string;
    teacherName: string;
    period: string;
    purpose: string;
  };
  totalQuantity?: number;
  condition?: string;
}

export function ResourcePlanning() {
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'ROOM' | 'LAB' | 'EQUIPMENT' | 'SPORTS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Resources state initialized from localStorage
  const [resources, setResources] = useState<SchoolResource[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('school_os_resources');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return [
      {
        id: 'res-1',
        name: 'Smart Classroom & Projector Room',
        category: 'ROOM',
        location: 'Room 201 (First Floor)',
        status: 'IN_USE',
        bookedBy: {
          className: 'Class 8-A',
          teacherName: 'Rajesh Kumar',
          period: 'Period 3 (10:15 - 11:00 AM)',
          purpose: 'Science Video Demonstration & Quiz'
        },
        condition: 'Active • Audio-Visual System Calibrated'
      },
      {
        id: 'res-2',
        name: 'Science & Robotics STEM Lab',
        category: 'LAB',
        location: 'Ground Floor East Wing',
        status: 'AVAILABLE',
        condition: 'Prepared & Sanitized for Practical Sessions'
      },
      {
        id: 'res-3',
        name: 'Computer & Tablet Lab (20 Devices)',
        category: 'LAB',
        location: 'Room 204',
        status: 'AVAILABLE',
        totalQuantity: 20,
        condition: 'All 20 learning tablets fully charged'
      },
      {
        id: 'res-4',
        name: 'Portable PA Sound System & Mic Kit',
        category: 'EQUIPMENT',
        location: 'Faculty Room Equipment Cabinet',
        status: 'IN_USE',
        bookedBy: {
          className: 'Morning Assembly',
          teacherName: 'Suman Lata (Faculty)',
          period: 'Morning (08:30 - 09:30 AM)',
          purpose: 'Prayer, Address & Announcements'
        },
        condition: 'Battery Backup Operational'
      },
      {
        id: 'res-5',
        name: 'Sports Ground & Athletics / Cricket Kit',
        category: 'SPORTS',
        location: 'Central Sports Field',
        status: 'AVAILABLE',
        condition: 'Field Dry & Boundary Lines Marked'
      },
      {
        id: 'res-6',
        name: 'Mobile Projector Screen Unit #2',
        category: 'EQUIPMENT',
        location: 'Administrative Office Storage',
        status: 'AVAILABLE',
        condition: 'Standby for Guest Lectures'
      }
    ];
  });

  // Booking Modal State
  const [selectedResource, setSelectedResource] = useState<SchoolResource | null>(null);
  const [bookingClass, setBookingClass] = useState('Class 6-A');
  const [bookingTeacher, setBookingTeacher] = useState('Rajesh Kumar');
  const [bookingPeriod, setBookingPeriod] = useState('Period 4 (11:00 AM)');
  const [bookingPurpose, setBookingPurpose] = useState('');

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('school_os_resources', JSON.stringify(resources));
    } catch {}
  }, [resources]);

  const handleBookResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResource) return;

    setResources(prev => prev.map(res => {
      if (res.id === selectedResource.id) {
        return {
          ...res,
          status: 'IN_USE',
          bookedBy: {
            className: bookingClass,
            teacherName: bookingTeacher.trim() || 'Assigned Faculty',
            period: bookingPeriod,
            purpose: bookingPurpose.trim() || 'Class Academic Session'
          }
        };
      }
      return res;
    }));

    setSelectedResource(null);
    setBookingPurpose('');
  };

  const handleReleaseResource = (id: string) => {
    setResources(prev => prev.map(res => {
      if (res.id === id) {
        return {
          ...res,
          status: 'AVAILABLE',
          bookedBy: undefined
        };
      }
      return res;
    }));
  };

  const filteredResources = resources.filter(res => {
    const matchesCategory = activeCategory === 'ALL' || res.category === activeCategory;
    const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          res.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getIcon = (category: string) => {
    switch (category) {
      case 'ROOM': return MonitorPlay;
      case 'LAB': return FlaskConical;
      case 'EQUIPMENT': return Volume2;
      case 'SPORTS': return Trophy;
      default: return Layers;
    }
  };

  return (
    <div className="space-y-6">
      {/* Clean Executive Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              Facility Allocation
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Resource & Facility Planning
          </h2>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{resources.filter(r => r.status === 'AVAILABLE').length} Available</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'ALL', label: 'All Resources' },
            { id: 'ROOM', label: 'Rooms & Halls' },
            { id: 'LAB', label: 'Laboratories & STEM' },
            { id: 'EQUIPMENT', label: 'Audiovisual & Projector' },
            { id: 'SPORTS', label: 'Sports & Grounds' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === tab.id
                  ? 'btn-3d-primary'
                  : 'btn-3d-secondary text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search facility or equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 text-xs font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
          />
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((res) => {
          const Icon = getIcon(res.category);
          const isAvailable = res.status === 'AVAILABLE';

          return (
            <div
              key={res.id}
              className={`rounded-2xl p-5 flex flex-col justify-between transition-all ${
                isAvailable ? 'card-3d bg-white' : 'card-3d border-amber-300 bg-amber-50/30'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                      isAvailable ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-100 text-amber-700'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                        {res.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-normal mt-0.5">
                        Location: {res.location}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${
                    isAvailable
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {isAvailable ? '● Available' : '● Booked / In Use'}
                  </span>
                </div>

                {/* Booking Info or Condition */}
                {isAvailable ? (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 mb-4">
                    <p className="text-xs text-slate-600 font-normal">
                      Condition: <strong className="text-slate-800 font-medium">{res.condition || 'Operational and ready for use'}</strong>
                    </p>
                    {res.totalQuantity && (
                      <p className="text-xs text-slate-500 font-normal mt-1">
                        Capacity: {res.totalQuantity} active units
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-white border border-amber-200 mb-4 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-900">
                        {res.bookedBy?.className}
                      </span>
                      <span className="text-slate-500 font-medium">
                        {res.bookedBy?.period}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-normal">
                      Faculty: <strong className="text-slate-900 font-semibold">{res.bookedBy?.teacherName}</strong>
                    </p>
                    <p className="text-xs text-slate-500 italic">
                      "{res.bookedBy?.purpose}"
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons (3D Tactile with Hover Effects) */}
              <div className="pt-3 border-t border-slate-100">
                {isAvailable ? (
                  <button
                    onClick={() => setSelectedResource(res)}
                    className="btn-3d-primary w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Reserve for Class Session</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleReleaseResource(res.id)}
                    className="btn-3d-secondary hover:text-emerald-700 w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Release & Mark Available</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking Modal */}
      {selectedResource && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                  Facility Allocation
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Book {selectedResource.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedResource(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookResource} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Class Group *
                  </label>
                  <select
                    value={bookingClass}
                    onChange={(e) => setBookingClass(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm font-normal bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Class 1">Class 1</option>
                    <option value="Class 2">Class 2</option>
                    <option value="Class 3">Class 3</option>
                    <option value="Class 4">Class 4</option>
                    <option value="Class 5">Class 5</option>
                    <option value="Class 6-A">Class 6-A</option>
                    <option value="Class 6-B">Class 6-B</option>
                    <option value="Class 7-A">Class 7-A</option>
                    <option value="Class 7-B">Class 7-B</option>
                    <option value="Class 8-A">Class 8-A</option>
                    <option value="Class 9-A">Class 9-A</option>
                    <option value="Class 10">Class 10</option>
                    <option value="All Campus Assembly">All Campus Assembly</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Period Slot *
                  </label>
                  <select
                    value={bookingPeriod}
                    onChange={(e) => setBookingPeriod(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm font-normal bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Period 1 (08:30 - 09:15 AM)">Period 1 (08:30 - 09:15 AM)</option>
                    <option value="Period 2 (09:15 - 10:00 AM)">Period 2 (09:15 - 10:00 AM)</option>
                    <option value="Period 3 (10:15 - 11:00 AM)">Period 3 (10:15 - 11:00 AM)</option>
                    <option value="Period 4 (11:00 - 11:45 AM)">Period 4 (11:00 - 11:45 AM)</option>
                    <option value="Period 5 (12:30 - 01:15 PM)">Period 5 (12:30 - 01:15 PM)</option>
                    <option value="Period 6 (01:15 - 02:00 PM)">Period 6 (01:15 - 02:00 PM)</option>
                    <option value="After School Activity">After-School Co-Curricular Club</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Faculty In Charge *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kumar, Sneha Patel, Anita Joshi"
                  value={bookingTeacher}
                  onChange={(e) => setBookingTeacher(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Academic Purpose / Topic
                </label>
                <input
                  type="text"
                  placeholder="e.g. Solar system video demonstration, Chemistry titration lab, Python coding test"
                  value={bookingPurpose}
                  onChange={(e) => setBookingPurpose(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedResource(null)}
                  className="btn-3d-secondary px-4 py-2.5 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-bold"
                >
                  Confirm Reservation ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
