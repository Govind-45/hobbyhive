export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  created_at?: string;
}

export interface Post {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
}

export interface Like {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface CommentWithAuthor extends Comment {
  author: Profile;
}

export interface PostWithDetails extends Post {
  author: Profile;
  category?: Category | null;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
}

export type SortMode = 'latest' | 'popular' | 'discussed';
