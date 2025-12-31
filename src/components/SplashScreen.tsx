import { useState, useEffect } from "react";
import abokiLogo from "@/assets/aboki-logo.jpg";

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

const SplashScreen = ({ onComplete, duration = 2000 }: SplashScreenProps) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, duration - 500);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <img
          src={abokiLogo}
          alt="Aboki BDC"
          className="w-32 h-32 rounded-full object-cover shadow-2xl"
        />
        <div className="text-center">
          <h1 className="text-white text-xl font-bold tracking-wide">
            Aboki BDC
          </h1>
          <p className="text-white/60 text-xs mt-1">
            Bureau De Change
          </p>
        </div>
      </div>
      
      {/* Loading indicator */}
      <div className="absolute bottom-20">
        <div className="w-8 h-8 border-2 border-white/20 border-t-primary rounded-full animate-spin" />
      </div>
    </div>
  );
};

export default SplashScreen;
