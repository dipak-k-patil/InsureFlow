import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Bot, Shield, Zap, Cpu } from "lucide-react";

interface ThreeDCharacterProps {
  size?: "sm" | "md" | "lg";
  variant?: "ai-agent" | "assistant" | "shield";
  showBadges?: boolean;
  className?: string;
}

export const ThreeDCharacter: React.FC<ThreeDCharacterProps> = ({
  size = "md",
  variant = "ai-agent",
  showBadges = true,
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-48 h-48",
    md: "w-72 h-72",
    lg: "w-96 h-96",
  }[size];

  return (
    <div className={`relative flex items-center justify-center perspective-1000 ${sizeClasses} ${className}`}>
      {/* Background 3D Glowing Aura */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/30 via-primary/40 to-purple-600/30 blur-2xl pointer-events-none"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* 3D Rotating Outer Ring 1 */}
      <motion.div
        className="absolute w-full h-full rounded-full border-2 border-dashed border-cyan-400/40 pointer-events-none"
        style={{ transformStyle: "preserve-3d" }}
        animate={{
          rotateX: [60, 45, 60],
          rotateY: [0, 180, 360],
          rotateZ: [0, 90, 180],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* 3D Rotating Orbit Ring 2 */}
      <motion.div
        className="absolute w-4/5 h-4/5 rounded-full border border-purple-500/50 pointer-events-none"
        style={{ transformStyle: "preserve-3d" }}
        animate={{
          rotateX: [30, -30, 30],
          rotateY: [360, 180, 0],
          rotateZ: [90, 0, -90],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Floating Main 3D Character Body */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center"
        animate={{
          y: [-12, 12, -12],
          rotateX: [-5, 5, -5],
          rotateY: [-8, 8, -8],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* 3D Robot / AI Character Head & Body Graphics */}
        <div className="relative w-40 h-40 md:w-52 md:h-52 flex items-center justify-center">

          {/* Main Sphere Body with 3D Radial Gradient */}
          <div className="absolute inset-2 rounded-3xl bg-gradient-to-br from-cyan-400 via-sky-600 to-indigo-900 shadow-[0_20px_50px_rgba(14,165,233,0.5)] border border-cyan-300/40 flex flex-col items-center justify-center overflow-hidden backdrop-blur-xl">
            {/* Glossy Top Reflection */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-3xl pointer-events-none" />

            {/* Digital Grid pattern */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />

            {/* Glowing Digital Eyes Visor */}
            <div className="relative z-10 w-28 h-12 bg-slate-950/90 rounded-2xl border border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.6)] flex items-center justify-around px-4">
              {/* Left Eye */}
              <motion.div
                className="w-5 h-5 rounded-full bg-cyan-300 shadow-[0_0_10px_#22d3ee]"
                animate={{ scaleY: [1, 0.1, 1, 1, 1] }}
                transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.05, 0.1, 0.8, 1] }}
              />
              {/* Right Eye */}
              <motion.div
                className="w-5 h-5 rounded-full bg-cyan-300 shadow-[0_0_10px_#22d3ee]"
                animate={{ scaleY: [1, 0.1, 1, 1, 1] }}
                transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.05, 0.1, 0.8, 1] }}
              />
            </div>

            {/* AI Core Emblem */}
            <div className="relative z-10 mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-400/40 text-[10px] font-bold text-cyan-200 uppercase tracking-widest shadow-inner">
              <Sparkles className="w-3 h-3 text-cyan-300 animate-spin" style={{ animationDuration: "6s" }} />
              <span>Kadmak AI</span>
            </div>
          </div>

          {/* Floating 3D Antenna Floating Gem */}
          <motion.div
            className="absolute -top-4 w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-500 to-pink-400 shadow-[0_0_15px_rgba(168,85,247,0.8)] border border-purple-200/50 flex items-center justify-center text-white"
            animate={{
              y: [-4, 4, -4],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Zap className="w-4 h-4 fill-white" />
          </motion.div>

          {/* Side Floating Headphones / Thrusters */}
          <motion.div
            className="absolute -left-3 w-6 h-12 rounded-l-xl bg-gradient-to-b from-purple-600 to-indigo-800 border border-purple-400/40 shadow-lg"
            animate={{ x: [-2, 2, -2] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -right-3 w-6 h-12 rounded-r-xl bg-gradient-to-b from-purple-600 to-indigo-800 border border-purple-400/40 shadow-lg"
            animate={{ x: [2, -2, 2] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>

      {/* Floating 3D Feature Badges */}
      {showBadges && (
        <>
          {/* Badge 1: Top Right - AI Smart Agent */}
          <motion.div
            className="absolute -top-2 right-0 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/40 shadow-lg text-xs font-semibold text-cyan-300"
            animate={{
              y: [-6, 6, -6],
              x: [3, -3, 3],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>AI Assistant Active</span>
          </motion.div>

          {/* Badge 2: Bottom Left - Instant Automation */}
          <motion.div
            className="absolute -bottom-2 left-0 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-purple-500/40 shadow-lg text-xs font-semibold text-purple-300"
            animate={{
              y: [6, -6, 6],
              x: [-3, 3, -3],
            }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>24/7 Smart Agent</span>
          </motion.div>

          {/* Badge 3: Bottom Right - Kadmak Shield */}
          <motion.div
            className="absolute bottom-6 -right-4 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 shadow-lg text-[11px] font-medium text-emerald-300"
            animate={{
              y: [-4, 4, -4],
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>kadmak.in Verified</span>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default ThreeDCharacter;
