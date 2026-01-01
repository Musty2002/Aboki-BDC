# Aboki BDC - Currency Exchange Rate App

A comprehensive mobile-first currency exchange rate application for Nigerian Bureau de Change (BDC) operators and users.

## Features

- **Live BDC Rates**: Real-time exchange rates from multiple BDC branches across Nigeria
- **CBN Rates**: Official Central Bank of Nigeria exchange rates
- **Currency Converter**: Quick and easy currency conversion tool
- **News Feed**: Latest financial news from multiple sources (MediaStack, NewsAPI, AmeerAI)
- **Rate Alerts**: Set custom alerts for target exchange rates
- **Push Notifications**: Real-time notifications for rate changes
- **Admin Dashboard**: Manage branches, rates, cities, and currencies

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Edge Functions, Auth)
- **Mobile**: Capacitor (iOS & Android support)

## Getting Started

### Prerequisites

- Node.js 18+ & npm
- Git

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd aboki-bdc

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

## Mobile Development

### iOS

```bash
npx cap add ios
npx cap sync
npx cap open ios
```

### Android

```bash
npx cap add android
npx cap sync
npx cap open android
```

## Project Structure

```
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom React hooks
│   ├── integrations/   # Supabase client
│   └── data/           # Static data
├── supabase/
│   ├── functions/      # Edge functions
│   └── config.toml     # Supabase config
└── public/             # Static assets
```

## Admin Access

1. Navigate to `/admin/setup` for initial setup
2. Enter the setup key (contact administrator)
3. Create your admin account
4. Access dashboard at `/admin`

## API Integrations

- **MediaStack**: Financial news
- **NewsAPI.org**: Global news coverage
- **AmeerAI**: AI-powered news aggregation

## License

MIT License - see LICENSE file for details
