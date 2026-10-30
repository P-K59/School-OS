"use client";

import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Award,
  AlertCircle
} from 'lucide-react';
import { LectureQuiz, QuizQuestion } from '@/lib/types';

interface InteractiveLectureQuizProps {
  quiz: LectureQuiz;
  lectureNumber: number;
  onQuizCompleted: (scorePercentage: number) => void;
}

export function InteractiveLectureQuiz({
  quiz,
  lectureNumber,
  onQuizCompleted
}: InteractiveLectureQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, any>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const questions = quiz.questions || [];
  const currentQ = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  const handleSelectAnswer = (questionId: string, answer: any) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNextOrSubmit = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Calculate score
      let correct = 0;
      questions.forEach(q => {
        const studentAns = selectedAnswers[q.id];
        if (studentAns !== undefined && studentAns !== null) {
          if (typeof q.correctAnswer === 'string' && typeof studentAns === 'string') {
            if (studentAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
              correct++;
            }
          } else if (studentAns === q.correctAnswer) {
            correct++;
          }
        }
      });

      const percentage = Math.round((correct / totalQuestions) * 100);
      setFinalScore(percentage);
      setIsSubmitted(true);

      if (percentage >= (quiz.passingPercentage || 70)) {
        onQuizCompleted(percentage);
      }
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setFinalScore(null);
    setCurrentQuestionIndex(0);
  };

  if (!currentQ && !isSubmitted) {
    return (
      <div className="p-6 text-center text-slate-500">
        No quiz questions available for this lecture.
      </div>
    );
  }

  // Result Summary View
  if (isSubmitted && finalScore !== null) {
    const passed = finalScore >= (quiz.passingPercentage || 70);
    return (
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-4 animate-fade-in">
        <div className={`w-16 h-16 mx-auto rounded-3xl flex items-center justify-center ${
          passed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
        }`}>
          {passed ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
        </div>

        <div>
          <h3 className="text-xl font-black text-slate-900">
            {passed ? 'Checkpoint Quiz Passed!' : 'Review & Try Again!'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {passed
              ? `Outstanding performance! You scored ${finalScore}% and unlocked the educational challenge.`
              : `You scored ${finalScore}%. The passing threshold is ${quiz.passingPercentage || 70}%.`}
          </p>
        </div>

        <div className="inline-block px-4 py-2 bg-slate-50 rounded-2xl border border-slate-200">
          <span className="text-3xl font-black text-slate-900">{finalScore}%</span>
          <span className="text-xs text-slate-400 block font-bold">Accuracy Score</span>
        </div>

        <div className="pt-2 flex justify-center gap-3">
          {!passed ? (
            <button
              onClick={handleRetry}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Quiz</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Educational Game Challenge Unlocked Below!</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200 shadow-xl space-y-5">
      
      {/* Quiz Header & Step Counter */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 leading-tight">Checkpoint Quiz</h4>
            <span className="text-[10px] text-slate-400 font-medium">Lecture #{lectureNumber}</span>
          </div>
        </div>

        <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </div>
      </div>

      {/* Question Prompt */}
      <div className="space-y-2">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
          {currentQ.prompt}
        </h3>

        {/* Code Snippet if present */}
        {currentQ.codeSnippet && (
          <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto">
            {currentQ.codeSnippet}
          </pre>
        )}
      </div>

      {/* Answer Options (Touch-Friendly Buttons) */}
      <div className="space-y-2.5">
        {(currentQ.options || ['True', 'False']).map((opt, idx) => {
          const isSelected = selectedAnswers[currentQ.id] === opt;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectAnswer(currentQ.id, opt)}
              className={`w-full min-h-[48px] p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 text-slate-700'
              }`}
            >
              <span>{opt}</span>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
              }`}>
                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer / Navigation */}
      <div className="pt-2 flex items-center justify-between">
        <div className="text-[11px] text-slate-400 font-medium">
          Passing mark: {quiz.passingPercentage || 70}%
        </div>

        <button
          type="button"
          disabled={!selectedAnswers[currentQ.id]}
          onClick={handleNextOrSubmit}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40"
        >
          <span>{currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Submit Quiz'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
