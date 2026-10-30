"use client";

import React, { useState } from 'react';
import {
  Gamepad2,
  Trophy,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Cpu,
  Brain,
  HardDrive,
  Monitor,
  Flame,
  ArrowRight,
  Zap,
  Lightbulb
} from 'lucide-react';
import { LectureGame } from '@/lib/types';

interface InteractiveLectureGameProps {
  game: LectureGame;
  lectureNumber: number;
  onGameCompleted: (score: number) => void;
}

export function InteractiveLectureGame({
  game,
  lectureNumber,
  onGameCompleted
}: InteractiveLectureGameProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(100);

  // GAME TYPE 1: HARDWARE MATCH (Component Architect Lab)
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [matchedSlots, setMatchedSlots] = useState<Record<string, string>>({}); // slotId -> itemId

  // GAME TYPE 2: CODING SEQUENCE
  const [sequenceBlocks, setSequenceBlocks] = useState<any[]>(() => {
    const rawBlocks = game.config?.blocks || [
      { id: 'b1', text: 'Initialize Sensors & Lidar', correctOrder: 1 },
      { id: 'b2', text: 'Read Input Stream from Environment', correctOrder: 2 },
      { id: 'b3', text: 'Evaluate Obstacle Condition (if path clear)', correctOrder: 3 },
      { id: 'b4', text: 'Drive Motors Forward 10cm', correctOrder: 4 }
    ];
    // Shuffle initial display
    return [...rawBlocks].sort(() => Math.random() - 0.5);
  });

  // GAME TYPE 3: MEMORY CARDS
  const [flippedCardIds, setFlippedCardIds] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);

  // GAME TYPE 4: BUG HUNTER
  const [selectedBugLine, setSelectedBugLine] = useState<number | null>(null);
  const [bugEliminated, setBugEliminated] = useState(false);

  // Handle Hardware Match Slot Click
  const handleHardwareSlotClick = (slotId: string, expectedItem: string) => {
    if (!selectedItem) return;
    if (selectedItem === expectedItem) {
      const next = { ...matchedSlots, [slotId]: selectedItem };
      setMatchedSlots(next);
      setSelectedItem(null);

      // Check if all slots matched
      const totalItems = game.config?.items?.length || 4;
      if (Object.keys(next).length >= totalItems) {
        setIsCompleted(true);
        onGameCompleted(score);
      }
    } else {
      // Small penalty on mismatch
      setScore(prev => Math.max(70, prev - 5));
      alert('Mismatch! Check component function and try another slot.');
    }
  };

  // Move Sequence Block Up/Down
  const handleMoveBlock = (index: number, direction: 'UP' | 'DOWN') => {
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sequenceBlocks.length) return;
    const copy = [...sequenceBlocks];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    setSequenceBlocks(copy);
  };

  // Verify Sequence
  const handleVerifySequence = () => {
    const isCorrect = sequenceBlocks.every((b, idx) => b.correctOrder === idx + 1);
    if (isCorrect) {
      setIsCompleted(true);
      onGameCompleted(score);
    } else {
      setScore(prev => Math.max(70, prev - 5));
      alert('Algorithm sequence is not in the correct order yet. Think about what needs to run first!');
    }
  };

  // Bug Hunter Tap
  const handleTapBugLine = (lineObj: any) => {
    setSelectedBugLine(lineObj.line);
    if (lineObj.isBug) {
      setBugEliminated(true);
      setIsCompleted(true);
      onGameCompleted(score);
    } else {
      setScore(prev => Math.max(70, prev - 5));
    }
  };

  return (
    <div className="p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl text-white shadow-2xl border border-indigo-500/30 space-y-5 animate-fade-in">
      
      {/* Game Header */}
      <div className="flex items-center justify-between border-b border-indigo-800/50 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-300 flex items-center justify-center font-bold">
            <Gamepad2 className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white">{game.title}</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                {game.difficulty}
              </span>
            </div>
            <p className="text-xs text-indigo-300/80 mt-0.5">
              {game.instructions}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-400/30 rounded-xl text-amber-300 font-black text-xs">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>+{game.xpBonus || 50} XP</span>
        </div>
      </div>

      {/* COMPLETED SUCCESS BANNER */}
      {isCompleted && (
        <div className="p-5 bg-emerald-500/10 border border-emerald-400/40 rounded-2xl text-center space-y-2 animate-fade-in">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Trophy className="w-6 h-6" />
          </div>
          <h4 className="text-base font-black text-emerald-300">Challenge Mastered!</h4>
          <p className="text-xs text-emerald-200">
            You scored {score} points and earned +{game.xpBonus} Bonus XP!
            Your learning journey for Lecture {lectureNumber} is 100% complete!
          </p>
        </div>
      )}

      {/* GAME WORKSPACE: HARDWARE MATCH */}
      {!isCompleted && game.type === 'HARDWARE_MATCH' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <span className="text-xs font-bold text-indigo-200 block">Step 1: Tap a component to select</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'cpu', name: 'CPU (Processor)', icon: Cpu, slot: 'brain' },
                { id: 'ram', name: 'RAM (Fast Memory)', icon: Brain, slot: 'memory' },
                { id: 'ssd', name: 'SSD (Storage)', icon: HardDrive, slot: 'storage' },
                { id: 'gpu', name: 'GPU (Graphics Card)', icon: Monitor, slot: 'display' }
              ].map(item => {
                const isSelected = selectedItem === item.id;
                const isMatched = Object.values(matchedSlots).includes(item.id);
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    disabled={isMatched}
                    onClick={() => setSelectedItem(item.id)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      isMatched
                        ? 'opacity-40 border-slate-700 bg-slate-800'
                        : isSelected
                        ? 'border-indigo-400 bg-indigo-600/40 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-400'
                        : 'border-indigo-800/60 bg-indigo-950/40 hover:bg-indigo-900/40'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-indigo-300" />
                    <span className="text-xs font-bold text-slate-100">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-indigo-200 block">Step 2: Tap the matching system slot</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { id: 'brain', label: 'Primary Processing Core (CPU)', expected: 'cpu' },
                { id: 'memory', label: 'High-Speed Working Memory (RAM)', expected: 'ram' },
                { id: 'storage', label: 'Persistent Long-Term Storage (SSD)', expected: 'ssd' },
                { id: 'display', label: '3D Graphics & Visual Display (GPU)', expected: 'display' }
              ].map(slot => {
                const filled = matchedSlots[slot.id];
                return (
                  <button
                    key={slot.id}
                    disabled={Boolean(filled)}
                    onClick={() => handleHardwareSlotClick(slot.id, slot.expected)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      filled
                        ? 'border-emerald-500/60 bg-emerald-950/30 text-emerald-300'
                        : 'border-slate-700 bg-slate-900/60 hover:border-indigo-500 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-200">{slot.label}</span>
                    {filled ? (
                      <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Connected
                      </span>
                    ) : (
                      <span className="text-[11px] text-indigo-400 font-semibold">Tap to Connect</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* GAME TYPE 2: CODING SEQUENCE BUILDER */}
      {!isCompleted && game.type === 'CODING_SEQUENCE' && (
        <div className="space-y-3">
          <span className="text-xs font-bold text-indigo-200 block">
            Use the arrow buttons to arrange the algorithm in execution order:
          </span>

          <div className="space-y-2">
            {sequenceBlocks.map((block, idx) => (
              <div
                key={block.id}
                className="p-3 bg-slate-900/90 border border-indigo-700/50 rounded-xl flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-300 font-black flex items-center justify-center text-[11px]">
                    {idx + 1}
                  </span>
                  <span className="font-mono text-slate-200">{block.text}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMoveBlock(idx, 'UP')}
                    className="p-1 rounded bg-slate-800 hover:bg-indigo-600 disabled:opacity-30 text-slate-300"
                  >
                    ↑
                  </button>
                  <button
                    disabled={idx === sequenceBlocks.length - 1}
                    onClick={() => handleMoveBlock(idx, 'DOWN')}
                    className="p-1 rounded bg-slate-800 hover:bg-indigo-600 disabled:opacity-30 text-slate-300"
                  >
                    ↓
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleVerifySequence}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Verify &amp; Run Algorithm</span>
            </button>
          </div>
        </div>
      )}

      {/* GAME TYPE 4: BUG HUNTER */}
      {!isCompleted && game.type === 'BUG_HUNTER' && (
        <div className="space-y-3">
          <span className="text-xs font-bold text-indigo-200 block">
            Tap the line of code that contains the logic bug:
          </span>

          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 font-mono text-xs">
            {(game.config?.codeLines || [
              { line: 1, text: 'sensor_active = True', isBug: false },
              { line: 2, text: 'motor_speed = 100', isBug: false },
              { line: 3, text: 'while sensor_active == False:  # Check loop trigger condition', isBug: true },
              { line: 4, text: '    drive_forward(motor_speed)', isBug: false }
            ]).map((line: any) => {
              const isSelected = selectedBugLine === line.line;
              return (
                <button
                  key={line.line}
                  onClick={() => handleTapBugLine(line)}
                  className={`w-full p-2.5 rounded-lg text-left transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? (line.isBug ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500' : 'bg-rose-950/80 text-rose-300 border border-rose-500')
                      : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <span>Line {line.line}: {line.text}</span>
                  {isSelected && (line.isBug ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="text-[10px]">No bug here</span>)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* DEFAULT / SIMULATION FALLBACK */}
      {!isCompleted && game.type !== 'HARDWARE_MATCH' && game.type !== 'CODING_SEQUENCE' && game.type !== 'BUG_HUNTER' && (
        <div className="p-4 bg-slate-900/60 rounded-2xl border border-indigo-700/30 text-center space-y-3">
          <p className="text-xs text-indigo-200">
            Interactive STEM Simulator: Test inputs and verify circuit parameters.
          </p>
          <button
            onClick={() => {
              setIsCompleted(true);
              onGameCompleted(100);
            }}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            Run Circuit Simulation &amp; Complete Challenge
          </button>
        </div>
      )}

    </div>
  );
}
