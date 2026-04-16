import { useGetConfigs, useDeleteConfig, useDownloadConfig, getGetConfigsQueryKey } from "@workspace/api-client-react";
import { Plus, Trash2, Download, Server, Globe, Calendar, ShieldCheck, Activity } from "lucide-react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Configs() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const { data: configs, isLoading } = useGetConfigs({
    query: { queryKey: getGetConfigsQueryKey() }
  });

  const deleteMutation = useDeleteConfig();

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to terminate this node connection?")) return;
    
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetConfigsQueryKey() });
        toast({
          title: "Node Terminated",
          description: "The VPN configuration has been securely deleted.",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to terminate node.",
          variant: "destructive"
        });
      }
    });
  };

  const handleDownload = async (id: number, name: string) => {
    setDownloadingId(id);
    try {
      // Manual fetch for download since Orval hook might have issues with Blob/Text if not typed perfectly
      const token = localStorage.getItem("vpn_access_key");
      const res = await fetch(`/api/configs/${id}/download`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Download failed");
      const data = await res.json();
      
      const blob = new Blob([data.content], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename || `${name}.conf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download Complete",
        description: "Configuration file securely acquired.",
      });
    } catch (err) {
      toast({
        title: "Download Failed",
        description: "Could not retrieve configuration file.",
        variant: "destructive"
      });
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight neon-text">VPN Configs</h1>
          <p className="text-muted-foreground font-mono text-sm tracking-wider uppercase">Active Secure Tunnels</p>
        </div>
        <Link href="/configs/new" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md font-bold uppercase tracking-wider text-primary-foreground neon-button w-full sm:w-auto">
          <Plus className="w-5 h-5" />
          <span>New Node</span>
        </Link>
      </div>

      {!configs?.length ? (
        <div className="bg-card p-12 rounded-xl neon-border text-center flex flex-col items-center justify-center min-h-[400px]">
          <Server className="w-16 h-16 text-muted-foreground/30 mb-6" />
          <h2 className="text-xl font-bold text-foreground mb-2">No Active Nodes</h2>
          <p className="text-muted-foreground max-w-md mb-8">You haven't deployed any secure tunnels yet. Generate your first configuration to establish an encrypted connection.</p>
          <Link href="/configs/new" className="px-6 py-3 rounded-md font-bold uppercase tracking-wider text-primary-foreground neon-button">
            Initialize First Node
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {configs.map((config) => (
            <div key={config.id} className="bg-card p-6 rounded-xl neon-border flex flex-col h-full relative group transition-all hover:-translate-y-1">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-3xl filter drop-shadow-[0_0_8px_rgba(0,212,255,0.4)]">
                    {config.serverFlag}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                      {config.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground mt-1">
                      <Globe className="w-3 h-3" />
                      <span>{config.serverLocation}</span>
                    </div>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${config.isActive ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-muted text-muted-foreground'}`}>
                  {config.isActive ? 'Active' : 'Offline'}
                </div>
              </div>

              <div className="space-y-3 mb-8 flex-1">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-secondary" />
                  <span className="font-mono">Protocol: {config.protocol}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="font-mono">Created: {new Date(config.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border mt-auto">
                <button
                  onClick={() => handleDownload(config.id, config.name)}
                  disabled={downloadingId === config.id}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md font-bold uppercase tracking-wider text-xs text-primary bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-colors shadow-[0_0_10px_rgba(0,212,255,0.1)] hover:shadow-[0_0_15px_rgba(0,212,255,0.2)] disabled:opacity-50"
                >
                  {downloadingId === config.id ? <Activity className="w-4 h-4 animate-pulse" /> : <Download className="w-4 h-4" />}
                  <span>{downloadingId === config.id ? 'Extracting...' : 'Download'}</span>
                </button>
                <button
                  onClick={() => handleDelete(config.id)}
                  disabled={deleteMutation.isPending}
                  className="p-2.5 rounded-md text-destructive bg-destructive/10 border border-destructive/30 hover:bg-destructive/20 transition-colors shadow-[0_0_10px_rgba(255,0,0,0.1)] disabled:opacity-50"
                  title="Terminate Node"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
