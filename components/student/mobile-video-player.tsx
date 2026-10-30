"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Video
} from 'lucide-react';
import { VideoProviderFactory } from '@/lib/video/video-provider';
import { VideoProviderType } from '@/lib/types';

interface MobileVideoPlayerProps {
  videoRef: string;
  provider?: VideoProviderType;
  title: string;
  durationMinutes?: number;
  initialWatchedSeconds?: number;
  completionThresholdPercent?: number; // e.g. 80
  onProgressUpdate?: (watchedSeconds: number, totalDuration: number) => void;
  onVideoCompleted?: () => void;
}

export function MobileVideoPlayer({
  videoRef,
  provider = 'GOOGLE_DRIVE',
  title,
  durationMinutes = 25,
  initialWatchedSeconds = 0,
  completionThresholdPercent = 80,
  onProgressUpdate,
  onVideoCompleted
}: MobileVideoPlayerProps) {
  const totalSeconds = durationMinutes * 60;
  const [watchedSeconds, setWatchedSeconds] = useState(initialWatchedSeconds);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isCompleted, setIsCompleted] = useState(
    Math.round((initialWatchedSeconds / totalSeconds) * 100) >= completionThresholdPercent
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const watchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resolved = VideoProviderFactory.resolve(provider, videoRef, title);

  // Watch position timer simulation when playing
  useEffect(() => {
    if (isPlaying && !hasError) {
      watchTimerRef.current = setInterval(() => {
        setWatchedSeconds(prev => {
          const next = Math.min(totalSeconds, prev + 1);
          const percent = Math.round((next / totalSeconds) * 100);
          
          if (next % 5 === 0 && onProgressUpdate) {
            onProgressUpdate(next, totalSeconds);
          }

          if (percent >= completionThresholdPercent && !isCompleted) {
            setIsCompleted(true);
            if (onVideoCompleted) onVideoCompleted();
          }

          return next;
        });
      }, 1000);
    } else {
      if (watchTimerRef.current) clearInterval(watchTimerRef.current);
    }

    return () => {
      if (watchTimerRef.current) clearInterval(watchTimerRef.current);
    };
  }, [isPlaying, hasError, totalSeconds, completionThresholdPercent, isCompleted, onProgressUpdate, onVideoCompleted]);

  const progressPercent = Math.min(100, Math.round((watchedSeconds / totalSeconds) * 100));

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleFastForwardSimulation = () => {
    // Jump forward to threshold for fast testing or verified completion
    const target = Math.round(totalSeconds * (completionThresholdPercent / 100));
    setWatchedSeconds(target);
    setIsCompleted(true);
    if (onProgressUpdate) onProgressUpdate(target, totalSeconds);
    if (onVideoCompleted) onVideoCompleted();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl flex flex-col"
    >
      {/* 16:9 Video Canvas Frame */}
      <div className="relative w-full pb-[56.25%] bg-black overflow-hidden">
        
        {/* Google Drive / CDN Iframe Player */}
        {resolved.embedUrl ? (
          <iframe
            src={resolved.embedUrl}
            title={title}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <Video className="w-10 h-10 text-slate-600 mb-2" />
            <span className="text-xs font-bold text-slate-300">Video Asset Not Available</span>
            <span className="text-[11px] text-slate-500 mt-1">Please contact your teacher or administrator.</span>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white z-10 pointer-events-none">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
            <span className="text-xs font-bold">Connecting to Video Stream...</span>
          </div>
        )}

        {/* Error Fallback Overlay */}
        {hasError && (
          <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center text-white z-20">
            <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
            <span className="text-xs font-bold text-slate-200">Video Playback Interrupted</span>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
              Check your internet connection or verify that Google Drive video permissions allow embedding.
            </p>
            <button
              onClick={() => {
                setHasError(false);
                setIsLoading(true);
              }}
              className="mt-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Retry Video Stream
            </button>
          </div>
        )}

        {/* Fullscreen Button in Corner */}
        <button
          onClick={handleToggleFullscreen}
          className="absolute top-3 right-3 p-2 bg-slate-900/60 hover:bg-slate-900/80 text-white rounded-lg backdrop-blur-xs transition-colors z-20 cursor-pointer"
          title="Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Video Progress Bar */}
      <div className="w-full bg-slate-800 h-1.5 relative overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
        {/* Threshold Marker Indicator */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
          style={{ left: `${completionThresholdPercent}%` }}
          title={`Quiz unlock threshold: ${completionThresholdPercent}%`}
        />
      </div>

      {/* Mobile Touch Control Bar */}
      <div className="px-4 py-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Play/Pause & Watch Progress Status */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all cursor-pointer ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          </button>

          <div>
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <span>{Math.floor(watchedSeconds / 60)}:{String(watchedSeconds % 60).padStart(2, '0')}</span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400">{durationMinutes}:00</span>
            </div>
            <div className="text-[10px] text-slate-400">
              {progressPercent}% watched • {completionThresholdPercent}% needed for quiz
            </div>
          </div>
        </div>

        {/* Completion Badge or Fast Complete */}
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Video Completed</span>
            </div>
          ) : (
            <button
              onClick={handleFastForwardSimulation}
              className="text-[11px] font-bold text-indigo-300 hover:text-white bg-indigo-950/60 border border-indigo-700/50 hover:bg-indigo-900 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Complete Video ({completionThresholdPercent}%)</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
