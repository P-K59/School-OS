"use client";

import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  Lock,
  Play,
  ArrowRight,
  X,
  BookOpen,
  Cpu,
  Layers,
  Rocket,
  Award
} from 'lucide-react';

export interface IslandInfo {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  themeColor: string;
  badgeBg: string;
  textColor: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'UNLOCKED' | 'LOCKED';
  progressPct: number;
  icon: any;
  missions: Array<{
    title: string;
    xp: number;
    status: 'DONE' | 'AVAILABLE' | 'LOCKED';
  }>;
}

export const ISLANDS_DATA: IslandInfo[] = [
  {
    id: 1,
    name: 'Starter Island',
    subtitle: 'Computer Basics & Digital Literacy',
    description: 'Explore the fundamental building blocks of computing, safe internet navigation, keyboard mastery, and hardware components.',
    themeColor: 'from-emerald-600 to-teal-700',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    textColor: 'text-emerald-700',
    status: 'COMPLETED',
    progressPct: 100,
    icon: BookOpen,
    missions: [
      { title: 'Keyboard & Mouse Precision Quest', xp: 50, status: 'DONE' },
      { title: 'Inside the Machine: CPU & Memory', xp: 75, status: 'DONE' },
      { title: 'Safe Surfing & Digital Citizenship', xp: 100, status: 'DONE' }
    ]
  },
  {
    id: 2,
    name: 'Coding City',
    subtitle: 'Blockly & Python Foundations',
    description: 'Construct interactive programs, master loops and conditional logic, and solve computational puzzles in the cyber city.',
    themeColor: 'from-cyan-600 to-blue-700',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    textColor: 'text-cyan-700',
    status: 'IN_PROGRESS',
    progressPct: 60,
    icon: Layers,
    missions: [
      { title: 'Drag & Drop Sequence Puzzle', xp: 100, status: 'DONE' },
      { title: 'Python Loop Challenge (While & For)', xp: 150, status: 'AVAILABLE' },
      { title: 'Arcade Game Logic Builder', xp: 200, status: 'LOCKED' }
    ]
  },
  {
    id: 3,
    name: 'Robotics Lab',
    subtitle: 'Sensors, Motors & Simulation',
    description: 'Assemble virtual rovers, calibrate sonar and infrared sensors, and simulate autonomous obstacle-avoidance maneuvers.',
    themeColor: 'from-amber-500 to-orange-600',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    textColor: 'text-amber-700',
    status: 'UNLOCKED',
    progressPct: 25,
    icon: Cpu,
    missions: [
      { title: 'Sonar Distance Calibration Lab', xp: 120, status: 'DONE' },
      { title: 'Autonomous Rover Maze Navigation', xp: 180, status: 'AVAILABLE' },
      { title: 'PID Differential Motor Drive', xp: 250, status: 'LOCKED' }
    ]
  },
  {
    id: 4,
    name: 'AI Mountain',
    subtitle: 'Explore AI & Machine Learning',
    description: 'Climb the crystal peak to discover computer vision, train pattern recognition models, and evaluate neural network weights.',
    themeColor: 'from-purple-600 to-indigo-800',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    textColor: 'text-purple-700',
    status: 'UNLOCKED',
    progressPct: 15,
    icon: Sparkles,
    missions: [
      { title: 'How Computers See: Pixels & Convolution', xp: 150, status: 'AVAILABLE' },
      { title: 'Train an Edge Classifier Model', xp: 200, status: 'LOCKED' },
      { title: 'Ethics in AI & Algorithmic Bias', xp: 150, status: 'LOCKED' }
    ]
  },
  {
    id: 5,
    name: 'Innovation Space',
    subtitle: 'Real Projects & Capstone Launchpad',
    description: 'Synthesize code, robotics, and AI into working capstone projects ready for exhibition and school showcase.',
    themeColor: 'from-rose-500 to-pink-700',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    textColor: 'text-rose-700',
    status: 'UNLOCKED',
    progressPct: 0,
    icon: Rocket,
    missions: [
      { title: 'Smart Automated Street Light Sensor', xp: 250, status: 'AVAILABLE' },
      { title: 'Automated Recycling Trash Sorter', xp: 300, status: 'LOCKED' },
      { title: 'Weather Telemetry Station', xp: 350, status: 'LOCKED' }
    ]
  }
];

export function LearningIslandDrawer({
  island,
  onClose,
  onLaunchMission
}: {
  island: IslandInfo;
  onClose: () => void;
  onLaunchMission: (missionTitle: string) => void;
}) {
  const Icon = island.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 max-w-lg w-full animate-scale-up relative overflow-hidden">
        
        {/* Banner with island theme */}
        <div className={`-mx-6 -mt-6 p-6 bg-gradient-to-r ${island.themeColor} text-white mb-5`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${island.badgeBg}`}>
              Island #{island.id}
            </span>
            <button onClick={onClose} className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Icon className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-xl font-black">{island.name}</h3>
              <p className="text-xs text-white/80 font-medium">{island.subtitle}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs font-bold text-white/90 mb-1">
              <span>Island Mastery</span>
              <span>{island.progressPct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-black/20 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-700"
                style={{ width: `${island.progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          {island.description}
        </p>

        {/* Missions List */}
        <div className="space-y-2 mb-5">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
            Missions &amp; Challenges
          </span>
          {island.missions.map((m, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                m.status === 'DONE'
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : m.status === 'AVAILABLE'
                  ? 'bg-indigo-50/70 border-indigo-200'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {m.status === 'DONE' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : m.status === 'AVAILABLE' ? (
                  <Play className="w-4 h-4 text-indigo-600 shrink-0 fill-indigo-600" />
                ) : (
                  <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span className="text-xs font-bold text-slate-800 truncate">
                  {m.title}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-black text-amber-600">
                  +{m.xp} XP
                </span>
                {m.status === 'AVAILABLE' && (
                  <button
                    onClick={() => {
                      onLaunchMission(m.title);
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                  >
                    Start
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            onLaunchMission(island.missions.find(m => m.status === 'AVAILABLE')?.title || island.missions[0].title);
            onClose();
          }}
          className={`w-full h-11 rounded-xl text-white font-black text-xs shadow-md flex items-center justify-center gap-2 bg-gradient-to-r ${island.themeColor}`}
        >
          <span>Launch Recommended Mission</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
