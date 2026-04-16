# FTP VPN Service

## Overview

FTP VPN — приватный VPN-сервис на подписке, продаётся по лицензионным ключам (без email и личных данных).

## Features

- Вход по ключу формата XXXX-XXXX-XXXX-XXXX
- Демо-доступ: ключ `DEMO-TEST-USER-0001`
- Личный кабинет с состоянием подписки, статистикой
- Автовыдача WireGuard/AmnesiaWG конфигов для 5 локаций (NL, DE, FI, FR, US)
- Оплата через CryptoBot (USDT)
- Оплата через СБП (QR-код)
- Тарифы: Старт (30д/199₽), Стандарт (90д/499₽), Про (180д/899₽)

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/ftp-vpn)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (auto-provisioned)
- `CRYPTO_BOT_TOKEN` — CryptoBot API token (for live USDT payments)
- `SBP_PHONE` — Phone number for SBP payments (e.g. `+7 (900) 000-00-00`)
- `SBP_BANK` — Bank name for SBP (e.g. `Тинькофф`)
- `SESSION_SECRET` — Session secret

## Auth

Auth is key-based: user submits license key → stored in `localStorage('ftp_vpn_license_key')` → sent as `x-license-key` header on all API requests.

## Database Schema

- `subscriptions` — license keys with plan/status/expiry
- `payments` — payment invoices (cryptobot/sbp)
