import { Layout } from "@/components/layout";
import { useGetPlans, useCreateCryptoBotInvoice, useCreateSbpQr } from "@workspace/api-client-react";
import { QrCode, Activity, CheckCircle2, Zap, X } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Plans() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: plansData, isLoading } = useGetPlans({ query: { queryKey: ["/api/subscription/plans"] } });
  const createCryptoInvoice = useCreateCryptoBotInvoice();
  const createSbpQr = useCreateSbpQr();

  const [sbpData, setSbpData] = useState<any>(null);

  const handleCryptoPayment = (planId: string) => {
    createCryptoInvoice.mutate({ data: { planId } }, {
      onSuccess: (data) => {
        window.open(data.payUrl, "_blank");
        setLocation(`/payment/${data.invoiceId}`);
      },
      onError: (err: any) => {
        toast({ title: "Ошибка", description: err?.data?.message || "Не удалось создать счёт.", variant: "destructive" });
      }
    });
  };

  const handleSbpPayment = (planId: string) => {
    createSbpQr.mutate({ data: { planId } }, {
      onSuccess: (data) => { setSbpData(data); },
      onError: (err: any) => {
        toast({ title: "Ошибка", description: err?.data?.message || "Не удалось создать QR-код.", variant: "destructive" });
      }
    });
  };

  const plans = plansData?.plans.filter(p => p.id !== "demo") || [];

  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">

        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Тарифы</h1>
          <p className="text-sm text-muted-foreground">Выберите период подписки и способ оплаты</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-16">
            <Activity className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="rounded-2xl flex flex-col relative overflow-hidden transition-all"
                style={{
                  background:"rgba(22,22,42,0.9)",
                  border: plan.popular ? "1px solid rgba(0,212,255,0.35)" : "1px solid rgba(0,212,255,0.1)",
                  boxShadow: plan.popular ? "0 0 30px rgba(0,212,255,0.08)" : undefined
                }}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 h-0.5"
                       style={{background:"linear-gradient(90deg,#00d4ff,#8b5cf6)"}} />
                )}

                {plan.popular && (
                  <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-xs font-bold"
                       style={{background:"rgba(0,212,255,0.15)", color:"#00d4ff", border:"1px solid rgba(0,212,255,0.3)"}}>
                    Популярный
                  </div>
                )}

                <div className="p-6 border-b" style={{borderColor:"rgba(0,212,255,0.08)"}}>
                  <h3 className="text-lg font-bold text-foreground mb-3">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-bold gradient-text">{plan.price}</span>
                    <span className="text-muted-foreground font-medium">₽</span>
                  </div>
                  <div className="text-xs text-muted-foreground">≈ {plan.priceUsdt} USDT</div>
                </div>

                <div className="p-6 flex-1 space-y-3">
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                  <ul className="space-y-2">
                    {[
                      `${plan.days} дней доступа`,
                      "5 серверов (NL, DE, FI, FR, US)",
                      "Безлимитный трафик",
                      "AmneziaWG / WireGuard",
                      "Один ключ — все устройства",
                    ].map((feat) => (
                      <li key={feat} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{color:"#00d4ff"}} />
                        <span className="text-foreground/80">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 pt-0 space-y-2">
                  <button
                    onClick={() => handleSbpPayment(plan.id)}
                    disabled={createSbpQr.isPending}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                    style={{background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"#e8e8f0"}}
                  >
                    <QrCode className="w-4 h-4" />
                    Оплатить через СБП
                  </button>
                  <button
                    onClick={() => handleCryptoPayment(plan.id)}
                    disabled={createCryptoInvoice.isPending}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                    style={{background:"linear-gradient(135deg,#00d4ff,#8b5cf6)", color:"#0a0a0f"}}
                  >
                    <Zap className="w-4 h-4" />
                    Оплатить USDT (CryptoBot)
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SBP modal */}
        {sbpData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
               style={{background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)"}}>
            <div className="w-full max-w-sm rounded-2xl p-6 space-y-5"
                 style={{background:"#16162a", border:"1px solid rgba(0,212,255,0.2)"}}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg gradient-text">Оплата через СБП</h3>
                <button onClick={() => setSbpData(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex justify-center">
                <div className="p-3 bg-white rounded-2xl inline-block">
                  <img
                    src={sbpData.qrCode.startsWith("data:") ? sbpData.qrCode : sbpData.qrCode}
                    alt="QR-код для оплаты"
                    className="w-48 h-48 object-contain"
                  />
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {[
                  { label: "Сумма", value: `${sbpData.amount} ₽`, highlight: true },
                  { label: "Телефон", value: sbpData.phone },
                  { label: "Банк", value: sbpData.bank },
                  { label: "Действует до", value: new Date(sbpData.expiresAt).toLocaleString("ru-RU") },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center py-2 border-b"
                       style={{borderColor:"rgba(0,212,255,0.08)"}}>
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className={row.highlight ? "font-bold" : ""} style={row.highlight ? {color:"#00d4ff"} : {}}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Отсканируйте QR-код в приложении банка или переведите по номеру телефона
              </p>

              <button
                onClick={() => { setSbpData(null); setLocation(`/payment/${sbpData.invoiceId}`); }}
                className="w-full py-3 rounded-xl text-sm font-medium transition-all"
                style={{background:"rgba(0,212,255,0.1)", border:"1px solid rgba(0,212,255,0.25)", color:"#00d4ff"}}
              >
                Я оплатил — проверить статус
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
