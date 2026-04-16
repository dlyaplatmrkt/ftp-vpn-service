import { Layout } from "@/components/layout";
import { useGetMe, useGetDashboardStats } from "@workspace/api-client-react";
import { Shield, ShieldAlert, Clock, HardDrive, Download, Zap, Activity, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: user } = useGetMe({ query: { enabled: true, queryKey: ["/api/auth/me"] } });
  const { data: stats, isLoading } = useGetDashboardStats({ query: { queryKey: ["/api/dashboard/stats"] } });

  const sub = user?.subscription;
  const isActive = sub?.status === "active";

  const statusLabel: Record<string, string> = { active: "Активна", expired: "Истекла", pending: "Ожидание" };
  const planLabel: Record<string, string> = { start: "Старт", standard: "Стандарт", pro: "Про", demo: "Демо" };

  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Личный кабинет</h1>
          <p className="text-sm text-muted-foreground">Состояние вашего VPN-подключения</p>
        </div>

        {/* Status banner */}
        <div className="rounded-2xl p-6 flex items-center justify-between gap-4 flex-wrap"
             style={{
               background: isActive ? "rgba(0,212,255,0.06)" : "rgba(239,68,68,0.06)",
               border: isActive ? "1px solid rgba(0,212,255,0.2)" : "1px solid rgba(239,68,68,0.2)"
             }}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl" style={{background: isActive ? "rgba(0,212,255,0.12)" : "rgba(239,68,68,0.12)"}}>
              {isActive
                ? <Shield className="w-6 h-6" style={{color:"#00d4ff"}} />
                : <ShieldAlert className="w-6 h-6 text-red-400" />
              }
            </div>
            <div>
              <div className="font-semibold text-foreground">
                Подписка: <span style={{color: isActive ? "#00d4ff" : "#ef4444"}}>
                  {statusLabel[sub?.status || ""] || sub?.status}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Тариф: {planLabel[sub?.plan || ""] || sub?.plan}
                {sub?.expiresAt && ` · до ${new Date(sub.expiresAt).toLocaleDateString("ru-RU")}`}
              </div>
            </div>
          </div>
          {!isActive && (
            <Link href="/plans"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
              style={{background:"linear-gradient(135deg,#00d4ff,#8b5cf6)", color:"#0a0a0f"}}>
              Продлить <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: Clock, label: "Дней осталось",
              value: isLoading ? null : (stats?.daysRemaining ?? 0),
              color: "#00d4ff"
            },
            {
              icon: HardDrive, label: "Локаций",
              value: isLoading ? null : (stats?.locationsCount ?? 5),
              color: "#8b5cf6"
            },
            {
              icon: Download, label: "Скачано конфигов",
              value: isLoading ? null : (stats?.totalDownloads ?? 0),
              color: "#00d4ff"
            },
            {
              icon: Zap, label: "VPN активен",
              value: isLoading ? null : (stats?.isActive ? "Да" : "Нет"),
              color: stats?.isActive ? "#00d4ff" : "#8888aa"
            },
          ].map((item, i) => (
            <div key={i} className="rounded-2xl p-5 flex flex-col gap-3"
                 style={{background:"rgba(22,22,42,0.8)", border:"1px solid rgba(0,212,255,0.1)"}}>
              <item.icon className="w-5 h-5" style={{color: item.color}} />
              <div className="text-2xl font-bold font-mono" style={{color: item.color}}>
                {isLoading
                  ? <Activity className="w-5 h-5 animate-spin text-muted-foreground" />
                  : item.value}
              </div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/configs"
            className="rounded-2xl p-6 flex items-center justify-between group transition-all hover:border-primary/30"
            style={{background:"rgba(22,22,42,0.8)", border:"1px solid rgba(0,212,255,0.1)"}}>
            <div>
              <div className="font-semibold text-foreground mb-1">Скачать конфигурацию</div>
              <div className="text-sm text-muted-foreground">WireGuard .conf файл для подключения</div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
          <Link href="/guide"
            className="rounded-2xl p-6 flex items-center justify-between group transition-all hover:border-primary/30"
            style={{background:"rgba(22,22,42,0.8)", border:"1px solid rgba(0,212,255,0.1)"}}>
            <div>
              <div className="font-semibold text-foreground mb-1">Инструкция по настройке</div>
              <div className="text-sm text-muted-foreground">Пошаговая установка на любом устройстве</div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        </div>

      </div>
    </Layout>
  );
}
