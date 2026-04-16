import { useState } from "react";
import { useLocation } from "wouter";
import { useGenerateConfig } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Globe, Cpu, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

const LOCATIONS = [
  { id: "nl-amsterdam", name: "Amsterdam, NL", flag: "🇳🇱", latency: "12ms" },
  { id: "de-frankfurt", name: "Frankfurt, DE", flag: "🇩🇪", latency: "18ms" },
  { id: "us-newyork", name: "New York, US", flag: "🇺🇸", latency: "85ms" },
  { id: "sg-singapore", name: "Singapore, SG", flag: "🇸🇬", latency: "160ms" },
  { id: "jp-tokyo", name: "Tokyo, JP", flag: "🇯🇵", latency: "145ms" },
  { id: "ch-zurich", name: "Zurich, CH", flag: "🇨🇭", latency: "22ms" },
];

export default function ConfigsNew() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [name, setName] = useState("");
  const [serverLocation, setServerLocation] = useState(LOCATIONS[0].id);
  
  const generateMutation = useGenerateConfig();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Required Field", description: "Please enter a node identifier.", variant: "destructive" });
      return;
    }

    generateMutation.mutate({ data: { name, serverLocation } }, {
      onSuccess: () => {
        toast({ title: "Node Deployed", description: "Secure tunnel configuration generated successfully." });
        queryClient.invalidateQueries();
        setLocation("/configs");
      },
      onError: () => {
        toast({ title: "Deployment Failed", description: "An error occurred while generating the configuration.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/configs" className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight neon-text">Deploy Node</h1>
          <p className="text-muted-foreground font-mono text-sm tracking-wider uppercase">Initialize new secure tunnel</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-card p-8 rounded-xl neon-border">
        <div className="space-y-3">
          <label className="text-xs font-mono text-primary uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4" /> Node Identifier
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mobile Device, Work Laptop"
            className="w-full bg-input border border-border rounded-md py-3 px-4 font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all neon-input"
            maxLength={32}
          />
        </div>

        <div className="space-y-4">
          <label className="text-xs font-mono text-primary uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4" /> Server Location
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LOCATIONS.map((loc) => (
              <div 
                key={loc.id}
                onClick={() => setServerLocation(loc.id)}
                className={`
                  p-4 rounded-lg border cursor-pointer transition-all flex items-center justify-between
                  ${serverLocation === loc.id 
                    ? 'border-primary bg-primary/10 shadow-[inset_0_0_15px_rgba(0,212,255,0.15)]' 
                    : 'border-border bg-background hover:border-primary/50 hover:bg-primary/5'}
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl filter drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">{loc.flag}</span>
                  <span className={`font-bold ${serverLocation === loc.id ? 'text-primary' : 'text-foreground'}`}>
                    {loc.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">{loc.latency}</span>
                  <div className={`w-2 h-2 rounded-full ${serverLocation === loc.id ? 'bg-primary shadow-[0_0_8px_rgba(0,212,255,0.8)] animate-pulse' : 'bg-muted-foreground/30'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-border">
          <button
            type="submit"
            disabled={generateMutation.isPending || !name.trim()}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-md font-bold uppercase tracking-widest text-primary-foreground neon-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generateMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Initialize Deployment"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
