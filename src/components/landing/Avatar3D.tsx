import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Bot, Heart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Avatar3DProps {
  onOpenChat?: () => void;
}

export const Avatar3D: React.FC<Avatar3DProps> = ({ onOpenChat }) => {
  const [greetingIndex, setGreetingIndex] = useState<number>(0);
  const [showBubble, setShowBubble] = useState<boolean>(true);
  const [isWaving, setIsWaving] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const greetings = [
    "👋 Hey there! I'm Aura, your AI Insurance Assistant!",
    "🚀 Looking to scale your insurance agency automatically?",
    "💬 Click me or ask our AI chatbot anything anytime!",
    "✨ Calculate your monthly ROI using the simulator below!"
  ];

  // Rotate greeting speech bubble every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setGreetingIndex((prev) => (prev + 1) % greetings.length);
      setIsWaving(true);
      setTimeout(() => setIsWaving(false), 1200);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 10;
    const y = (e.clientY - rect.top - rect.height / 2) / 10;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div className="relative flex flex-col items-center justify-center select-none">

      {/* Interactive Speech Bubble */}
      <AnimatePresence mode="wait">
        {showBubble && (
          <motion.div
            key={greetingIndex}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mb-4 relative max-w-xs text-center z-20"
          >
            <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 p-0.5 rounded-2xl shadow-xl">
              <div className="bg-card/95 backdrop-blur-md px-4 py-3 rounded-[14px] text-xs font-semibold text-foreground flex items-center justify-between gap-2">
                <span>{greetings[greetingIndex]}</span>
                <button
                  onClick={() => setShowBubble(false)}
                  className="text-muted-foreground hover:text-foreground shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {/* Bubble Arrow */}
            <div className="w-3 h-3 bg-card rotate-45 border-r border-b border-indigo-500/30 absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Interactive Character Sphere Mesh */}
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => {
          setIsWaving(true);
          setTimeout(() => setIsWaving(false), 1000);
          if (onOpenChat) onOpenChat();
        }}
        className="relative cursor-pointer group p-4"
        style={{ perspective: "1000px" }}
      >
        {/* Ambient Outer Aura Glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-60 blur-2xl group-hover:opacity-90 transition-opacity animate-pulse pointer-events-none" />

        {/* 3D Tilting Sphere Mesh Wrapper */}
        <motion.div
          animate={{
            rotateY: mousePos.x,
            rotateX: -mousePos.y,
            y: isWaving ? [0, -12, 0] : [0, -6, 0]
          }}
          transition={{
            rotateY: { type: "spring", stiffness: 150, damping: 15 },
            rotateX: { type: "spring", stiffness: 150, damping: 15 },
            y: { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
          }}
          className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full p-1 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-pink-500 shadow-2xl flex items-center justify-center"
        >
          {/* Inner Glossy Sphere Surface */}
          <div className="w-full h-full rounded-full bg-gradient-to-b from-card/90 via-card to-indigo-950/90 backdrop-blur-xl border border-white/20 flex flex-col items-center justify-center relative overflow-hidden">

            {/* Dynamic Grid Background Texture */}
            <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:12px_12px] opacity-30 pointer-events-none" />

            {/* AI Face Expression */}
            <div className="relative z-10 flex flex-col items-center gap-2">

              {/* Glowing Eyes */}
              <div className="flex gap-5 items-center">
                <motion.div
                  animate={{ scaleY: isWaving ? [1, 0.1, 1] : 1 }}
                  transition={{ duration: 0.2 }}
                  className="w-3.5 h-4 sm:w-4 sm:h-5 rounded-full bg-cyan-400 shadow-[0_0_12px_#38bdf8]"
                />
                <motion.div
                  animate={{ scaleY: isWaving ? [1, 0.1, 1] : 1 }}
                  transition={{ duration: 0.2 }}
                  className="w-3.5 h-4 sm:w-4 sm:h-5 rounded-full bg-cyan-400 shadow-[0_0_12px_#38bdf8]"
                />
              </div>

              {/* Smiling Curved Mouth */}
              <div className="w-6 h-2.5 rounded-b-full border-b-2 border-cyan-300 shadow-[0_2px_8px_#38bdf8]" />

              {/* AI Badge */}
              <div className="mt-1 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center gap-1 text-[10px] font-bold text-cyan-300">
                <Zap className="w-3 h-3 text-cyan-400" />
                <span>AURA AI</span>
              </div>
            </div>

            {/* Orbiting Sparkles */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="absolute inset-0 p-2 pointer-events-none"
            >
              <Sparkles className="w-4 h-4 text-pink-400 absolute top-2 right-4 animate-bounce" />
              <Heart className="w-3.5 h-3.5 text-cyan-400 absolute bottom-3 left-4" />
            </motion.div>

          </div>
        </motion.div>

        {/* Interactive Click Indicator */}
        <div className="mt-3 text-center">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full px-4 text-xs font-semibold bg-card/80 border-primary/30 hover:bg-primary/20 shadow-sm gap-1.5"
          >
            <Bot className="w-3.5 h-3.5 text-primary" />
            <span>Chat with Aura</span>
          </Button>
        </div>

      </div>
    </div>
  );
};

export default Avatar3D;
