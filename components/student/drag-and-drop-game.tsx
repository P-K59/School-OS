"use client";

import React, { useState, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  SkipForward,
  Trash2,
  CheckCircle2,
  Trophy,
  Sparkles,
  ArrowRight,
  ArrowUp,
  RotateCw,
  Repeat,
  AlertTriangle,
  Lightbulb,
  X,
  Volume2
} from 'lucide-react';

export type CodeBlockType = 'MOVE_FORWARD' | 'TURN_LEFT' | 'TURN_RIGHT' | 'REPEAT_2X';

interface GridCell {
  x: number;
  y: number;
  type: 'EMPTY' | 'START' | 'TARGET' | 'OBSTACLE' | 'STAR';
}

interface LevelConfig {
  id: number;
  title: string;
  gridSize: number;
  startPos: { x: number; y: number; dir: 'UP' | 'RIGHT' | 'DOWN' | 'LEFT' };
  targetPos: { x: number; y: number };
  obstacles: { x: number; y: number }[];
  stars: { x: number; y: number }[];
  hint: string;
  xpReward: number;
  coinsReward: number;
}

const LEVELS: LevelConfig[] = [
  {
    id: 1,
    title: 'Mission 1: First Steps (Straight Forward)',
    gridSize: 5,
    startPos: { x: 1, y: 3, dir: 'RIGHT' },
    targetPos: { x: 4, y: 3 },
    obstacles: [{ x: 2, y: 2 }, { x: 3, y: 4 }],
    stars: [{ x: 2, y: 3 }, { x: 3, y: 3 }],
    hint: 'Move forward 3 times across the path to collect stars and reach the target flag!',
    xpReward: 100,
    coinsReward: 20
  },
  {
    id: 2,
    title: 'Mission 2: Turn the Corner (Sequencing & Turns)',
    gridSize: 5,
    startPos: { x: 1, y: 4, dir: 'UP' },
    targetPos: { x: 4, y: 1 },
    obstacles: [{ x: 1, y: 1 }, { x: 2, y: 3 }, { x: 3, y: 3 }],
    stars: [{ x: 1, y: 2 }, { x: 3, y: 1 }],
    hint: 'Move up, turn right at the corner, and advance to the goal!',
    xpReward: 150,
    coinsReward: 30
  },
  {
    id: 3,
    title: 'Mission 3: Maze Navigation (Obstacle Avoidance)',
    gridSize: 5,
    startPos: { x: 0, y: 4, dir: 'UP' },
    targetPos: { x: 4, y: 0 },
    obstacles: [{ x: 1, y: 4 }, { x: 1, y: 2 }, { x: 3, y: 2 }, { x: 3, y: 0 }],
    stars: [{ x: 0, y: 2 }, { x: 2, y: 2 }, { x: 4, y: 2 }],
    hint: 'Navigate around the laser barriers and collect all 3 stars!',
    xpReward: 200,
    coinsReward: 40
  }
];

export function DragAndDropCodingGame({
  onClose,
  onGameComplete
}: {
  onClose?: () => void;
  onGameComplete?: (xp: number, coins: number) => void;
}) {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const level = LEVELS[currentLevelIdx];

  // Code sequence in workspace
  const [codeSequence, setCodeSequence] = useState<CodeBlockType[]>([]);
  
  // Character execution state
  const [botPos, setBotPos] = useState({ ...level.startPos });
  const [collectedStars, setCollectedStars] = useState<{ x: number; y: number }[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeStepIdx, setActiveStepIdx] = useState<number | null>(null);
  const [gameResult, setGameResult] = useState<'IDLE' | 'SUCCESS' | 'CRASH'>('IDLE');
  const [showHint, setShowHint] = useState(false);

  // Reset bot on level change
  useEffect(() => {
    resetBot();
    setCodeSequence([]);
    setShowHint(false);
  }, [currentLevelIdx]);

  const resetBot = () => {
    setBotPos({ ...level.startPos });
    setCollectedStars([]);
    setIsRunning(false);
    setActiveStepIdx(null);
    setGameResult('IDLE');
  };

  const addBlock = (block: CodeBlockType) => {
    if (isRunning) return;
    if (codeSequence.length >= 12) return;
    setCodeSequence(prev => [...prev, block]);
  };

  const removeBlock = (index: number) => {
    if (isRunning) return;
    setCodeSequence(prev => prev.filter((_, i) => i !== index));
  };

  const clearSequence = () => {
    if (isRunning) return;
    setCodeSequence([]);
    resetBot();
  };

  // Helper for directions
  const getNextDirection = (current: 'UP' | 'RIGHT' | 'DOWN' | 'LEFT', turn: 'LEFT' | 'RIGHT'): 'UP' | 'RIGHT' | 'DOWN' | 'LEFT' => {
    const dirs: ('UP' | 'RIGHT' | 'DOWN' | 'LEFT')[] = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
    const idx = dirs.indexOf(current);
    if (turn === 'RIGHT') {
      return dirs[(idx + 1) % 4];
    } else {
      return dirs[(idx + 3) % 4];
    }
  };

  // Expand repeats in sequence
  const expandBlocks = (blocks: CodeBlockType[]): ('MOVE_FORWARD' | 'TURN_LEFT' | 'TURN_RIGHT')[] => {
    const expanded: ('MOVE_FORWARD' | 'TURN_LEFT' | 'TURN_RIGHT')[] = [];
    for (let i = 0; i < blocks.length; i++) {
      if (blocks[i] === 'REPEAT_2X') {
        const next = blocks[i + 1];
        if (next && next !== 'REPEAT_2X') {
          expanded.push(next as any);
          expanded.push(next as any);
          i++; // Skip the next block since repeated
          continue;
        }
      } else {
        expanded.push(blocks[i] as any);
      }
    }
    return expanded;
  };

  // Run the sequence step by step
  const handleRunProgram = async () => {
    if (isRunning || codeSequence.length === 0) return;
    
    resetBot();
    setIsRunning(true);
    setGameResult('IDLE');

    const executableSteps = expandBlocks(codeSequence);
    let currentBot = { ...level.startPos };
    let starsGained: { x: number; y: number }[] = [];

    for (let i = 0; i < executableSteps.length; i++) {
      setActiveStepIdx(i);
      await new Promise(res => setTimeout(res, 600));

      const step = executableSteps[i];

      if (step === 'TURN_LEFT') {
        currentBot = { ...currentBot, dir: getNextDirection(currentBot.dir, 'LEFT') };
      } else if (step === 'TURN_RIGHT') {
        currentBot = { ...currentBot, dir: getNextDirection(currentBot.dir, 'RIGHT') };
      } else if (step === 'MOVE_FORWARD') {
        let newX = currentBot.x;
        let newY = currentBot.y;

        if (currentBot.dir === 'UP') newY -= 1;
        if (currentBot.dir === 'DOWN') newY += 1;
        if (currentBot.dir === 'LEFT') newX -= 1;
        if (currentBot.dir === 'RIGHT') newX += 1;

        // Check boundary collision
        if (newX < 0 || newX >= level.gridSize || newY < 0 || newY >= level.gridSize) {
          setGameResult('CRASH');
          setIsRunning(false);
          setActiveStepIdx(null);
          return;
        }

        // Check obstacle collision
        const hitObstacle = level.obstacles.some(obs => obs.x === newX && obs.y === newY);
        if (hitObstacle) {
          setGameResult('CRASH');
          setIsRunning(false);
          setActiveStepIdx(null);
          return;
        }

        // Check star collection
        const hitStar = level.stars.find(s => s.x === newX && s.y === newY);
        if (hitStar && !starsGained.some(sg => sg.x === hitStar.x && sg.y === hitStar.y)) {
          starsGained = [...starsGained, hitStar];
          setCollectedStars(starsGained);
        }

        currentBot = { ...currentBot, x: newX, y: newY };
      }

      setBotPos({ ...currentBot });

      // Check if reached target
      if (currentBot.x === level.targetPos.x && currentBot.y === level.targetPos.y) {
        setGameResult('SUCCESS');
        setIsRunning(false);
        setActiveStepIdx(null);
        if (onGameComplete) {
          onGameComplete(level.xpReward, level.coinsReward);
        }
        return;
      }
    }

    // Finished sequence without reaching target
    setIsRunning(false);
    setActiveStepIdx(null);
    if (currentBot.x === level.targetPos.x && currentBot.y === level.targetPos.y) {
      setGameResult('SUCCESS');
      if (onGameComplete) {
        onGameComplete(level.xpReward, level.coinsReward);
      }
    } else {
      setGameResult('CRASH');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-4 sm:p-6 max-w-4xl w-full mx-auto animate-fade-in relative overflow-hidden">
      
      {/* Game Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md">
            🎮
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Play &amp; Learn Coding
              </span>
              <span className="text-xs font-bold text-slate-400">
                Level {currentLevelIdx + 1} of {LEVELS.length}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              {level.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHint(prev => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            <span>Hint</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Hint Alert */}
      {showHint && (
        <div className="p-3 mb-4 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{level.hint}</span>
        </div>
      )}

      {/* Main Game Interface: Grid + Coding Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: 5x5 Virtual Robot Game Canvas */}
        <div className="md:col-span-6 bg-slate-900 rounded-2xl p-4 text-white shadow-inner flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-xs font-bold text-slate-400 mb-3 px-1">
            <span className="flex items-center gap-1 text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" /> Stars: {collectedStars.length} / {level.stars.length}
            </span>
            <span className="text-amber-400">
              +{level.xpReward} XP • +{level.coinsReward} Coins
            </span>
          </div>

          {/* 5x5 Grid Board */}
          <div className="relative bg-slate-950 p-2.5 rounded-2xl border-2 border-slate-800 shadow-2xl grid grid-cols-5 gap-1.5">
            {Array.from({ length: level.gridSize }).map((_, row) =>
              Array.from({ length: level.gridSize }).map((_, col) => {
                const isBot = botPos.x === col && botPos.y === row;
                const isTarget = level.targetPos.x === col && level.targetPos.y === row;
                const isObstacle = level.obstacles.some(o => o.x === col && o.y === row);
                const isStar = level.stars.some(s => s.x === col && s.y === row && !collectedStars.some(cs => cs.x === col && cs.y === row));

                return (
                  <div
                    key={`${row}-${col}`}
                    className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl border flex items-center justify-center relative transition-all duration-300 ${
                      isTarget
                        ? 'bg-emerald-950/70 border-emerald-500/80 shadow-md shadow-emerald-500/20'
                        : isObstacle
                        ? 'bg-rose-950/60 border-rose-800/80'
                        : 'bg-slate-900/90 border-slate-800/70'
                    }`}
                  >
                    {/* Obstacle Icon */}
                    {isObstacle && (
                      <span className="text-lg filter drop-shadow select-none">🪨</span>
                    )}

                    {/* Star Gem Icon */}
                    {isStar && !isBot && (
                      <span className="text-lg animate-pulse filter drop-shadow select-none">⭐</span>
                    )}

                    {/* Goal Flag */}
                    {isTarget && !isBot && (
                      <span className="text-xl animate-bounce filter drop-shadow select-none">🏁</span>
                    )}

                    {/* Bot Character */}
                    {isBot && (
                      <div className="relative z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-cyan-500/40 transform transition-transform duration-300">
                        <span className="text-lg select-none">🤖</span>
                        {/* Heading Direction Arrow */}
                        <div
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[9px] font-black shadow-sm"
                          style={{
                            transform:
                              botPos.dir === 'UP' ? 'rotate(0deg)' :
                              botPos.dir === 'RIGHT' ? 'rotate(90deg)' :
                              botPos.dir === 'DOWN' ? 'rotate(180deg)' : 'rotate(270deg)'
                          }}
                        >
                          ▲
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Grid Legend & Status message */}
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-around w-full">
            <span className="flex items-center gap-1">🤖 Robot</span>
            <span className="flex items-center gap-1">⭐ Star</span>
            <span className="flex items-center gap-1">🪨 Rock</span>
            <span className="flex items-center gap-1">🏁 Goal</span>
          </div>

          {/* Game Outcome Overlay Alert */}
          {gameResult === 'SUCCESS' && (
            <div className="mt-3 p-3 w-full rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center animate-fade-in flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Awesome Job! Target reached (+{level.xpReward} XP)!
              </span>
              {currentLevelIdx < LEVELS.length - 1 && (
                <button
                  onClick={() => setCurrentLevelIdx(prev => prev + 1)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 transition-colors"
                >
                  Next Level →
                </button>
              )}
            </div>
          )}

          {gameResult === 'CRASH' && (
            <div className="mt-3 p-3 w-full rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold text-center animate-fade-in flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Oops! Path blocked or off grid. Try again!
              </span>
              <button
                onClick={resetBot}
                className="px-2.5 py-1 rounded-lg bg-rose-500 text-white font-black text-xs hover:bg-rose-400 transition-colors"
              >
                Reset Position ↺
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Instruction Block Palette & Sequence Workspace */}
        <div className="md:col-span-6 space-y-4">
          
          {/* Palette Blocks */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
              Step 1: Click Blocks to Build Code
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addBlock('MOVE_FORWARD')}
                disabled={isRunning}
                className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-xs font-extrabold text-slate-800 flex items-center gap-2 shadow-xs transition-all active:scale-95 disabled:opacity-50"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <ArrowUp className="w-3.5 h-3.5" />
                </div>
                <span>Move Forward</span>
              </button>

              <button
                onClick={() => addBlock('TURN_LEFT')}
                disabled={isRunning}
                className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/50 text-xs font-extrabold text-slate-800 flex items-center gap-2 shadow-xs transition-all active:scale-95 disabled:opacity-50"
              >
                <div className="w-6 h-6 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center">
                  <RotateCcw className="w-3.5 h-3.5" />
                </div>
                <span>Turn Left</span>
              </button>

              <button
                onClick={() => addBlock('TURN_RIGHT')}
                disabled={isRunning}
                className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 text-xs font-extrabold text-slate-800 flex items-center gap-2 shadow-xs transition-all active:scale-95 disabled:opacity-50"
              >
                <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <RotateCw className="w-3.5 h-3.5" />
                </div>
                <span>Turn Right</span>
              </button>

              <button
                onClick={() => addBlock('REPEAT_2X')}
                disabled={isRunning}
                className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 text-xs font-extrabold text-slate-800 flex items-center gap-2 shadow-xs transition-all active:scale-95 disabled:opacity-50"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Repeat className="w-3.5 h-3.5" />
                </div>
                <span>Repeat 2x Next</span>
              </button>
            </div>
          </div>

          {/* Program Execution Sequence */}
          <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Step 2: Program Sequence ({codeSequence.length}/12 blocks)
              </span>
              {codeSequence.length > 0 && !isRunning && (
                <button
                  onClick={clearSequence}
                  className="text-[10px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            {/* Blocks Queue */}
            <div className="min-h-[110px] p-2.5 bg-white rounded-xl border border-dashed border-slate-300 flex flex-wrap gap-1.5 items-start">
              {codeSequence.length === 0 ? (
                <div className="w-full h-24 flex flex-col items-center justify-center text-slate-400 text-xs font-medium">
                  <span>Click instructions above to build your program</span>
                  <span className="text-[10px] text-slate-400">Example: Move Forward → Turn Right → Move Forward</span>
                </div>
              ) : (
                codeSequence.map((block, idx) => {
                  const isActive = activeStepIdx === idx;
                  return (
                    <div
                      key={idx}
                      className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-black shadow-xs transition-all ${
                        isActive
                          ? 'bg-amber-400 text-slate-950 scale-105 shadow-md'
                          : block === 'MOVE_FORWARD'
                          ? 'bg-indigo-50 border border-indigo-200 text-indigo-700'
                          : block === 'TURN_LEFT'
                          ? 'bg-cyan-50 border border-cyan-200 text-cyan-700'
                          : block === 'TURN_RIGHT'
                          ? 'bg-purple-50 border border-purple-200 text-purple-700'
                          : 'bg-amber-50 border border-amber-200 text-amber-700'
                      }`}
                    >
                      <span>{idx + 1}.</span>
                      <span>
                        {block === 'MOVE_FORWARD' ? 'Move Forward' :
                         block === 'TURN_LEFT' ? 'Turn Left' :
                         block === 'TURN_RIGHT' ? 'Turn Right' : 'Repeat 2x'}
                      </span>
                      {!isRunning && (
                        <button
                          onClick={() => removeBlock(idx)}
                          className="opacity-0 group-hover:opacity-100 hover:text-rose-600 ml-1 text-slate-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Controls: Run & Reset */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleRunProgram}
              disabled={isRunning || codeSequence.length === 0}
              className="flex-1 h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isRunning ? 'Executing Program...' : 'Run Program ▶'}</span>
            </button>

            <button
              onClick={resetBot}
              disabled={isRunning}
              className="h-11 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
              title="Reset Position"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>Reset</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
