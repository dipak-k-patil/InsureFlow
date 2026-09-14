import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  href: string;
  label?: string;
  className?: string;
  compact?: boolean;
}

export function WhatsAppButton({ href, label = "WhatsApp", className, compact }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title="Send WhatsApp reminder"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-success/30 bg-success/10 text-success hover:bg-success/20 transition-colors",
        compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm",
        className
      )}
    >
      <MessageCircle className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
      {!compact && <span>{label}</span>}
    </a>
  );
}
