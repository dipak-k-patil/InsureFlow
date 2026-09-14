import { Menu, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NotificationsBell } from "@/components/NotificationsBell";
import { UserMenu } from "@/components/UserMenu";

export function Topbar({ onMenu }: { onMenu?: () => void }) {
  return (
    <header className="h-16 border-b border-border bg-card/40 backdrop-blur-xl sticky top-0 z-20 flex items-center justify-between px-4 md:px-6 gap-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {onMenu && (
          <button
            onClick={onMenu}
            className="md:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
        )}
        <div className="relative max-w-md w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search leads, policies..."
            className="pl-10 bg-muted/50 border-border/50 focus:border-primary/50 h-9"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <NotificationsBell />
        <UserMenu />
      </div>
    </header>
  );
}
