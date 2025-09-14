'use client';

import { useEffect, useState } from 'react';
import { User, Mic, Brain } from 'lucide-react';

interface AIAvatarProps {
  isActive: boolean;
}

export default function AIAvatar({ isActive }: AIAvatarProps) {
  const [pulseIntensity, setPulseIntensity] = useState(0);
  const [breathingPhase, setBreathingPhase] = useState(0);

  useEffect(() => {
    const breathingInterval = setInterval(() => {
      setBreathingPhase(prev => (prev + 1) % 60);
    }, 100);

    return () => clearInterval(breathingInterval);
  }, []);

  useEffect(() => {
    if (!isActive) {
      setPulseIntensity(0);
      return;
    }

    const pulseInterval = setInterval(() => {
      setPulseIntensity(prev => (prev + 1) % 8);
    }, 150);

    return () => clearInterval(pulseInterval);
  }, [isActive]);

  const breathingScale = 1 + Math.sin(breathingPhase * 0.1) * 0.02;
  const eyeBlinkPhase = Math.floor(breathingPhase / 20) % 3;

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Ambient Background */}
      <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-teal-500/5 transition-all duration-500 ${
        isActive ? 'opacity-100 scale-105' : 'opacity-60 scale-100'
      }`}>
        <div className={`absolute inset-0 bg-gradient-to-br from-transparent via-white/2 to-transparent transform transition-all duration-2000 ${
          isActive ? 'scale-110 rotate-2' : 'scale-100 rotate-0'
        }`} />
      </div>

      {/* Professional AI Avatar */}
      <div 
        className={`relative z-10 transition-all duration-500`}
        style={{ transform: `scale(${breathingScale})` }}
      >
        {/* Main Avatar Circle */}
        <div className={`relative w-28 h-28 rounded-full bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 flex items-center justify-center transition-all duration-300 border-2 ${
          isActive 
            ? 'border-blue-400/60 shadow-xl shadow-blue-400/20' 
            : 'border-slate-500/40 shadow-lg shadow-slate-500/10'
        }`}>
          
          {/* Inner Glow */}
          <div className={`absolute inset-2 rounded-full bg-gradient-to-br transition-all duration-300 ${
            isActive 
              ? 'from-blue-400/20 via-purple-400/10 to-teal-400/20' 
              : 'from-slate-400/10 via-slate-300/5 to-slate-400/10'
          }`} />
          
          {/* Face Features */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Eyes */}
            <div className="flex space-x-3 mb-2">
              <div className={`w-2 h-2 rounded-full transition-all duration-200 ${
                eyeBlinkPhase === 0 ? 'bg-blue-300 shadow-sm shadow-blue-300/50' : 'bg-slate-400 h-0.5'
              }`} />
              <div className={`w-2 h-2 rounded-full transition-all duration-200 ${
                eyeBlinkPhase === 0 ? 'bg-blue-300 shadow-sm shadow-blue-300/50' : 'bg-slate-400 h-0.5'
              }`} />
            </div>
            
            {/* Neural Network Icon */}
            <Brain size={20} className={`transition-colors duration-300 ${
              isActive ? 'text-blue-300' : 'text-slate-400'
            }`} />
          </div>
        </div>
        
        {/* Speaking Indicator */}
        {isActive && (
          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full flex items-center justify-center shadow-lg shadow-blue-400/30">
            <Mic size={14} className="text-white" />
          </div>
        )}
        
        {/* Thinking Particles */}
        {isActive && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-1 h-1 bg-blue-300/60 rounded-full animate-ping`}
                style={{
                  top: `${20 + Math.sin(pulseIntensity + i) * 30}%`,
                  left: `${20 + Math.cos(pulseIntensity + i) * 30}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1.5s'
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sophisticated Sound Waves */}
      {isActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`absolute border border-blue-400/20 rounded-full animate-ping`}
              style={{
                width: `${120 + i * 20}px`,
                height: `${120 + i * 20}px`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: '2.5s'
              }}
            />
          ))}
        </div>
      )}

      {/* Professional Status Text */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-center">
        <div className={`text-xs font-medium transition-all duration-300 px-3 py-1 rounded-full backdrop-blur-sm ${
          isActive 
            ? 'text-blue-300 bg-blue-500/10 border border-blue-400/20' 
            : 'text-slate-400 bg-slate-500/10 border border-slate-400/20'
        }`}>
          {isActive ? 'AI Speaking' : 'AI Ready'}
        </div>
      </div>
    </div>
  );
}