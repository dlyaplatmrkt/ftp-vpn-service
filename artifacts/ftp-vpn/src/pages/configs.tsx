import { Layout } from "@/components/layout";
import { useGetConfigs } from "@workspace/api-client-react";
import { customFetch } from "@workspace/api-client-react";
import type { ConfigDownload } from "@workspace/api-client-react";
import { HardDrive, Download, Activity, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const FLAG_EMOJI: Record<string, string> = {
  NL: "🇳🇱", DE: "🇩🇪", FI: "🇫🇮", FR: "🇫🇷", US: "🇺🇸"
};

const LOC_NAME: Record<string, string> = {
  NL: "Нидерланды", DE: "Германия", FI: "Финляндия", FR: "Франция", US: "США"
};

const downloadFile = async (location: string) => {
  return customFetch<ConfigDownload>(`/api/configs/${location}/download`, { method: "GET" });
};

export default function Configs() {
  const { data: configsData, isLoading } = useGetConfigs({ query: { queryKey: ["/api/configs"] } });
  const { toast } = useToast();
  const [downloadingLoc, setDownloadingLoc] = useState<string | null>(null);

  const handleDownload = async (location: string) => {
    try {
      setDownloadingLoc(location);
      const data = await downloadFile(location);
      const blob = new Blob([data.content], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: "Готово", description: `Конфигурация для ${LOC_NAME[location] || location} скачана.` });
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Не удалось скачать конфигурацию.";
      toast({ title: "Ошибка", description: msg, variant: "destructive" });
    } finally {
      setDownloadingLoc(null);
    }
  };

  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">

        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Конфигурации</h1>
          <p className="text-sm text-muted-foreground">Скачайте WireGuard-конфиг для нужной страны и импортируйте в AmneziaVPN</p>
        </div>

        {/* Info box */}
        <div className="rounded-xl p-4 text-sm"
             style={{background:"rgba(0,212,255,0.06)", border:"1px solid rgba(0,212,255,0.15)"}}>
          <strong style={{color:"#00d4ff"}}>Как использовать:</strong>{" "}
          Скачайте .conf файл, откройте AmneziaVPN (или WireGuard) и нажмите «Импорт из файла».
          Подробнее — в{" "}
          <a href="/guide" className="underline underline-offset-2 hover:text-primary transition-colors">инструкции</a>.
        </div>

        {isLoading ? (
          <div className="flex justify-center p-16">
            <Activity className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {configsData?.configs?.map((config) => {
              const available = config.status === "available";
              return (
                <div
                  key={config.location}
                  className="rounded-2xl p-5 flex items-center justify-between gap-4 transition-all"
                  style={{
                    background:"rgba(22,22,42,0.8)",
                    border: available ? "1px solid rgba(0,212,255,0.12)" : "1px solid rgba(136,136,170,0.12)"
                  }}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{FLAG_EMOJI[config.location] || "🌐"}</span>
                    <div>
                      <div className="font-semibold text-foreground">
                        {LOC_NAME[config.location] || config.locationName}
                        <span className="ml-2 text-xs font-mono text-muted-foreground">{config.location}</span>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <HardDrive className="w-3 h-3" />
                          {config.server}
                        </span>
                        <span className="flex items-center gap-1" style={{color: available ? "#00d4ff" : "#8888aa"}}>
                          <span className="inline-block w-1.5 h-1.5 rounded-full"
                                style={{background: available ? "#00d4ff" : "#8888aa"}} />
                          {available ? "Доступен" : "Недоступен"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload(config.location)}
                    disabled={!available || downloadingLoc === config.location}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={available ? {
                      background:"rgba(0,212,255,0.1)",
                      border:"1px solid rgba(0,212,255,0.25)",
                      color:"#00d4ff"
                    } : {
                      background:"rgba(136,136,170,0.08)",
                      border:"1px solid rgba(136,136,170,0.15)",
                      color:"#8888aa"
                    }}
                  >
                    {downloadingLoc === config.location
                      ? <Activity className="w-4 h-4 animate-spin" />
                      : <Download className="w-4 h-4" />
                    }
                    Скачать
                  </button>
                </div>
              );
            })}

            {(!configsData?.configs || configsData.configs.length === 0) && (
              <div className="text-center p-16 rounded-2xl text-muted-foreground"
                   style={{border:"1px dashed rgba(136,136,170,0.2)"}}>
                <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <p>Нет доступных серверов. Оформите подписку.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
