import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Shield, KeyRound, Loader2, ArrowRight } from "lucide-react";
import { useLoginWithKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import logoImg from "@assets/QbIwSDf_-_Imgur_1776301039429.jpg";

export default function Login() {
  const [accessKey, setAccessKey] = useState("");
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();
  const { login, isAuthenticated } = useAuth();
  const loginMutation = useLoginWithKey();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!accessKey.trim()) {
      setError("Access key is required");
      return;
    }

    loginMutation.mutate({ data: { accessKey } }, {
      onSuccess: (data) => {
        if (data.success && data.user) {
          login(data.user.accessKey);
          setLocation("/dashboard");
        } else {
          setError("Invalid access key");
        }
      },
      onError: () => {
        setError("Invalid access key or server error");
      }
    });
  };

  const formatKey = (val: string) => {
    const cleaned = val.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const parts = [];
    for (let i = 0; i < cleaned.length; i += 4) {
      parts.push(cleaned.substring(i, i + 4));
    }
    return parts.join('-');
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background dark relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      
      <div className="w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-block relative mb-6">
            <div className="absolute -inset-4 bg-primary/20 blur-xl rounded-full" />
            <img src={logoImg} alt="FTP VPN Logo" className="w-32 h-32 object-contain relative z-10 rounded-xl border border-primary/30 shadow-[0_0_30px_rgba(0,212,255,0.3)]" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 neon-text">FTP VPN</h1>
          <p className="text-muted-foreground font-mono text-sm tracking-widest uppercase">Secure Underground Node</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-xl neon-border">
          <div className="space-y-2">
            <label className="text-xs font-mono text-primary uppercase tracking-wider">Access Key</label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={accessKey}
                onChange={(e) => setAccessKey(formatKey(e.target.value))}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className="w-full bg-input border border-border rounded-md py-3 pl-12 pr-4 font-mono text-lg tracking-wider text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all neon-input"
                maxLength={19}
              />
            </div>
            {error && <p className="text-destructive text-sm font-medium mt-2">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending || accessKey.length < 19}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-md font-bold uppercase tracking-wider text-foreground neon-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loginMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span className="text-primary-foreground drop-shadow-md">Initialize Connection</span>
                <ArrowRight className="w-5 h-5 text-primary-foreground" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground/60 font-mono">
            CONNECTION ESTABLISHED VIA ENCRYPTED TUNNEL
          </p>
        </div>
      </div>
    </div>
  );
}
