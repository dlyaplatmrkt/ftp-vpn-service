import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Shield, LayoutDashboard, Settings, CreditCard, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useGetMe, useLogout } from "@workspace/api-client-react";
import { useState } from "react";

export function Layout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: user } = useGetMe({ query: { retry: false } });
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        logout();
        setLocation("/");
      }
    });
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/configs", label: "VPN Configs", icon: Settings },
    { href: "/plans", label: "Subscription Plans", icon: CreditCard },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background text-foreground dark">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg neon-text">FTP VPN</span>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-foreground">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 hidden md:flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary drop-shadow-[0_0_8px_rgba(0,212,255,0.8)]" />
          <span className="font-bold text-xl neon-text tracking-wider">FTP VPN</span>
        </div>

        <div className="mt-6 px-4">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4 px-2">Menu</div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href || location.startsWith(item.href + "/");
              return (
                <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all cursor-pointer ${
                    isActive 
                      ? "bg-primary/10 text-primary border border-primary/30 shadow-[inset_0_0_10px_rgba(0,212,255,0.1)]" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}>
                    <Icon className={`w-5 h-5 ${isActive ? "text-primary drop-shadow-[0_0_5px_rgba(0,212,255,0.5)]" : ""}`} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-border bg-card">
          {user && (
            <div className="mb-4 px-2 text-sm text-muted-foreground break-all">
              <span className="opacity-50">ID:</span> <span className="font-mono">{user.accessKey.substring(0, 4)}...{user.accessKey.substring(15)}</span>
            </div>
          )}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Disconnect</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
        <div className="relative z-10 p-6 md:p-10 max-w-6xl mx-auto w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
