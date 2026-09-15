import { NavLink as RouterNavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  DollarSign,
  Megaphone,
  Zap,
  CreditCard,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  CalendarClock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navGroups = [
  { label: "Overview", items: [{ title: "Dashboard", to: "/", icon: LayoutDashboard }] },
  {
    label: "CRM",
    items: [
      { title: "Leads", to: "/leads", icon: Users },
      { title: "Policies", to: "/policies", icon: FileText },
      { title: "Renewals", to: "/renewals", icon: CalendarClock },
      { title: "Commissions", to: "/commissions", icon: DollarSign },
    ],
  },
  {
    label: "Tools",
    items: [
      { title: "Marketing", to: "/marketing", icon: Megaphone },
      { title: "Automation", to: "/automation", icon: Zap },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Subscription", to: "/subscription", icon: CreditCard },
      { title: "Settings", to: "/settings", icon: Settings },
    ],
  },
];

interface Props {
  mobile?: boolean;
  onNavigate?: () => void;
}

export function AppSidebar({ mobile = false, onNavigate }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const expanded = mobile ? true : !collapsed;

  return (
    <motion.aside
      animate={mobile ? undefined : { width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "h-screen flex flex-col border-r border-sidebar-border bg-sidebar overflow-hidden z-30",
        mobile ? "w-64" : "sticky top-0"
      )}
    >
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-sidebar-border shrink-0 overflow-hidden">
        <img
          src="/insureflow-logo.png"
          alt="Kadmak Logo"
          className="h-8 w-auto object-contain shrink-0"
        />
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col overflow-hidden"
            >
              <span className="font-bold text-base leading-none text-sidebar-foreground">Kadmak</span>
              <span className="text-[10px] text-primary font-medium tracking-tight">kadmak.in • AI Platform</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <AnimatePresence>
              {expanded && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60"
                >
                  {group.label}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <RouterNavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent",
                      isActive && "bg-primary/10 text-primary border border-primary/20"
                    )
                  }
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <AnimatePresence>
                    {expanded && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="whitespace-nowrap"
                      >
                        {item.title}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </RouterNavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {!mobile && (
        <div className="border-t border-sidebar-border p-2 shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4 shrink-0" /> : <ChevronLeft className="w-4 h-4 shrink-0" />}
            {expanded && <span>Collapse</span>}
          </button>
        </div>
      )}
    </motion.aside>
  );
}
