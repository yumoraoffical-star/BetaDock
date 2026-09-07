# 🚀 BetaDock

> **Next-Gen AI Product Launch & Directory Marketplace**  
> *"Submit once. Launch everywhere."*

BetaDock is an all-in-one product discovery marketplace and AI-powered launch command center built for founders, indie hackers, and builders.

---

## ✨ Features

- 🌟 **Dual-Pillar Architecture**:
  - **Pillar 1: Discover** — Live Daily Dock Race leaderboard, curated collections, first 10 beta testers program, and founder deals.
  - **Pillar 2: Launch Studio** — 5-stage AI launch engine (Intelligence, Strategy, Multi-Channel Campaign Generation, Asset Studio, Launch Command Center).
- 🤖 **Secure Serverless AI**: Integrated Google Gemini 3.6 Flash backend with 100% hidden keys (`/api/analyze`).
- 📲 **Telegram Mobile Alerts**: Instant real-time alerts dispatched to Telegram (`/api/notify`) when a product is submitted.
- ⚡ **Zero Framework Overhead**: Fast, lightweight, pure vanilla HTML/CSS/JavaScript with zero build step required.
- ☁️ **Serverless Ready**: Fully configured for Vercel, Netlify, or Node.js hosting.

---

## 🛠️ Local Development

```bash
# 1. Clone the repository
git clone https://github.com/yumoraoffical-star/BetaDock.git
cd BetaDock

# 2. Configure environment variables
# Copy .env.example to .env and insert your API keys:
# GEMINI_API_KEY=your_key
# TELEGRAM_BOT_TOKEN=your_token
# TELEGRAM_ADMIN_CHAT_ID=your_chat_id

# 3. Start local server
node server.js
```

Visit `http://localhost:4173` in your browser.

---

## 🔒 Security
Sensitive API keys (`GEMINI_API_KEY`, `TELEGRAM_BOT_TOKEN`) are strictly managed through serverless functions and are never exposed to the client. `.env` is ignored in Git.

---

## 📄 License
MIT © 2026 BetaDock
