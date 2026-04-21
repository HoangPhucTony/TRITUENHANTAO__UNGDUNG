import { Link, useLocation } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LayoutDashboard, BarChart3, Brain, Calculator, Sparkles, Building2, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";

const navItems = [
  { to: "/", label: "Tổng quan", icon: LayoutDashboard },
  { to: "/eda", label: "Phân tích dữ liệu", icon: BarChart3 },
  { to: "/model", label: "Mô hình AI", icon: Brain },
  { to: "/prediction", label: "Dự đoán giá", icon: Calculator },
  { to: "/demo", label: "Demo hệ thống", icon: Sparkles },
] as const;

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="min-h-screen flex w-full text-foreground">
      <aside className="w-64 shrink-0 border-r border-sidebar-border bg-sidebar/60 backdrop-blur-xl sticky top-0 h-screen flex flex-col">
        <div className="px-6 py-6 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center glow-primary">
            <Building2 className="size-5 text-primary-foreground" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight">SmartStay</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">AI Platform</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map(item => {
            const active = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 to-accent/10 border border-primary/30"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className="size-4 relative z-10" />
                <span className="relative z-10 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Theme toggle */}
        <div className="px-3 pb-2">
          <button
            onClick={toggleTheme}
            className={cn(
              "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              "border border-border hover:border-primary/40",
              "bg-sidebar-accent/40 hover:bg-sidebar-accent/70 text-muted-foreground hover:text-foreground"
            )}
          >
            <motion.div
              key={theme}
              initial={{ rotate: -30, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
            </motion.div>
            <span>{theme === "light" ? "Chế độ tối" : "Chế độ sáng"}</span>
          </button>
        </div>

        <div className="m-3 p-4 rounded-xl glass-card">
          <div className="text-xs text-muted-foreground mb-1">Phiên bản</div>
          <div className="text-sm font-semibold">SmartStay AI v1.0</div>
          <div className="text-[10px] text-muted-foreground mt-1">© 2025 SmartStay Labs</div>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="px-8 py-8 max-w-[1400px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
