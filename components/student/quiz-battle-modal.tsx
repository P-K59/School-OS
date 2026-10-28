"use client";

import React, { useState } from 'react';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  X,
  Award
} from 'lucide-react';

interface Question {
  id: number;
  question: string;
  category: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    category: 'Programming Logic',
    question: 'What is a "Loop" used for in programming?',
    options: [
      'To repeat a block of code multiple times',
      'To delete all errors permanently',
      'To turn the computer screen off',
      'To send an email to the teacher'
    ],
    correctAnswer: 0,
    explanation: 'A loop (like "for" or "while") allows a program to repeat instructions automatically without typing them again and again!'
  },
  {
    id: 2,
    category: 'Robotics & Hardware',
    question: 'Which sensor helps an autonomous rover avoid bumping into walls?',
    options: [
      'Microphone sound sensor',
      'Ultrasonic distance sensor',
      'Temperature thermometer',
      'Color bar sensor'
    ],
    correctAnswer: 1,
    explanation: 'Ultrasonic sensors emit high-frequency sound waves (like a bat) to calculate distance and detect nearby obstacles!'
  },
  {
    id: 3,
    category: 'Computer Fundamentals',
    question: 'Which hardware part is known as the "Brain" of the computer?',
    options: [
      'Hard Disk Drive (HDD)',
      'Central Processing Unit (CPU)',
      'Power Supply Unit (PSU)',
      'Computer Mouse'
    ],
    correctAnswer: 1,
    explanation: 'The CPU (Central Processing Unit) processes every instruction and calculation, acting as the brain of your device!'
  },
  {
    id: 4,
    category: 'Artificial Intelligence',
    question: 'How do computers learn to recognize a cat in an image?',
    options: [
      'A human paints the cat on the screen',
      'By analyzing thousands of example pictures to find patterns',
      'The computer looks outside the window',
      'By turning the camera upside down'
    ],
    correctAnswer: 1,
    explanation: 'Machine Learning models analyze vast datasets of labeled images to learn patterns like whiskers, ears, and shapes!'
  },
  {
    id: 5,
    category: 'Debugging Skills',
    question: 'What is a "Bug" in computer science?',
    options: [
      'A real insect inside the keyboard',
      'An unexpected error or flaw that makes code behave incorrectly',
      'A very fast internet connection',
      'A type of computer mouse'
    ],
    correctAnswer: 1,
    explanation: 'A bug is an error or unexpected mistake in code. "Debugging" is the process of finding and fixing those errors!'
  }
];

export function QuizBattleModal({
  onClose,
  onComplete
}: {
  onClose: () => void;
  onComplete: (xp: number, coins: number) => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const q = QUIZ_QUESTIONS[currentIdx];

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(index);
    setIsAnswerSubmitted(true);

    if (index === q.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizFinished(true);
      onComplete(50, 10);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 max-w-lg w-full animate-scale-up relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black shadow-xs">
              🏆
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Logic Challenge: Quiz Battle</h3>
              <p className="text-[11px] text-slate-500 font-medium">Test your computer and programming logic powers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Finished Screen */}
        {quizFinished ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-white flex items-center justify-center text-3xl mx-auto shadow-lg shadow-amber-500/30 animate-bounce">
              🌟
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900">Quiz Completed!</h4>
              <p className="text-xs text-slate-500 mt-1">
                You scored <span className="font-extrabold text-amber-600">{score} out of {QUIZ_QUESTIONS.length}</span>!
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 inline-flex items-center gap-4 text-xs font-black text-amber-800">
              <span>+50 XP Earned</span>
              <span>•</span>
              <span>+10 Coins</span>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={handleRestart}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retry
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-md shadow-indigo-500/20"
              >
                Claim Rewards &amp; Exit
              </button>
            </div>
          </div>
        ) : (
          /* Active Question Screen */
          <div className="space-y-4">
            {/* Progress & Category */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase">
                {q.category}
              </span>
              <span>Question {currentIdx + 1} of {QUIZ_QUESTIONS.length}</span>
            </div>

            {/* Question Text */}
            <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
              {q.question}
            </h4>

            {/* Answer Options */}
            <div className="space-y-2">
              {q.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === q.correctAnswer;
                
                let btnStyle = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-indigo-50/50 hover:border-indigo-300';
                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-50 border-rose-300 text-rose-800';
                  } else {
                    btnStyle = 'bg-slate-50/50 border-slate-200 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswerSubmitted}
                    className={`w-full p-3 text-left rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {isAnswerSubmitted && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                    )}
                    {isAnswerSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation box after submit */}
            {isAnswerSubmitted && (
              <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900 animate-fade-in space-y-1">
                <span className="font-extrabold text-indigo-700 block">💡 Learning Concept:</span>
                <p>{q.explanation}</p>
              </div>
            )}

            {/* Footer with Next button */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <span className="text-xs font-bold text-slate-400">Score: {score}</span>
              <button
                onClick={handleNextQuestion}
                disabled={!isAnswerSubmitted}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-40 transition-all flex items-center gap-1.5"
              >
                <span>{currentIdx < QUIZ_QUESTIONS.length - 1 ? 'Next Question' : 'Finish Quiz'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
