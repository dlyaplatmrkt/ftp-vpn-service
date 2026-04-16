import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Activity } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useLogin();
  const [key, setKey] = useState("");

  useEffect(() => {
    const existingKey = window.localStorage.getItem("ftp_vpn_license_key");
    if (existingKey) setLocation("/dashboard");
  }, [setLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;

    loginMutation.mutate({ data: { licenseKey: key.trim() } }, {
      onSuccess: (data) => {
        window.localStorage.setItem("ftp_vpn_license_key", data.licenseKey);
        setLocation("/dashboard");
        toast({ title: "Добро пожаловать", description: "Доступ открыт." });
      },
      onError: (err: any) => {
        toast({
          title: "Ошибка входа",
          description: err.data?.message || "Неверный ключ. Проверьте правильность ввода.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none"
           style={{background:"radial-gradient(ellipse 80% 60% at 50% 60%, rgba(139,92,246,0.12) 0%, transparent 70%)"}} />
      <div className="absolute inset-0 pointer-events-none"
           style={{background:"radial-gradient(ellipse 40% 30% at 50% 80%, rgba(0,212,255,0.08) 0%, transparent 60%)"}} />

      <div className="w-full max-w-md z-10 space-y-8">

        {/* Logo + title */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-2">
            <img src="/logo.jpg" alt="FTPVPN" className="w-20 h-20 rounded-2xl"
                 style={{boxShadow:"0 0 40px rgba(0,212,255,0.25), 0 0 80px rgba(139,92,246,0.15)"}} />
          </div>
          <h1 className="text-4xl font-bold gradient-text tracking-tight">FTPVPN</h1>
          <p className="text-sm text-muted-foreground">Приватный VPN без регистрации и слежки</p>
        </div>

        {/* Login card */}
        <div className="rounded-2xl p-8 space-y-6"
             style={{
               background:"rgba(22,22,42,0.9)",
               border:"1px solid rgba(0,212,255,0.15)",
               backdropFilter:"blur(16px)",
               boxShadow:"0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,212,255,0.06)"
             }}>
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Вход по ключу</h2>
            <p className="text-sm text-muted-foreground">Введите ваш лицензионный ключ для доступа к личному кабинету</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Лицензионный ключ
              </label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className="w-full px-4 py-3 rounded-xl font-mono text-center text-base tracking-[0.15em] transition-all outline-none"
                style={{
                  background:"rgba(10,10,15,0.6)",
                  border:"1px solid rgba(0,212,255,0.15)",
                  color:"#e8e8f0",
                }}
                onFocus={(e) => { e.target.style.borderColor="rgba(0,212,255,0.5)"; e.target.style.boxShadow="0 0 0 3px rgba(0,212,255,0.08)"; }}
                onBlur={(e) => { e.target.style.borderColor="rgba(0,212,255,0.15)"; e.target.style.boxShadow="none"; }}
                autoComplete="off"
                spellCheck="false"
              />
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending || !key.trim()}
              className="w-full py-3 rounded-full font-bold text-sm tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{background:"linear-gradient(135deg,#00d4ff,#8b5cf6)", color:"#0a0a0f"}}
            >
              {loginMutation.isPending ? (
                <><Activity className="w-4 h-4 animate-spin" /> Проверка...</>
              ) : "Войти"}
            </button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setKey("DEMO-TEST-USER-0001")}
              className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
            >
              Использовать демо-ключ: DEMO-TEST-USER-0001
            </button>
          </div>
        </div>

        {/* Footer links */}
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <Link href="/guide" className="hover:text-primary transition-colors">Инструкция</Link>
          <span className="opacity-30">·</span>
          <Link href="/legal" className="hover:text-primary transition-colors">Оферта</Link>
          <span className="opacity-30">·</span>
          <a href="https://t.me/ftpvpn_support" target="_blank" rel="noopener" className="hover:text-primary transition-colors">Поддержка</a>
        </div>
      </div>
    </div>
  );
}
