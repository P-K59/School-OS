"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Plus, 
  GripVertical,
  Settings,
  Code2,
  HelpCircle,
  Video,
  Save,
  Trash2,
  CheckCircle2,
  Cpu
} from 'lucide-react';

type ModuleType = 'THEORY' | 'CODE_SANDBOX' | 'QUIZ' | 'VIDEO';

interface CourseModule {
  id: string;
  type: ModuleType;
  title: string;
  xp: number;
}

export default function SuperadminCourseBuilder() {
  const [activeCourse, setActiveCourse] = useState({
    title: 'Advanced AI & Neural Networks',
    category: 'Artificial Intelligence',
    difficulty: 'Advanced',
    status: 'DRAFT',
  });

  const [modules, setModules] = useState<CourseModule[]>([
    { id: 'm1', type: 'THEORY', title: 'Introduction to Perceptrons', xp: 50 },
    { id: 'm2', type: 'CODE_SANDBOX', title: 'Building a Forward Pass (Python)', xp: 150 },
    { id: 'm3', type: 'QUIZ', title: 'Activation Functions Knowledge Check', xp: 100 },
  ]);

  const addModule = (type: ModuleType) => {
    const newModule: CourseModule = {
      id: `m${Date.now()}`,
      type,
      title: `New ${type.toLowerCase()} module`,
      xp: type === 'CODE_SANDBOX' ? 150 : 50,
    };
    setModules([...modules, newModule]);
  };

  const removeModule = (id: string) => {
    setModules(modules.filter((m) => m.id !== id));
  };

  const getModuleIcon = (type: ModuleType) => {
    switch (type) {
      case 'THEORY': return <BookOpen className="w-4 h-4 text-emerald-400" />;
      case 'CODE_SANDBOX': return <Code2 className="w-4 h-4 text-indigo-400" />;
      case 'QUIZ': return <HelpCircle className="w-4 h-4 text-purple-400" />;
      case 'VIDEO': return <Video className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            Global Curriculum Builder
            <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10 font-mono text-xs">
              AUTHOR_MODE
            </Badge>
          </h1>
          <p className="text-slate-400 mt-1 font-medium text-sm">Design and deploy STEM & AI courses to all tenant schools instantly.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold bg-transparent">
            View Course Library
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] text-xs font-bold gap-2">
            <Save className="w-3.5 h-3.5" />
            Publish Curriculum
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: Course Metadata & Settings (4 cols) */}
        <div className="xl:col-span-4 space-y-6">
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-md">
            <CardHeader className="p-5 border-b border-slate-800 flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-400" />
                Course Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Course Title</label>
                <input 
                  type="text" 
                  value={activeCourse.title}
                  onChange={(e) => setActiveCourse({...activeCourse, title: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
                  <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 appearance-none">
                    <option>Artificial Intelligence</option>
                    <option>Robotics (Kinematics)</option>
                    <option>Python Data Science</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Difficulty</label>
                  <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 appearance-none">
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option selected>Advanced</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Target Audience</label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10 cursor-pointer">Grade 8-10</Badge>
                  <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 bg-cyan-500/10 cursor-pointer">Grade 11-12</Badge>
                  <Badge variant="outline" className="border-slate-700 text-slate-500 hover:text-slate-300 cursor-pointer"><Plus className="w-3 h-3 mr-1" /> Add</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-md">
            <CardHeader className="p-5 border-b border-slate-800 pb-4">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                Linked Sandbox Environment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-300 space-y-2">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-slate-500">Engine</span>
                  <span className="font-mono text-emerald-400">Python 3.10.x</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-2 pt-1">
                  <span className="text-slate-500">Virtual Bot</span>
                  <span className="font-mono text-indigo-400">Disabled</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-500">AI Tutor Mode</span>
                  <span className="font-mono text-emerald-400">Strict Socratic</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Drag-and-Drop Module Assembler (8 cols) */}
        <div className="xl:col-span-8 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Curriculum Modules</h3>
            <span className="text-xs text-slate-500 font-mono">Total XP Payload: {modules.reduce((acc, m) => acc + m.xp, 0)} XP</span>
          </div>

          {/* Module List */}
          <div className="space-y-3">
            {modules.map((mod, idx) => (
              <div 
                key={mod.id} 
                className="group flex items-stretch gap-3 bg-slate-900/50 border border-slate-800 rounded-2xl p-2 hover:border-slate-700 transition-colors backdrop-blur-sm"
              >
                {/* Drag Handle */}
                <div className="flex items-center justify-center w-8 shrink-0 text-slate-600 hover:text-slate-300 cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-5 h-5" />
                </div>
                
                {/* Module Body */}
                <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-inner">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shadow-sm shrink-0">
                      {getModuleIcon(mod.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Module {idx + 1}</span>
                        <Badge variant="outline" className="text-[9px] border-slate-800 text-slate-400 py-0 h-4">
                          {mod.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <input 
                        type="text" 
                        value={mod.title}
                        onChange={(e) => {
                          const newMods = [...modules];
                          newMods[idx].title = e.target.value;
                          setModules(newMods);
                        }}
                        className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-emerald-500 focus:outline-none text-sm font-bold text-white w-full max-w-xs transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-4 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">XP</span>
                      <input 
                        type="number" 
                        value={mod.xp}
                        onChange={(e) => {
                          const newMods = [...modules];
                          newMods[idx].xp = parseInt(e.target.value) || 0;
                          setModules(newMods);
                        }}
                        className="w-14 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500 text-right"
                      />
                    </div>
                    
                    <button className="text-slate-500 hover:text-indigo-400 text-xs font-bold transition-colors">
                      Edit Content
                    </button>
                    
                    <button 
                      onClick={() => removeModule(mod.id)}
                      className="text-slate-600 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Module Dropzone */}
          <div className="mt-6 p-6 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20 flex flex-col items-center justify-center text-center">
            <h4 className="text-sm font-bold text-slate-300 mb-4">Drag and Drop or Add a New Module</h4>
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={() => addModule('THEORY')} variant="outline" className="border-emerald-500/20 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs gap-2">
                <BookOpen className="w-3.5 h-3.5" /> Theory
              </Button>
              <Button onClick={() => addModule('VIDEO')} variant="outline" className="border-cyan-500/20 text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 text-xs gap-2">
                <Video className="w-3.5 h-3.5" /> Video Lab
              </Button>
              <Button onClick={() => addModule('CODE_SANDBOX')} variant="outline" className="border-indigo-500/20 text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 text-xs gap-2">
                <Code2 className="w-3.5 h-3.5" /> Code Sandbox
              </Button>
              <Button onClick={() => addModule('QUIZ')} variant="outline" className="border-purple-500/20 text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 text-xs gap-2">
                <HelpCircle className="w-3.5 h-3.5" /> Quiz
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
