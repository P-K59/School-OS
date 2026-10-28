"use client";

import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  MessageSquare,
  HelpCircle,
  Lightbulb,
  ThumbsUp,
  RotateCcw
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ROBOT' | 'STUDENT';
  text: string;
  hintLevel?: number;
}

const PRESET_QUESTIONS = [
  'How do computer loops work?',
  'What is an ultrasonic sensor on a robot?',
  'Give me a hint for Level 2 of the coding game!',
  'How does AI recognize cats in pictures?',
  'What is the difference between hardware and software?'
];

const PRESET_ANSWERS: Record<string, string> = {
  'How do computer loops work?': 'Think of a loop like brushing your teeth! 🪥 Instead of your brain thinking "brush tooth 1, brush tooth 2, brush tooth 3...", you do a loop: "repeat brushing until teeth are sparkling clean!". In code, a loop tells the computer to repeat instructions without writing them 100 times!',
  'What is an ultrasonic sensor on a robot?': 'Great question! 🦇 An ultrasonic sensor works just like a bat in the dark! It sends out high-pitched sound waves. When the sound bounces off a wall and echoes back, the robot calculates how many milliseconds it took, telling it: "Stop! A wall is 15 cm ahead!"',
  'Give me a hint for Level 2 of the coding game!': '🤖 Hint: In Level 2, moving straight ahead will bump into the wall! Try moving forward, then use "Turn Right" at the corner, and then move forward into the star path!',
  'How does AI recognize cats in pictures?': '🧠 Imagine showing a toddler 1,000 photos of cats and pointing out whiskers, pointy ears, and tails! AI does the same thing with neural networks: it looks at millions of pixels, finds recurring patterns, and learns: "Aha! That shape with triangular ears is a cat!"',
  'What is the difference between hardware and software?': '💻 Easy way to remember: Hardware is anything you can physically touch (the screen, keyboard, robotic wheels, microchips). Software is the code and ideas running inside (the game, the web browser, the instructions telling the robot to turn left)!'
};

export function AiMentorDialog({
  onClose
}: {
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ROBOT',
      text: "Beep-boop! 👋 Hi Aarav! I'm your InnovatMind AI Mentor! Stuck on a coding puzzle or curious about robots? Ask me anything!"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendPrompt = (promptText: string) => {
    if (!promptText.trim()) return;

    const studentMsg: ChatMessage = {
      id: `stu-${Date.now()}`,
      sender: 'STUDENT',
      text: promptText
    };

    setMessages(prev => [...prev, studentMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = PRESET_ANSWERS[promptText] || 
        `That is a wonderful question! 🌟 In STEM and coding, the most important rule is to break big problems into small, simple steps. Try experimenting with the blocks in your coding lab, and remember: mistakes are just stepping stones to discovering how things work!`;

      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'ROBOT',
          text: reply
        }
      ]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 max-w-lg w-full flex flex-col h-[560px] animate-scale-up relative">
        
        {/* Header with Mascot */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-indigo-600 p-0.5 shadow-md">
              <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center text-xl overflow-hidden">
                <img
                  src="/images/robot-mentor.png"
                  alt="AI Mentor"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-slate-900">AI Learning Companion</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[11px] text-indigo-700 font-bold">Kid-safe • Always helpful • Zero pressure</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History Box */}
        <div className="flex-1 overflow-y-auto p-2 space-y-3 scrollbar-none my-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${msg.sender === 'STUDENT' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ROBOT' && (
                <div className="w-7 h-7 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-xs shrink-0 mt-0.5">
                  🤖
                </div>
              )}
              <div
                className={`max-w-[82%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'STUDENT'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-br-xs shadow-xs'
                    : 'bg-slate-100/90 text-slate-800 font-medium rounded-bl-xs border border-slate-200/60'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-slate-400 text-xs italic pl-9">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce delay-100" />
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce delay-200" />
              <span>AI Mentor is thinking...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="pt-2 border-t border-slate-100">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
            Quick Questions
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {PRESET_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendPrompt(q)}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 whitespace-nowrap transition-colors shrink-0"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt(inputText);
          }}
          className="flex items-center gap-2 pt-2"
        >
          <input
            type="text"
            placeholder="Ask a question about coding, loops, or robots..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 h-10 px-3.5 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="h-10 px-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-40 shadow-xs transition-all active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
}
