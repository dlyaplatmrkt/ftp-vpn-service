import { Layout } from "@/components/layout";
import { useGetPaymentStatus } from "@workspace/api-client-react";
import { useParams, useLocation } from "wouter";
import { Activity, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function Payment() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const invoiceId = params.invoiceId || "";

  const { data: statusData, error } = useGetPaymentStatus(invoiceId, {
    query: {
      queryKey: ["/api/payments", invoiceId],
      refetchInterval: (query) => query.state.data?.status === "pending" ? 4000 : false,
      enabled: !!invoiceId
    }
  });

  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (statusData?.status === "paid" || statusData?.status === "failed" || statusData?.status === "expired") {
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) { clearInterval(timer); setLocation("/dashboard"); return 0; }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [statusData?.status, setLocation]);

  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-6">
          <AlertCircle className="w-16 h-16 text-red-400" />
          <h2 className="text-xl font-bold text-foreground">Ошибка проверки платежа</h2>
          <p className="text-muted-foreground text-sm">Не удалось получить статус. Попробуйте позже.</p>
          <button onClick={() => setLocation("/plans")}
            className="px-6 py-3 rounded-xl text-sm font-medium transition-all"
            style={{background:"rgba(0,212,255,0.1)", border:"1px solid rgba(0,212,255,0.25)", color:"#00d4ff"}}>
            Вернуться к тарифам
          </button>
        </div>
      </Layout>
    );
  }

  const statusConfig: Record<string, {icon: any, color: string, title: string, desc: string}> = {
    pending: {
      icon: Clock, color: "#00d4ff",
      title: "Ожидаем оплату",
      desc: "Страница обновляется автоматически. Как только оплата подтвердится — подписка активируется."
    },
    paid: {
      icon: CheckCircle, color: "#22c55e",
      title: "Оплата прошла успешно!",
      desc: `Подписка активирована. Переход в кабинет через ${countdown} сек...`
    },
    expired: {
      icon: XCircle, color: "#8888aa",
      title: "Время ожидания истекло",
      desc: "Счёт просрочен. Создайте новый платёж."
    },
    failed: {
      icon: XCircle, color: "#ef4444",
      title: "Платёж не прошёл",
      desc: "Возникла ошибка. Попробуйте снова или обратитесь в поддержку."
    }
  };

  const current = statusData ? statusConfig[statusData.status] : null;

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="w-full max-w-sm rounded-2xl p-8 text-center space-y-6"
             style={{background:"rgba(22,22,42,0.9)", border:"1px solid rgba(0,212,255,0.15)"}}>

          <div className="flex justify-center">
            {!statusData || !current
              ? <Activity className="w-16 h-16 text-muted-foreground animate-spin" />
              : <current.icon className="w-16 h-16" style={{color: current.color}} />
            }
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">
              {current?.title || "Проверяем..."}
            </h2>
            <p className="text-sm text-muted-foreground">
              {statusData?.status === "paid"
                ? `Подписка активирована. Переход через ${countdown} сек...`
                : current?.desc || "Загружаем данные..."}
            </p>
          </div>

          <div className="text-xs text-muted-foreground font-mono py-2 px-3 rounded-lg"
               style={{background:"rgba(0,0,0,0.3)"}}>
            ID: {invoiceId.slice(0, 16)}...
          </div>

          {statusData?.status && statusData.status !== "pending" && (
            <button onClick={() => setLocation(statusData.status === "paid" ? "/dashboard" : "/plans")}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
              style={{background:"linear-gradient(135deg,#00d4ff,#8b5cf6)", color:"#0a0a0f"}}>
              {statusData.status === "paid" ? "Перейти в кабинет" : "Вернуться к тарифам"}
            </button>
          )}

          {statusData?.status === "pending" && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Activity className="w-3 h-3 animate-spin" />
              Проверяем каждые 4 секунды...
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
