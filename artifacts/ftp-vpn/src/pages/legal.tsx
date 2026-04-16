import { useState } from "react";
import { Link } from "wouter";
import { Shield } from "lucide-react";

const TABS = [
  { id: "offer", label: "Оферта" },
  { id: "privacy", label: "Конфиденциальность" },
];

export default function Legal() {
  const [activeTab, setActiveTab] = useState("offer");

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center gap-4 px-6 py-4"
           style={{background:"rgba(10,10,15,0.92)", backdropFilter:"blur(16px)", borderBottom:"1px solid rgba(0,212,255,0.1)"}}>
        <Link href="/" className="flex items-center gap-3 mr-auto text-foreground hover:text-primary transition-colors">
          <img src="/logo.jpg" alt="FTPVPN" className="w-8 h-8 rounded-lg" />
          <span className="font-bold gradient-text">FTPVPN</span>
        </Link>
        <div className="hidden md:flex items-center gap-5">
          <Link href="/guide" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Инструкция</Link>
          <Link href="/legal" className="text-sm font-medium text-primary transition-colors">Оферта</Link>
          <a href="https://t.me/ftpvpn_support" target="_blank" rel="noopener"
             className="text-sm text-muted-foreground hover:text-foreground transition-colors">Поддержка</a>
        </div>
        <Link href="/dashboard"
          className="px-4 py-2 rounded-full text-sm font-bold transition-all"
          style={{background:"linear-gradient(135deg,#00d4ff,#8b5cf6)", color:"#0a0a0f"}}>
          Кабинет
        </Link>
      </nav>

      <div className="pt-28 pb-20 max-w-2xl mx-auto px-4">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-6 py-2 rounded-full text-sm font-medium transition-all"
              style={activeTab === tab.id ? {
                background:"rgba(0,212,255,0.12)",
                border:"1px solid rgba(0,212,255,0.3)",
                color:"#00d4ff"
              } : {
                background:"rgba(22,22,42,0.8)",
                border:"1px solid rgba(0,212,255,0.1)",
                color:"#8888aa"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "offer" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Публичная оферта</h1>
              <p className="text-sm text-muted-foreground">Дата вступления в силу: 12 апреля 2026 г. · ftpvpn.lol</p>
            </div>

            {[
              {
                title: "1. Общие положения",
                content: "Настоящий документ является публичной офертой сервиса FTPVPN на заключение договора об оказании услуг доступа к VPN-сервису. Оплата услуги означает полное и безоговорочное принятие (акцепт) настоящей оферты в соответствии со ст. 438 ГК РФ."
              },
              {
                title: "2. Предмет договора",
                content: "Исполнитель предоставляет Пользователю доступ к VPN-сервису FTPVPN, обеспечивающему шифрование интернет-трафика и изменение IP-адреса, на выбранный тарифный период."
              },
              {
                title: "3. Порядок оказания услуг",
                items: [
                  "После оплаты Пользователь получает данные для подключения автоматически через личный кабинет.",
                  "Услуга считается оказанной с момента предоставления доступа к сервису.",
                  "Плановые технические работы могут временно ограничивать доступ.",
                ]
              },
              {
                title: "4. Стоимость и оплата",
                content: "Стоимость определяется тарифами на ftpvpn.lol. Оплата: СБП или CryptoBot (USDT).",
                highlight: "Возврат средств — по обращению в поддержку в течение 24 часов с момента оплаты при условии, что услуга не была использована."
              },
              {
                title: "5. Права и обязанности",
                items: [
                  "Использовать сервис исключительно в законных целях.",
                  "Не передавать данные доступа третьим лицам.",
                  "Не предпринимать попыток взлома инфраструктуры.",
                ]
              },
              {
                title: "6. Контакты",
                content: null,
                contact: true
              },
            ].map((section, i) => (
              <div key={i} className="rounded-2xl p-6"
                   style={{background:"rgba(22,22,42,0.8)", border:"1px solid rgba(0,212,255,0.08)"}}>
                <h2 className="text-lg font-bold text-foreground mb-3">{section.title}</h2>
                {section.content && <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>}
                {section.highlight && (
                  <div className="mt-3 p-3 rounded-xl text-sm"
                       style={{background:"rgba(0,212,255,0.06)", border:"1px solid rgba(0,212,255,0.15)", color:"#e8e8f0"}}>
                    {section.highlight}
                  </div>
                )}
                {section.items && (
                  <ul className="space-y-2">
                    {section.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span style={{color:"#00d4ff", marginTop:"2px"}}>·</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                {section.contact && (
                  <a href="https://t.me/ftpvpn_support" target="_blank" rel="noopener"
                     className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                     style={{color:"#00d4ff"}}>
                    <Shield className="w-4 h-4" />
                    Telegram: @ftpvpn_support
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "privacy" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Политика конфиденциальности</h1>
              <p className="text-sm text-muted-foreground">Дата вступления в силу: 12 апреля 2026 г. · ftpvpn.lol</p>
            </div>

            {[
              {
                title: "1. Принцип",
                highlight: "FTPVPN не собирает, не хранит и не передаёт персональные данные. Мы не ведём логи активности, трафика и подключений."
              },
              {
                title: "2. Данные, которые мы не собираем",
                items: [
                  "IP-адреса пользователей",
                  "История посещаемых сайтов и DNS-запросы",
                  "Содержимое передаваемого трафика",
                  "Временные метки подключений",
                ]
              },
              {
                title: "3. Cookie и трекеры",
                content: "Сайт ftpvpn.lol не использует аналитические cookie, рекламные трекеры и иные средства отслеживания."
              },
              {
                title: "4. Контакты",
                contact: true
              },
            ].map((section, i) => (
              <div key={i} className="rounded-2xl p-6"
                   style={{background:"rgba(22,22,42,0.8)", border:"1px solid rgba(0,212,255,0.08)"}}>
                <h2 className="text-lg font-bold text-foreground mb-3">{section.title}</h2>
                {section.highlight && (
                  <div className="p-3 rounded-xl text-sm font-medium"
                       style={{background:"rgba(0,212,255,0.06)", border:"1px solid rgba(0,212,255,0.15)", color:"#00d4ff"}}>
                    {section.highlight}
                  </div>
                )}
                {section.content && <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>}
                {section.items && (
                  <ul className="space-y-2">
                    {section.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span style={{color:"#00d4ff", marginTop:"2px"}}>·</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                {section.contact && (
                  <a href="https://t.me/ftpvpn_support" target="_blank" rel="noopener"
                     className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                     style={{color:"#00d4ff"}}>
                    <Shield className="w-4 h-4" />
                    Telegram: @ftpvpn_support
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t py-8 px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground"
              style={{borderColor:"rgba(0,212,255,0.08)"}}>
        <Link href="/" className="flex items-center gap-2 text-foreground">
          <img src="/logo.jpg" alt="FTPVPN" className="w-6 h-6 rounded-md" />
          <span className="font-bold gradient-text">FTPVPN</span>
        </Link>
        <div className="flex gap-6">
          <a href="https://t.me/ftpvpn_support" target="_blank" rel="noopener" className="hover:text-foreground transition-colors">Поддержка</a>
          <Link href="/plans" className="hover:text-foreground transition-colors">Тарифы</Link>
          <Link href="/guide" className="hover:text-foreground transition-colors">Инструкция</Link>
          <Link href="/dashboard" className="hover:text-foreground transition-colors">Кабинет</Link>
        </div>
        <span>© 2026 FTPVPN</span>
      </footer>
    </div>
  );
}
