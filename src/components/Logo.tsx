import React from "react";
import { Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = "",
  size = "md",
  showTagline = true,
}) => {
  const textSizeClass =
    size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-2xl";
  const iconSizeClass =
    size === "sm" ? "w-5 h-5" : size === "lg" ? "w-8 h-8" : "w-6 h-6";

  return (
    <Link to="/" className={`inline-flex flex-col ${className}`}>
      <div className="flex items-center gap-2.5 group">
        <div className="relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-[#00c6ff] via-[#0072ff] to-[#a100f2] p-2 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
          <Shield className={`${iconSizeClass} text-white fill-white/20`} />
          <Sparkles className="w-3 h-3 text-cyan-200 absolute -top-1 -right-1 animate-pulse" />
        </div>

        <div className="flex flex-col">
          <span
            className={`${textSizeClass} font-extrabold tracking-tight bg-gradient-to-r from-[#00c6ff] via-[#0072ff] to-[#a100f2] bg-clip-text text-transparent flex items-center gap-1`}
          >
            InsurFlow
            <span className="text-foreground text-xs font-semibold px-1.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              AI
            </span>
          </span>

          {showTagline && (
            <span className="text-[10px] font-semibold tracking-wider text-muted-foreground flex items-center gap-1 -mt-0.5">
              <span>powered by</span>
              <span className="text-cyan-400 font-bold hover:underline">
                Kadmak.in
              </span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default Logo;
