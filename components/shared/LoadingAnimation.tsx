
import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "Sedang meracik ide-ide brilian...",
  "Menghubungi satelit inovasi...",
  "AI sedang berpikir keras untuk Anda...",
  "Mengumpulkan data pasar terkini...",
  "Sedikit lagi, ide cemerlang segera tiba!",
  "Menganalisis tren masa depan...",
  "Memoles strategi kemenangan Anda..."
];

interface LoadingAnimationProps {
  message?: string;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ message }) => {
  const [currentMessage, setCurrentMessage] = useState(message || loadingMessages[0]);

  useEffect(() => {
    if (!message) {
      const interval = setInterval(() => {
        setCurrentMessage(prevMessage => {
          const currentIndex = loadingMessages.indexOf(prevMessage);
          const nextIndex = (currentIndex + 1) % loadingMessages.length;
          return loadingMessages[nextIndex];
        });
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [message]);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-800/50 rounded-lg text-center">
      <div className="relative flex justify-center items-center">
        <div className="absolute w-16 h-16 rounded-full animate-ping bg-cyan-400 opacity-50"></div>
        <div className="absolute w-12 h-12 rounded-full animate-ping bg-cyan-500 opacity-70 delay-150"></div>
        <svg className="w-12 h-12 text-cyan-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      <p className="mt-6 text-lg font-semibold text-slate-300 transition-all duration-300">{currentMessage}</p>
    </div>
  );
};

export default LoadingAnimation;
