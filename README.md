# RetailPOS - Modern Point of Sale System

RetailPOS is a premium, high-performance Point of Sale application designed for modern retail businesses. Built with a focus on speed, aesthetics, and data integrity, it provides a seamless experience for managing sales, inventory, and customers.

## ✨ Features

- **Dynamic POS Interface**: Fast search, category filtering, and a glassmorphic checkout experience.
- **Inventory Management**: Full CRUD for products and categories with image support and stock tracking.
- **Customer CRM**: Manage customer profiles, track purchase history, and visits.
- **Real-time Analytics**: Interactive dashboards with revenue trends and category performance metrics.
- **Premium UI/UX**: Custom Shadcn confirm dialogs, toast notifications, and smooth micro-animations.
- **Multi-Tenancy**: Secure data scoping using Supabase Row-Level Security (RLS).

## 🚀 Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: Tailwind CSS
- **Components**: [Shadcn UI](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Icons**: Lucide React

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- Supabase Project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/PyaePhyoeAungppa/retail-master.git
   cd retail-master
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## 🏗️ Deployment

The project is optimized for deployment on the [Vercel Platform](https://vercel.com/new). Make sure to configure the same environment variables in your Vercel project settings.

## 📄 License

This project is private and intended for use by [PyaePhyoeAungppa].
