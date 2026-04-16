import { Link, useLocation } from "wouter";
import { useGetMe, useLogout } from "@workspace/api-client-react";
import { useEffect } from "react";
import { Shield, Activity, HardDrive, CreditCard, LogOut, Key, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading, isError } = useGetMe({
    query: { retry: false }
  });

  const logoutMutation = useLogout();

  useEffect(() => {
    if (isError) {
      window.localStorage.removeItem("ftp_vpn_license_key");
      setLocation("/");
    }
  }, [isError, setLocation]);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        window.localStorage.removeItem("ftp_vpn_license_key");
        setLocation("/");
        toast({ title: "Выход выполнен", description: "Соединение разорвано." });
      },
      onError: () => {
        window.localStorage.removeItem("ftp_vpn_license_key");
        setLocation("/");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <img src="/logo.jpg" alt="FTPVPN" className="w-16 h-16 rounded-2xl opacity-80" />
            <div className="absolute inset-0 rounded-2xl animate-ping" style={{boxShadow:"0 0 20px rgba(0,212,255,0.4)"}}></div>
          </div>
          <span className="text-sm font-mono text-muted-foreground tracking-widest uppercase">Загрузка...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const navItems = [
    { href: "/dashboard", label: "Статус", icon: Shield },
    { href: "/configs", label: "Конфигурации", icon: HardDrive },
    { href: "/plans", label: "Тарифы", icon: CreditCard },
    { href: "/guide", label: "Инструкция", icon: BookOpen },
  ];

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-card flex flex-col"
             style={{borderColor:"rgba(0,212,255,0.12)"}}>
        <div className="p-5 border-b flex items-center gap-3" style={{borderColor:"rgba(0,212,255,0.12)"}}>
          <img src="/logo.jpg" alt="FTPVPN" className="w-9 h-9 rounded-xl" />
          <div>
            <h1 className="font-bold text-lg leading-none gradient-text">FTPVPN</h1>
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mt-0.5">Приватная сеть</p>
          </div>
        </div>

        <div className="p-5 mb-auto">
          <div className="flex items-center gap-2 mb-5 p-3 bg-background/60 border rounded-xl text-sm font-mono"
               style={{borderColor:"rgba(0,212,255,0.12)"}}>
            <Key className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div className="truncate text-muted-foreground text-xs" title={user.licenseKey}>
              {user.licenseKey.slice(0, 4)}••••{user.licenseKey.slice(-4)}
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${
                  location === item.href
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                style={location === item.href ? {
                  background:"rgba(0,212,255,0.08)",
                  border:"1px solid rgba(0,212,255,0.2)"
                } : {border:"1px solid transparent"}}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-5 border-t" style={{borderColor:"rgba(0,212,255,0.12)"}}>
          <div className="mb-3 px-4 py-2 rounded-xl text-xs font-mono text-center"
               style={{
                 background: user.subscription?.status === "active"
                   ? "rgba(0,212,255,0.08)" : "rgba(239,68,68,0.08)",
                 border: user.subscription?.status === "active"
                   ? "1px solid rgba(0,212,255,0.2)" : "1px solid rgba(239,68,68,0.2)",
                 color: user.subscription?.status === "active" ? "#00d4ff" : "#ef4444"
               }}>
            {user.subscription?.status === "active" ? "Подписка активна" : "Подписка неактивна"}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-red-400 transition-colors"
            style={{border:"1px solid transparent"}}
          >
            <LogOut className="w-4 h-4" />
            Выйти
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
