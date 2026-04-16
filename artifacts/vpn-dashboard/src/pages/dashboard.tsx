import { useGetUserStats, useGetCurrentSubscription, getGetUserStatsQueryKey, getGetCurrentSubscriptionQueryKey } from "@workspace/api-client-react";
import { Shield, Activity, Clock, Server, Zap, Globe, Key } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetUserStats({
    query: { queryKey: getGetUserStatsQueryKey() }
  });
  const { data: sub, isLoading: subLoading } = useGetCurrentSubscription({
    query: { queryKey: getGetCurrentSubscriptionQueryKey() }
  });

  const isLoading = statsLoading || subLoading;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const isSubActive = sub?.status === "active";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight neon-text">Dashboard</h1>
        <p className="text-muted-foreground font-mono text-sm tracking-wider uppercase">System Status Overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sub Status */}
        <div className="bg-card p-6 rounded-xl neon-border relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Shield className="w-16 h-16 text-primary" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${isSubActive ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'}`}>
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-sm text-muted-foreground tracking-wider uppercase">Status</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${isSubActive ? 'text-primary drop-shadow-[0_0_8px_rgba(0,212,255,0.5)]' : 'text-destructive drop-shadow-[0_0_8px_rgba(255,0,0,0.5)]'}`}>
              {sub?.status ? sub.status.toUpperCase() : "INACTIVE"}
            </span>
          </div>
        </div>

        {/* Days Left */}
        <div className="bg-card p-6 rounded-xl neon-border relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock className="w-16 h-16 text-secondary" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-secondary/20 text-secondary">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-sm text-muted-foreground tracking-wider uppercase">Time Remaining</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground drop-shadow-md">
              {stats?.daysUntilExpiry ?? 0}
            </span>
            <span className="text-muted-foreground text-sm font-mono">DAYS</span>
          </div>
        </div>

        {/* Active Configs */}
        <div className="bg-card p-6 rounded-xl neon-border relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Server className="w-16 h-16 text-primary" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/20 text-primary">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-sm text-muted-foreground tracking-wider uppercase">Active Nodes</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground drop-shadow-md">
              {stats?.activeConfigs ?? 0}
            </span>
            <span className="text-muted-foreground text-sm font-mono">/ {stats?.totalConfigs ?? 0} TOTAL</span>
          </div>
        </div>

        {/* Current Plan */}
        <div className="bg-card p-6 rounded-xl neon-border relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap className="w-16 h-16 text-secondary" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-secondary/20 text-secondary">
              <Key className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-sm text-muted-foreground tracking-wider uppercase">Clearance Level</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-foreground drop-shadow-md truncate">
              {sub?.planName ?? "FREE TIER"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-card p-8 rounded-xl neon-border flex flex-col justify-between items-start min-h-[200px]">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Globe className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Global Network Access</h2>
            </div>
            <p className="text-muted-foreground max-w-sm mb-6">Deploy a new secure tunnel to one of our worldwide encrypted nodes.</p>
          </div>
          <Link href="/configs/new" className="px-6 py-3 rounded-md font-bold uppercase tracking-wider text-primary-foreground neon-button">
            Deploy New Node
          </Link>
        </div>

        {!isSubActive && (
          <div className="bg-card p-8 rounded-xl border border-secondary/30 shadow-[inset_0_0_20px_rgba(123,47,255,0.1)] flex flex-col justify-between items-start min-h-[200px]">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-6 h-6 text-secondary" />
                <h2 className="text-xl font-bold text-foreground">Upgrade Clearance</h2>
              </div>
              <p className="text-muted-foreground max-w-sm mb-6">Your current access level is limited. Upgrade your plan for unrestricted global bandwidth.</p>
            </div>
            <Link href="/plans" className="px-6 py-3 rounded-md font-bold uppercase tracking-wider text-foreground bg-secondary/20 border border-secondary/50 hover:bg-secondary/30 transition-all shadow-[0_0_15px_rgba(123,47,255,0.3)]">
              View Plans
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
