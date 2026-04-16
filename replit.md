# FTP VPN — Анонимный VPN-сервис

## Overview

Полноценный VPN-сервис с личным кабинетом, автовыдачей конфигов AmnesiaWG (WireGuard), оплатой через CryptoBot и СБП. Максимальная анонимность — вход только по сгенерированному ключу (без email, имён, телефонов).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/vpn-dashboard)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec via custom JS loader)
- **Build**: esbuild (CJS bundle)
- **UI**: shadcn/ui + Tailwind + cyberpunk neon theme

## Features

- **Anonymous auth**: Access key login (XXXX-XXXX-XXXX-XXXX), no personal data
- **VPN Configs**: Auto-generate AmnesiaWG/WireGuard configs for multiple server locations
- **Subscription plans**: Monthly/quarterly/semi-annual plans
- **Payment via CryptoBot**: USDT payment via Telegram CryptoBot
- **Payment via СБП**: Russian fast payment system (QR code)
- **Dashboard**: Stats overview, subscription status, days remaining
- **Dark cyberpunk UI**: Neon cyan-to-purple gradient, glowing elements

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/vpn-dashboard run dev` — run frontend locally

## Database Schema

- `users` — anonymous users with access keys
- `sessions` — auth tokens (30 days TTL)
- `subscription_plans` — available VPN plans
- `subscriptions` — user subscriptions
- `vpn_configs` — WireGuard config records per user
- `payments` — payment records (crypto + СБП)

## API Routes

- `POST /api/auth/login` — login with access key
- `POST /api/auth/logout` — logout
- `GET /api/auth/me` — current user info
- `GET /api/subscriptions/plans` — list plans
- `GET /api/subscriptions/current` — current subscription
- `GET/POST /api/configs` — list/generate VPN configs
- `GET/DELETE /api/configs/:id` — get/delete config
- `GET /api/configs/:id/download` — download .conf file
- `POST /api/payments/crypto/create` — create CryptoBot invoice
- `POST /api/payments/sbp/create` — create СБП payment
- `GET /api/payments/status/:id` — check payment status
- `GET /api/user/stats` — user dashboard stats

## Demo Access

Access key: `DEMO-TEST-USER-0001`

## Codegen Notes

Orval has a quirk with TypeScript config files. The codegen uses `orval-run2.mjs` (custom Node.js script in lib/api-spec/) that directly calls the Orval JS API with an absolute path to openapi.yaml.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
