# 🐝 HobbyHive — Community Discussion Forum

> A warm, modern, beginner-friendly community discussion forum where people connect, share projects, and exchange advice over shared hobbies.

![HobbyHive Banner](https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&auto=format&fit=crop&q=80)

---

## 🌟 Overview & Highlights

**HobbyHive** is designed to bring back the golden age of internet forums — authentic, topic-focused communities without algorithmic outrage or doomscrolling. 

- **10 Dedicated Hobby Hubs:** Books & Literature, Gaming & Esports, Music & Audio, Photography & Gear, Fitness & Health, Cooking & Baking, Art & Illustration, Gardening & Plants, Tech & Maker Projects, and DIY Handcrafts.
- **Zero Passwords:** Modern, secure authentication with Supabase Email One-Time Password (OTP).
- **Instant Demo Mode:** Ready to run and demo immediately out of the box with realistic mock discussions even before plugging in Supabase credentials!
- **Production-Ready Backend:** Complete PostgreSQL schema with automated profile triggers, foreign key cascades, high-performance indexes, and strict Row Level Security (RLS) policies.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool & Bundler** | [Vite 6](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS v3](https://tailwindcss.com/) with Warm Amber & Stone Palette |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL + Auth Email OTP + Row Level Security) |
| **Deployment Target** | [Vercel](https://vercel.com/) |

---

## 🎯 Core Features Implemented

1. **Polished Landing Experience:** Welcoming hero section with value propositions, quick stats, and instant category filters.
2. **Passwordless Email OTP Authentication:** Step 1 email input, Step 2 6-digit OTP code input, countdown resend timer, user profiles with auto-generated avatars.
3. **Interactive Home Feed:** Real-time post feed with sorting by **Latest**, **Most Liked**, and **Most Discussed**.
4. **Hobby Categories:** Books, Gaming, Music, Photography, Fitness, Cooking, Art, Gardening, and Tech with dedicated badge colors and icons.
5. **Create Discussions:** Modal with category selector, title length validation (3–200 chars), multiline content area, and posting tips.
6. **Detailed Post View & Comments:** Dedicated view with full post body, comment threads, comment submission form, author deletion controls, and shareable deep-links (`?post=<id>`).
7. **Likes & Reactions:** Optimistic like/unlike toggle with animated feedback and live counters.
8. **Live Search & Category Filtering:** Instant search by post title, body text, or author username combined with category pills.
9. **My Activity & Profile View:** Dedicated modal showing user profile, editable bio and display name, and tabbed lists of "My Discussions" and "Liked Posts".
10. **Fully Responsive Design:** Clean, mobile-friendly navigation with responsive drawer, bottom actions, and desktop sidebar.

---

## 📁 Project Structure

```
hobbyhive/
├── supabase/
│   └── schema.sql            # Complete PostgreSQL schema, triggers, and RLS policies
├── src/
│   ├── components/
│   │   ├── AuthModal.tsx       # Email OTP code entry and authentication dialog
│   │   ├── CategoryBar.tsx     # Horizontal category filter pill bar
│   │   ├── CategoryIcon.tsx    # Dynamic Lucide icon mapper for hobby hubs
│   │   ├── CreatePostModal.tsx # New post dialog with category selection & validation
│   │   ├── LandingHero.tsx     # Welcoming community introduction banner
│   │   ├── Navbar.tsx          # Top navigation, global search, and user menu
│   │   ├── PostCard.tsx        # Post card with author, tags, likes, and comments
│   │   ├── PostDetailModal.tsx # Full post reader & comment conversation thread
│   │   ├── PostFeed.tsx        # Feed controller with sort tabs, skeleton, and empty states
│   │   ├── ProfileModal.tsx    # "My Activity" view (My Posts, Liked Posts, edit bio)
│   │   ├── SetupModal.tsx      # In-app interactive Supabase configuration helper
│   │   └── Sidebar.tsx         # Desktop sidebar with community rules & stats
│   ├── context/
│   │   └── AuthContext.tsx     # Supabase Auth provider with Email OTP and demo fallbacks
│   ├── lib/
│   │   ├── mockData.ts         # High-fidelity initial seed discussions and authors
│   │   ├── supabase.ts         # Supabase client initialization & connection checks
│   │   ├── timeAgo.ts          # Human-readable relative timestamp formatter
│   │   └── utils.ts            # Tailwind class merger
│   ├── services/
│   │   └── postsService.ts     # Unified CRUD service supporting Supabase & demo fallback
│   ├── types/
│   │   └── database.ts         # TypeScript interfaces for database models
│   ├── App.tsx                 # Root component orchestrating layout and modals
│   ├── index.css               # Tailwind directives and custom scrollbars
│   ├── main.tsx                # App entry point
│   └── vite-env.d.ts           # Environment variable TypeScript declarations
├── .env.example                # Example environment variables template
├── .gitignore                  # Git ignore rules (node_modules, .env, dist)
├── index.html                  # HTML entry point with Plus Jakarta Sans typography
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/YOUR_USERNAME/hobbyhive.git
cd hobbyhive
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.  
> **Note:** The app starts in **Demo Mode** right away! You can test OTP sign-in, create discussions, write comments, and like posts without any configuration.

---

## 🗄️ Supabase Backend Setup (Connecting Live Database)

To connect your own live Supabase PostgreSQL backend and live Email OTP:

### Step 1: Create a Free Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New Project**, choose an organization, and name your project `hobbyhive`.
3. Set a database password and select the region nearest you.

### Step 2: Run the Database Schema & RLS
1. In your Supabase project dashboard, click on **SQL Editor** in the left sidebar.
2. Click **New Query**.
3. Open the file [`supabase/schema.sql`](./supabase/schema.sql) in this repository, copy its entire contents, and paste them into the SQL Editor.
4. Click **Run** (or press `Ctrl+Enter`).
5. This creates:
   - `profiles`, `categories`, `posts`, `comments`, and `likes` tables.
   - Automatic triggers to create user profile records on OTP sign up.
   - Row Level Security (RLS) policies allowing public reads and restricting edits/deletions to post owners.
   - Pre-seeded hobby categories with custom colors and icons.

### Step 3: Configure Supabase Auth Email OTP
1. In Supabase Dashboard, navigate to **Authentication** -> **Providers** -> **Email**.
2. Ensure **Email** is **Enabled**.
3. (Optional) For testing, you can disable "Confirm email" or adjust the OTP expiration rate limits under **Authentication** -> **Rate Limits**.

### Step 4: Add Environment Variables
1. In your Supabase Dashboard, go to **Project Settings** (gear icon) -> **API**.
2. Copy the **Project URL** and the **anon (public)** key.
3. In your local project root, create a file named `.env`:
   ```bash
   cp .env.example .env
   ```
4. Paste your credentials into `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
5. Restart your development server (`npm run dev`). The status badge in the navbar will switch to **Supabase Live** with a green indicator!

---

## 🔒 Security & Row Level Security (RLS) Policies

All client data access goes through Supabase's PostgreSQL Row Level Security engine:

- **Public Read Access:** Anyone can view categories, posts, comments, and public author profiles.
- **Authenticated Post/Comment Creation:** Only authenticated users can insert posts or comments (`auth.uid() = user_id`).
- **Owner-Only Edits & Deletions:** Users can only update or delete posts and comments they authored.
- **Unique Likes Constraint:** A composite unique key `(post_id, user_id)` guarantees a user can like a post only once, and users can only remove their own likes.
- **Browser Safe:** Frontend uses strictly the public `anon` publishable key. Never expose the `service_role` key!

---

## 🌐 Deploying to Vercel

The application is optimized for zero-configuration frontend deployment on [Vercel](https://vercel.com/):

### Option A: Deploy via Vercel Web Dashboard (Recommended)

1. Push your repository to GitHub (see instructions below).
2. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
3. Click **Add New...** -> **Project**.
4. Select your `hobbyhive` repository and click **Import**.
5. In the **Environment Variables** section, add:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
6. Click **Deploy**. Vercel will automatically build Vite and deploy your site to a global CDN with free SSL!

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# Log in and deploy
vercel

# For production deployment with environment variables:
vercel --prod
```

---

## 📦 Pushing to GitHub

Follow these steps in your terminal to initialize and push your project to a new GitHub repository:

```bash
# 1. Initialize Git repository
git init

# 2. Add all files to staging
git add .

# 3. Create your initial commit
git commit -m "Initial commit: HobbyHive community discussion forum"

# 4. Rename default branch to main
git branch -M main

# 5. Link your GitHub remote repository (replace with your GitHub username & repo)
git remote add origin https://github.com/YOUR_USERNAME/hobbyhive.git

# 6. Push code to GitHub
git push -u origin main
```

---

## 📄 License

MIT License. Built for hobbyists and makers worldwide.
