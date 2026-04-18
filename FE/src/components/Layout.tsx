import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, BarChart3, Brain, Calculator, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "Tổng quan", icon: LayoutDashboard },
  { to: "/eda", label: "Phân tích Dữ liệu", icon: BarChart3 },
  { to: "/model", label: "Huấn luyện Mô hình", icon: Brain },
  { to: "/predict", label: "Dự đoán Giá", icon: Calculator },
  { to: "/demo", label: "Web Demo", icon: Search },
] as const;

export function Layout() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="sticky top-0 z-50 glass-strong border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero shadow-glow">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-bold tracking-tight text-foreground">SmartStay <span className="text-gradient">AI</span></span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">PropTech Platform</span>
              </div>
            </Link>
            <nav className="hidden lg:flex items-center gap-1">
              {tabs.map((t) => {
                const active = pathname === t.to;
                const Icon = t.icon;
                return (
                  <Link
                    key={t.to}
                    to={t.to}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                      active
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {t.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <nav className="lg:hidden flex overflow-x-auto gap-1 pb-2 -mx-1 px-1">
            {tabs.map((t) => {
              const active = pathname === t.to;
              return (
                <Link key={t.to} to={t.to} className={cn(
                  "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium",
                  active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>{t.label}</Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <Outlet />
      </main>
      <footer className="border-t border-border mt-16 py-8 text-center text-xs text-muted-foreground">
        © 2026 SmartStay AI · Định giá & Gợi ý trọ thông minh
      </footer>
    </div>
  );
}
