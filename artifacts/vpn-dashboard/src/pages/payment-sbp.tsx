import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useCreateSbpPayment, useGetPaymentStatus } from "@workspace/api-client-react";
import { Wallet, Loader2, ArrowLeft, CheckCircle2, QrCode } from "lucide-react";
import { Link } from "wouter";

export default function PaymentSbp() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [bankName, setBankName] = useState<string | null>(null);

  const createPaymentMutation = useCreateSbpPayment();
  
  // Polling for payment status
  const { data: status } = useGetPaymentStatus(paymentId || "", {
    query: { 
      enabled: !!paymentId,
      refetchInterval: (query) => {
        const st = query.state.data?.status;
        if (st === "paid" || st === "expired" || st === "failed") return false;
        return 3000;
      }
    }
  });

  useEffect(() => {
    if (id && !paymentId && !createPaymentMutation.isPending && !createPaymentMutation.isSuccess) {
      createPaymentMutation.mutate({ data: { planId: parseInt(id) } }, {
        onSuccess: (data) => {
          setPaymentId(data.paymentId);
          setQrUrl(data.qrUrl);
          setAmount(data.amount);
          setBankName(data.bankName);
        }
      });
    }
  }, [id, paymentId, createPaymentMutation]);

  useEffect(() => {
    if (status?.status === "paid") {
      setTimeout(() => setLocation("/dashboard"), 3000);
    }
  }, [status?.status, setLocation]);

  const isPaid = status?.status === "paid";
  const isFailed = status?.status === "failed" || status?.status === "expired";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/plans" className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight neon-text">СБП Payment</h1>
          <p className="text-muted-foreground font-mono text-sm tracking-wider uppercase">Fast Bank Transfer</p>
        </div>
      </div>

      <div className="bg-card p-10 rounded-2xl neon-border text-center relative overflow-hidden">
        
        <div className="relative z-10 flex flex-col items-center">
          {createPaymentMutation.isPending && !paymentId ? (
            <div className="flex flex-col items-center py-12">
              <Loader2 className="w-12 h-12 text-secondary animate-spin mb-4" />
              <p className="text-lg text-muted-foreground animate-pulse">Generating payment details...</p>
            </div>
          ) : isPaid ? (
            <div className="flex flex-col items-center py-12 animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Payment Confirmed</h2>
              <p className="text-muted-foreground">Access granted. Redirecting to dashboard...</p>
            </div>
          ) : isFailed ? (
            <div className="flex flex-col items-center py-12">
              <div className="w-20 h-20 bg-destructive/20 rounded-full flex items-center justify-center mb-6">
                <ArrowLeft className="w-10 h-10 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold text-destructive mb-2">Payment Failed / Expired</h2>
              <p className="text-muted-foreground mb-6">The transaction window has closed.</p>
              <Link href="/plans" className="px-6 py-3 rounded-md font-bold uppercase text-foreground bg-muted hover:bg-muted/80">
                Try Again
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full">
              <div className="text-4xl font-bold text-foreground mb-2 drop-shadow-md">
                ₽{amount}
              </div>
              <p className="text-secondary font-mono text-sm mb-8 uppercase tracking-widest">{bankName}</p>

              <div className="bg-white p-4 rounded-xl mb-8 shadow-[0_0_20px_rgba(123,47,255,0.2)]">
                {qrUrl ? (
                  <img src={qrUrl} alt="Payment QR Code" className="w-48 h-48" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center bg-gray-100 text-gray-400">
                    <QrCode className="w-16 h-16" />
                  </div>
                )}
              </div>

              <div className="w-full max-w-sm space-y-4">
                <p className="text-sm text-muted-foreground mb-4">Scan QR code with your banking app</p>
                
                <div className="flex items-center justify-center gap-3 pt-4 border-t border-border/50 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin text-secondary" />
                  <span className="font-mono">Waiting for bank confirmation...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
