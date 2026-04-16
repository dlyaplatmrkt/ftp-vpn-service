import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useCreateCryptoPayment, useGetPaymentStatus } from "@workspace/api-client-react";
import { Bitcoin, Loader2, ArrowLeft, CheckCircle2, ExternalLink } from "lucide-react";
import { Link } from "wouter";

export default function PaymentCrypto() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string | null>(null);

  const createPaymentMutation = useCreateCryptoPayment();
  
  // Polling for payment status
  const { data: status } = useGetPaymentStatus(paymentId || "", {
    query: { 
      enabled: !!paymentId,
      refetchInterval: (query) => {
        // Stop polling if paid or expired
        const st = query.state.data?.status;
        if (st === "paid" || st === "expired" || st === "failed") return false;
        return 3000; // Poll every 3s
      }
    }
  });

  useEffect(() => {
    if (id && !paymentId && !createPaymentMutation.isPending && !createPaymentMutation.isSuccess) {
      createPaymentMutation.mutate({ data: { planId: parseInt(id) } }, {
        onSuccess: (data) => {
          setPaymentId(data.paymentId);
          setInvoiceUrl(data.invoiceUrl);
          setAmount(data.amount);
          setCurrency(data.currency);
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
          <h1 className="text-3xl font-bold tracking-tight neon-text">Crypto Payment</h1>
          <p className="text-muted-foreground font-mono text-sm tracking-wider uppercase">Secure Transaction</p>
        </div>
      </div>

      <div className="bg-card p-10 rounded-2xl neon-border text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center">
          {createPaymentMutation.isPending && !paymentId ? (
            <div className="flex flex-col items-center py-12">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-lg text-muted-foreground animate-pulse">Generating invoice...</p>
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
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-8 border border-primary/30 shadow-[0_0_20px_rgba(0,212,255,0.2)]">
                <Bitcoin className="w-10 h-10 text-primary" />
              </div>
              
              <div className="text-4xl font-bold text-foreground mb-2 drop-shadow-md">
                {amount} <span className="text-primary">{currency}</span>
              </div>
              <p className="text-muted-foreground font-mono text-sm mb-10 uppercase tracking-widest">Awaiting Transfer</p>

              <div className="w-full max-w-sm space-y-4">
                <a 
                  href={invoiceUrl || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-4 rounded-md font-bold uppercase tracking-wider flex items-center justify-center gap-3 text-primary-foreground neon-button shadow-[0_0_15px_rgba(0,212,255,0.3)]"
                >
                  <span>Open CryptoBot</span>
                  <ExternalLink className="w-5 h-5" />
                </a>
                
                <div className="flex items-center justify-center gap-3 pt-6 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="font-mono">Listening for payment confirmation on blockchain...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
