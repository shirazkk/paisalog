# PaisaLog

PaisaLog is a financial tracking application designed to help users manage their household expenses efficiently, promoting transparency and collaborative financial management.

## 🚀 Features

- **Dashboard:** Get a real-time, high-level overview of your household spending habits.
- **Transaction Logging:** Quickly and securely log daily expenses with detailed categorization.
- **Transaction History:** Access and filter your past expenses for better financial planning.
- **Household Management:** Create or join households to track shared expenses collaboratively.
- **Real-time Synchronization:** Stay in sync with all household members instantly.

## 🏗️ Architecture

PaisaLog follows a modern web stack:

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS.
- **Backend/Database:** Supabase (PostgreSQL with Row Level Security).
- **Authentication:** Supabase Auth.
- **State Management:** React hooks for efficient real-time data handling.

## ⚙️ Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Supabase](https://supabase.com/) account

## 🛠️ Getting Started

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd paisa-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   Copy `.env.example` to `.env.local` and fill in your Supabase credentials.
   ```bash
   cp .env.example .env.local
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser.

## 🚀 Deployment

This application is ready to be deployed on platforms like **Vercel** or **Netlify**. Ensure all environment variables are correctly configured in your production dashboard.

## 📁 Project Structure

- `docs/`: Product and technical documentation.
- `migrations/`: Database SQL scripts.
- `paisa-app/`: Main Next.js application codebase.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ⚖️ License

This project is proprietary.
