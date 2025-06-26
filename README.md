# SnapVote - Instant Polls & Real-time Voting

A beautiful, modern voting application built with Next.js, TypeScript, Tailwind CSS, and Supabase for real-time functionality.

## Features

- 🚀 **Instant Poll Creation** - Create polls with custom questions and multiple options
- ⚡ **Real-time Results** - Watch votes come in live with real-time updates
- 🎨 **Beautiful UI** - Modern, responsive design with dark mode support
- 📱 **Mobile Friendly** - Optimized for all devices
- 🔒 **Secure** - Built with Supabase for reliable data storage
- 🎯 **Simple & Fast** - No registration required, just create and share

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL + Real-time subscriptions)
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase project with database tables set up

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd SnapVote
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up your Supabase database:
   - Run the SQL commands from `setup-database.sql` in your Supabase SQL Editor

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creating a Poll

1. Visit the homepage
2. Enter your question
3. Add poll options (minimum 2, maximum unlimited)
4. Click "Create Poll"
5. Share the generated link with others

### Voting

1. Open a poll link
2. Click "Vote" on your preferred option
3. Watch real-time results update
4. Share the poll with others

## Project Structure

```
SnapVote/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   ├── loading.tsx          # Loading component
│   ├── not-found.tsx        # 404 page
│   ├── page.tsx             # Homepage (poll creation)
│   └── poll/
│       └── [id]/
│           ├── page.tsx     # Poll page wrapper
│           └── PollClient.tsx # Poll voting component
├── lib/
│   └── supabaseClient.ts    # Supabase client configuration
├── public/                  # Static assets
└── package.json
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your own purposes!

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js and Supabase
