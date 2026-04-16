import { useGetSubscriptionPlans, getGetSubscriptionPlansQueryKey } from "@workspace/api-client-react";
import { Shield, Check, Zap, Cpu, Bitcoin, Wallet } from "lucide-react";
import { useLocation } from "wouter";

export default function Plans() {
  const [, setLocation] = useLocation();
  const { data: plans, isLoading } = useGetSubscriptionPlans({
    query: { queryKey: getGetSubscriptionPlansQueryKey() }
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const handlePayment = (planId: number, method: 'crypto' | 'sbp') => {
    setLocation(`/payment/${method}/${planId}`);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-secondary/10 rounded-full mb-2">
          <Zap className="w-8 h-8 text-secondary drop-shadow-[0_0_8px_rgba(123,47,255,0.5)]" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight neon-text pb-2">Network Access Plans</h1>
        <p className="text-muted-foreground text-lg">Secure your connection with military-grade encryption. Anonymous. Fast. Unrestricted.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans?.map((plan, i) => {
          const isPopular = i === 1; // Middle plan usually popular
          return (
            <div 
              key={plan.id} 
              className={`
                relative flex flex-col bg-card rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2
                ${isPopular 
                  ? 'border-2 border-secondary shadow-[0_0_30px_rgba(123,47,255,0.15)] scale-105 z-10' 
                  : 'neon-border border border-primary/20 mt-4 lg:mt-0'}
              `}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(123,47,255,0.5)]">
                  Most Popular
                </div>
              )}
              
              <div className="mb-6">
                <h3 className={`text-2xl font-bold mb-2 ${isPopular ? 'text-secondary' : 'text-primary'}`}>{plan.name}</h3>
                <p className="text-muted-foreground text-sm font-mono">{plan.durationDays} Days Access</p>
              </div>

              <div className="mb-8 space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground">₽{plan.priceRub}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground font-mono text-sm">
                  <Bitcoin className="w-4 h-4" />
                  <span>~ {plan.priceCrypto} {plan.cryptoCurrency}</span>
                </div>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                <div className="flex items-center gap-3">
                  <Cpu className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">Up to {plan.maxDevices} Devices</span>
                </div>
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mt-auto">
                <button
                  onClick={() => handlePayment(plan.id, 'crypto')}
                  className={`w-full py-3 rounded-md font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all
                    ${isPopular 
                      ? 'bg-secondary hover:bg-secondary/90 text-white shadow-[0_0_15px_rgba(123,47,255,0.4)]' 
                      : 'neon-button text-primary-foreground'}`}
                >
                  <Bitcoin className="w-5 h-5" />
                  Pay with Crypto
                </button>
                <button
                  onClick={() => handlePayment(plan.id, 'sbp')}
                  className="w-full py-3 rounded-md font-bold uppercase tracking-wider flex items-center justify-center gap-2 bg-transparent border border-muted-foreground/30 text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Wallet className="w-5 h-5" />
                  Pay with СБП
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
