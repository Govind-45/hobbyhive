-- ==============================================================================
-- HobbyHive - Supabase Database Schema
-- Complete schema with Row Level Security (RLS), Triggers, and Seed Categories
-- ==============================================================================

-- 1. Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 2. Create PROFILES table (synced with auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  bio text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create CATEGORIES table
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  name text not null,
  description text not null,
  icon text not null default 'folder',
  color text not null default '#f59e0b',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create POSTS table
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  title text not null check (char_length(title) >= 3 and char_length(title) <= 200),
  content text not null check (char_length(content) >= 5),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create COMMENTS table
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null check (char_length(content) >= 1 and char_length(content) <= 3000),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Create LIKES table (Post likes)
create table if not exists public.likes (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (post_id, user_id)
);

-- 7. Add Indexes for High Performance Querying
create index if not exists idx_posts_category_id on public.posts (category_id);
create index if not exists idx_posts_user_id on public.posts (user_id);
create index if not exists idx_posts_created_at on public.posts (created_at desc);
create index if not exists idx_comments_post_id on public.comments (post_id);
create index if not exists idx_comments_user_id on public.comments (user_id);
create index if not exists idx_likes_post_id on public.likes (post_id);
create index if not exists idx_likes_user_id on public.likes (user_id);

-- 8. Functions and Triggers

-- Trigger to automatically handle updated_at timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_profiles_updated on public.profiles;
create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

drop trigger if exists on_posts_updated on public.posts;
create trigger on_posts_updated
  before update on public.posts
  for each row execute procedure public.handle_updated_at();

drop trigger if exists on_comments_updated on public.comments;
create trigger on_comments_updated
  before update on public.comments
  for each row execute procedure public.handle_updated_at();

-- Trigger to automatically create a profile when a new user signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
declare
  raw_user_meta jsonb;
  extracted_username text;
  extracted_name text;
  base_username text;
  final_username text;
  counter int := 0;
begin
  raw_user_meta := new.raw_user_meta_data;
  extracted_name := coalesce(raw_user_meta->>'full_name', raw_user_meta->>'name', split_part(new.email, '@', 1));
  
  -- Build a clean base username from user-supplied name or email prefix
  base_username := coalesce(raw_user_meta->>'username', split_part(new.email, '@', 1));
  -- Strip special characters and lowercase
  base_username := lower(regexp_replace(base_username, '[^a-zA-Z0-9_]', '', 'g'));
  -- Ensure minimum length
  if length(base_username) < 3 then
    base_username := 'hiver_' || substr(new.id::text, 1, 6);
  end if;

  -- Resolve username collisions by appending an incrementing counter
  final_username := base_username;
  loop
    exit when not exists (select 1 from public.profiles where username = final_username);
    counter := counter + 1;
    final_username := base_username || '_' || counter::text;
  end loop;

  insert into public.profiles (id, username, full_name, avatar_url, bio)
  values (
    new.id,
    final_username,
    extracted_name,
    coalesce(raw_user_meta->>'avatar_url', 'https://api.dicebear.com/7.x/bottts/svg?seed=' || new.id::text),
    'Hobbyist & Hive Explorer'
  )
  on conflict (id) do update set
    username = excluded.username,
    full_name = excluded.full_name,
    updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 9. Enable Row Level Security (RLS) on all tables
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;

-- 10. Row Level Security Policies

-- PROFILES Policies
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- CATEGORIES Policies
drop policy if exists "Categories are viewable by everyone" on public.categories;
create policy "Categories are viewable by everyone"
  on public.categories for select
  using (true);

-- POSTS Policies
-- Anyone can view posts
drop policy if exists "Posts are viewable by everyone" on public.posts;
create policy "Posts are viewable by everyone"
  on public.posts for select
  using (true);

-- Only authenticated users can create posts
drop policy if exists "Authenticated users can create posts" on public.posts;
create policy "Authenticated users can create posts"
  on public.posts for insert
  with check (auth.uid() = user_id);

-- Authors can update their own posts
drop policy if exists "Authors can update their own posts" on public.posts;
create policy "Authors can update their own posts"
  on public.posts for update
  using (auth.uid() = user_id);

-- Authors can delete their own posts
drop policy if exists "Authors can delete their own posts" on public.posts;
create policy "Authors can delete their own posts"
  on public.posts for delete
  using (auth.uid() = user_id);

-- COMMENTS Policies
-- Anyone can view comments
drop policy if exists "Comments are viewable by everyone" on public.comments;
create policy "Comments are viewable by everyone"
  on public.comments for select
  using (true);

-- Authenticated users can create comments
drop policy if exists "Authenticated users can create comments" on public.comments;
create policy "Authenticated users can create comments"
  on public.comments for insert
  with check (auth.uid() = user_id);

-- Authors can update their own comments
drop policy if exists "Authors can update their own comments" on public.comments;
create policy "Authors can update their own comments"
  on public.comments for update
  using (auth.uid() = user_id);

-- Authors can delete their own comments
drop policy if exists "Authors can delete their own comments" on public.comments;
create policy "Authors can delete their own comments"
  on public.comments for delete
  using (auth.uid() = user_id);

-- LIKES Policies
-- Anyone can view likes
drop policy if exists "Likes are viewable by everyone" on public.likes;
create policy "Likes are viewable by everyone"
  on public.likes for select
  using (true);

-- Authenticated users can insert their own like
drop policy if exists "Authenticated users can like a post" on public.likes;
create policy "Authenticated users can like a post"
  on public.likes for insert
  with check (auth.uid() = user_id);

-- Users can remove only their own likes
drop policy if exists "Users can unlike a post" on public.likes;
create policy "Users can unlike a post"
  on public.likes for delete
  using (auth.uid() = user_id);

-- 11. Seed Initial Categories
insert into public.categories (slug, name, description, icon, color) values
  ('books', 'Books & Literature', 'Book reviews, reading challenges, author spotlights, and fiction discussions.', 'BookOpen', '#d97706'),
  ('gaming', 'Gaming & Esports', 'PC, console, retro gaming, indie titles, game tips, and community reviews.', 'Gamepad2', '#ea580c'),
  ('music', 'Music & Production', 'Gear setups, favorite albums, songwriting, instrument tips, and playlists.', 'Music', '#0284c7'),
  ('photography', 'Photography & Gear', 'Camera techniques, lighting setups, gear reviews, and creative photo shoots.', 'Camera', '#059669'),
  ('fitness', 'Fitness & Wellness', 'Workout routines, running milestones, nutrition, and healthy living habits.', 'Dumbbell', '#16a34a'),
  ('cooking', 'Cooking & Baking', 'Delicious recipes, baking secrets, culinary techniques, and food plating.', 'UtensilsCrossed', '#e11d48'),
  ('art', 'Art & Illustration', 'Digital painting, watercolor, sketchbooks, character design, and critique.', 'Palette', '#9333ea'),
  ('gardening', 'Gardening & Plants', 'Houseplant care, vegetable gardens, composting, and botanical tips.', 'Sprout', '#15803d'),
  ('tech', 'Tech & Coding', 'Personal coding projects, mechanical keyboards, homelabs, and open source.', 'Code2', '#2563eb'),
  ('crafts', 'DIY & Handcrafts', 'Woodworking, knitting, origami, leathercraft, and homemade goods.', 'Hammer', '#b45309')
on conflict (slug) do nothing;
