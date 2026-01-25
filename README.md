# Submitly ⚡

**Submit On Time** - Your purpose-built application tracker for managing high-stakes deadlines.

## Features

- 📋 **Application Tracking** - Track college admissions, job applications, scholarships, and exams
- ⏰ **Smart Deadlines** - Priority-based sorting with urgency indicators
- ✅ **Step Management** - Break down applications into manageable steps
- 📎 **Links & Notes** - Add relevant links and notes to each step
- 🔄 **Cloud Sync** - Data syncs across devices with Supabase
- 🔐 **GitHub Auth** - Secure login with GitHub or email

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Backend**: Supabase (Auth + PostgreSQL)
- **State**: Zustand with localStorage persistence

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

## Deploy

Deploy to Netlify or Vercel with one click. Make sure to add the environment variables.

## Author

**Himanshu Prajapati**
- GitHub: [@HimanshuPrajapati-13](https://github.com/HimanshuPrajapati-13)
- LinkedIn: [Himanshu Prajapati](https://www.linkedin.com/in/himanshu-prajapati-728aa0201/)

## License

MIT
