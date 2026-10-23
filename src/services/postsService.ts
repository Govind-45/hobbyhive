import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Category,
  PostWithDetails,
  CommentWithAuthor,
  SortMode,
  Profile,
} from '../types/database';
import {
  INITIAL_CATEGORIES,
  INITIAL_POSTS,
  INITIAL_COMMENTS,
} from '../lib/mockData';

const LOCAL_STORAGE_POSTS = 'hobbyhive_posts';
const LOCAL_STORAGE_COMMENTS = 'hobbyhive_comments';

// Helper to test if a string is a valid UUID
export function isValidUuid(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

// Local storage helpers
function getDemoPosts(): PostWithDetails[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_POSTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed reading demo posts from storage:', e);
  }
  return INITIAL_POSTS;
}

function saveDemoPosts(posts: PostWithDetails[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_POSTS, JSON.stringify(posts));
  } catch (e) {
    console.warn('Failed saving demo posts to storage:', e);
  }
}

function getDemoComments(): Record<string, CommentWithAuthor[]> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_COMMENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed reading demo comments from storage:', e);
  }
  return INITIAL_COMMENTS;
}

function saveDemoComments(comments: Record<string, CommentWithAuthor[]>) {
  try {
    localStorage.setItem(LOCAL_STORAGE_COMMENTS, JSON.stringify(comments));
  } catch (e) {
    console.warn('Failed saving demo comments to storage:', e);
  }
}

// Cache of categories so we can easily map by id or slug
let cachedCategories: Category[] = [];

// 1. Fetch Categories
export async function fetchCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured) {
    cachedCategories = INITIAL_CATEGORIES;
    return INITIAL_CATEGORIES;
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error || !data || data.length === 0) {
      cachedCategories = INITIAL_CATEGORIES;
      return INITIAL_CATEGORIES;
    }
    cachedCategories = data as Category[];
    return cachedCategories;
  } catch (err) {
    console.error('Failed to fetch categories:', err);
    cachedCategories = INITIAL_CATEGORIES;
    return INITIAL_CATEGORIES;
  }
}

// 2. Fetch Posts (combines Supabase real posts with demo posts for instant active feed)
export async function fetchPosts(options: {
  categorySlug?: string;
  searchQuery?: string;
  sortMode?: SortMode;
  currentUserId?: string;
  authorId?: string;
  likedOnlyByUserId?: string;
}): Promise<PostWithDetails[]> {
  const {
    categorySlug,
    searchQuery,
    sortMode = 'latest',
    currentUserId,
    authorId,
    likedOnlyByUserId,
  } = options;

  let allPosts: PostWithDetails[] = [];

  // Fetch from Supabase if configured
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          user_id,
          category_id,
          title,
          content,
          created_at,
          updated_at,
          author:profiles(id, username, full_name, avatar_url, bio),
          category:categories(id, slug, name, description, icon, color),
          likes(user_id),
          comments(id)
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        interface SupabasePostRaw {
          id: string;
          user_id: string;
          category_id: string | null;
          title: string;
          content: string;
          created_at: string;
          updated_at?: string;
          author: Profile | Profile[] | null;
          category: Category | Category[] | null;
          likes: { user_id: string }[];
          comments: { id: string }[];
        }

        const supaPosts: PostWithDetails[] = (data as unknown as SupabasePostRaw[]).map((p) => {
          const authorObj = Array.isArray(p.author) ? p.author[0] : p.author;
          const categoryObj = Array.isArray(p.category) ? p.category[0] : p.category;
          const likesList = p.likes || [];
          const commentsList = p.comments || [];
          const isLiked = currentUserId ? likesList.some((l) => l.user_id === currentUserId) : false;

          return {
            id: p.id,
            user_id: p.user_id,
            category_id: p.category_id,
            title: p.title,
            content: p.content,
            created_at: p.created_at,
            updated_at: p.updated_at,
            author: authorObj || {
              id: p.user_id,
              username: 'anonymous',
              full_name: 'Hive Member',
              avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${p.user_id}`,
              bio: '',
              created_at: p.created_at,
            },
            category: categoryObj || null,
            likes_count: likesList.length,
            comments_count: commentsList.length,
            is_liked: isLiked,
          };
        });

        allPosts = supaPosts;
      }
    } catch (err) {
      console.warn('Supabase posts query failed, falling back to local posts:', err);
    }
  }

  // Get local/demo posts (contains seed discussions and locally created posts)
  const localPosts = getDemoPosts();

  // If Supabase has zero posts, use the rich demo posts so the app feels active immediately
  if (allPosts.length === 0) {
    allPosts = [...localPosts];
  } else {
    // If Supabase has posts, also include any local demo posts that aren't in Supabase
    const existingIds = new Set(allPosts.map((p) => p.id));
    for (const lp of localPosts) {
      if (!existingIds.has(lp.id)) {
        allPosts.push(lp);
      }
    }
  }

  // Filter by Author
  if (authorId) {
    allPosts = allPosts.filter((p) => p.user_id === authorId);
  }

  // Filter by Liked
  if (likedOnlyByUserId) {
    allPosts = allPosts.filter((p) => p.is_liked);
  }

  // Filter by Category
  if (categorySlug && categorySlug !== 'all') {
    allPosts = allPosts.filter(
      (p) => p.category?.slug.toLowerCase() === categorySlug.toLowerCase()
    );
  }

  // Search Filter
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    allPosts = allPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.category?.name.toLowerCase().includes(q) ||
        p.author.username.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (sortMode === 'popular') {
    allPosts.sort((a, b) => b.likes_count - a.likes_count);
  } else if (sortMode === 'discussed') {
    allPosts.sort((a, b) => b.comments_count - a.comments_count);
  } else {
    // Latest
    allPosts.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  return allPosts;
}

// 3. Create Post
export async function createPost(params: {
  title: string;
  content: string;
  categoryId: string;
  author: Profile;
}): Promise<{ data: PostWithDetails | null; error: Error | null }> {
  const { title, content, categoryId, author } = params;

  // Resolve category object
  const categoriesList = cachedCategories.length > 0 ? cachedCategories : INITIAL_CATEGORIES;
  const matchedCategory =
    categoriesList.find((c) => c.id === categoryId || c.slug === categoryId) || categoriesList[0];

  // Check if we have a real active authenticated Supabase session with a valid UUID
  let realSessionUserId: string | null = null;
  if (isSupabaseConfigured) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && isValidUuid(session.user.id)) {
        realSessionUserId = session.user.id;
      }
    } catch {
      realSessionUserId = null;
    }
  }

  // If user has a real Supabase session AND categoryId is a valid UUID, attempt Supabase insert
  if (realSessionUserId && isValidUuid(matchedCategory.id)) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          title,
          content,
          category_id: matchedCategory.id,
          user_id: realSessionUserId,
        })
        .select(`
          id,
          user_id,
          category_id,
          title,
          content,
          created_at,
          category:categories(id, slug, name, description, icon, color)
        `)
        .single();

      if (!error && data) {
        const newPost: PostWithDetails = {
          id: data.id,
          user_id: data.user_id,
          category_id: data.category_id,
          title: data.title,
          content: data.content,
          created_at: data.created_at,
          author,
          category: Array.isArray(data.category) ? data.category[0] : data.category,
          likes_count: 0,
          comments_count: 0,
          is_liked: false,
        };

        // Cache in local storage too so it is instantly available
        const currentLocal = getDemoPosts();
        saveDemoPosts([newPost, ...currentLocal]);

        return { data: newPost, error: null };
      }
      console.warn('Supabase createPost error, fallback to local save:', error);
    } catch (err) {
      console.warn('Supabase createPost exception, fallback to local save:', err);
    }
  }

  // Fallback / Demo save (works 100% reliably regardless of auth status or rate limits!)
  const newPost: PostWithDetails = {
    id: `post-${Date.now()}`,
    user_id: author.id,
    category_id: matchedCategory.id,
    title,
    content,
    created_at: new Date().toISOString(),
    author,
    category: matchedCategory,
    likes_count: 0,
    comments_count: 0,
    is_liked: false,
  };

  const currentPosts = getDemoPosts();
  saveDemoPosts([newPost, ...currentPosts]);
  return { data: newPost, error: null };
}

// 4. Delete Post
export async function deletePost(postId: string): Promise<{ error: Error | null }> {
  // Always update local storage
  const updated = getDemoPosts().filter((p) => p.id !== postId);
  saveDemoPosts(updated);

  // If it's a real Supabase post, also delete from Supabase
  if (isSupabaseConfigured && isValidUuid(postId)) {
    try {
      await supabase.from('posts').delete().eq('id', postId);
    } catch (err) {
      console.warn('Supabase delete error:', err);
    }
  }

  return { error: null };
}

// 5. Toggle Like
export async function toggleLikePost(
  postId: string,
  userId: string,
  isCurrentlyLiked: boolean
): Promise<{ liked: boolean; error: Error | null }> {
  const nextLiked = !isCurrentlyLiked;

  // Always update local storage first so UI is fast and responsive
  const posts = getDemoPosts();
  const target = posts.find((p) => p.id === postId);
  if (target) {
    target.is_liked = nextLiked;
    target.likes_count = Math.max(0, target.likes_count + (nextLiked ? 1 : -1));
    saveDemoPosts(posts);
  }

  // If real UUIDs & real Supabase session, sync to Supabase
  if (isSupabaseConfigured && isValidUuid(postId) && isValidUuid(userId)) {
    try {
      if (nextLiked) {
        await supabase.from('likes').insert({ post_id: postId, user_id: userId });
      } else {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);
      }
    } catch (err) {
      console.warn('Supabase like sync error:', err);
    }
  }

  return { liked: nextLiked, error: null };
}

// 6. Fetch Comments for a Post
export async function fetchPostComments(postId: string): Promise<CommentWithAuthor[]> {
  const localComments = getDemoComments()[postId] || [];

  if (isSupabaseConfigured && isValidUuid(postId)) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          post_id,
          user_id,
          content,
          created_at,
          author:profiles(id, username, full_name, avatar_url, bio)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        interface SupabaseCommentRaw {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          created_at: string;
          author: Profile | Profile[] | null;
        }

        const supaComments = (data as unknown as SupabaseCommentRaw[]).map((c) => {
          const authorObj = Array.isArray(c.author) ? c.author[0] : c.author;
          return {
            id: c.id,
            post_id: c.post_id,
            user_id: c.user_id,
            content: c.content,
            created_at: c.created_at,
            author: authorObj || {
              id: c.user_id,
              username: 'hive_member',
              full_name: 'Hive Member',
              avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${c.user_id}`,
              bio: '',
              created_at: c.created_at,
            },
          };
        });

        // Merge any local comments not yet in Supabase
        const existingIds = new Set(supaComments.map((c) => c.id));
        const combined = [...supaComments];
        for (const lc of localComments) {
          if (!existingIds.has(lc.id)) combined.push(lc);
        }
        return combined;
      }
    } catch (err) {
      console.warn('Supabase fetch comments error:', err);
    }
  }

  return localComments;
}

// 7. Add Comment
export async function createComment(params: {
  postId: string;
  author: Profile;
  content: string;
}): Promise<{ data: CommentWithAuthor | null; error: Error | null }> {
  const { postId, author, content } = params;

  // Real Supabase insert if valid UUIDs and real session
  if (isSupabaseConfigured && isValidUuid(postId) && isValidUuid(author.id)) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: author.id,
          content,
        })
        .select('id, post_id, user_id, content, created_at')
        .single();

      if (!error && data) {
        const supaComment: CommentWithAuthor = {
          id: data.id,
          post_id: data.post_id,
          user_id: data.user_id,
          content: data.content,
          created_at: data.created_at,
          author,
        };

        // Cache locally as well
        const allComments = getDemoComments();
        allComments[postId] = [...(allComments[postId] || []), supaComment];
        saveDemoComments(allComments);

        return { data: supaComment, error: null };
      }
      console.warn('Supabase createComment error, falling back to local:', error);
    } catch (err) {
      console.warn('Supabase createComment exception:', err);
    }
  }

  // Fallback / Demo comment save (guaranteed to succeed!)
  const newComment: CommentWithAuthor = {
    id: `com-${Date.now()}`,
    post_id: postId,
    user_id: author.id,
    content,
    created_at: new Date().toISOString(),
    author,
  };

  const allComments = getDemoComments();
  allComments[postId] = [...(allComments[postId] || []), newComment];
  saveDemoComments(allComments);

  // Update post comment count in local cache
  const posts = getDemoPosts();
  const p = posts.find((item) => item.id === postId);
  if (p) {
    p.comments_count += 1;
    saveDemoPosts(posts);
  }

  return { data: newComment, error: null };
}

// 8. Delete Comment
export async function deleteComment(
  commentId: string,
  postId: string
): Promise<{ error: Error | null }> {
  const allComments = getDemoComments();
  if (allComments[postId]) {
    allComments[postId] = allComments[postId].filter((c) => c.id !== commentId);
    saveDemoComments(allComments);

    const posts = getDemoPosts();
    const p = posts.find((item) => item.id === postId);
    if (p && p.comments_count > 0) {
      p.comments_count -= 1;
      saveDemoPosts(posts);
    }
  }

  if (isSupabaseConfigured && isValidUuid(commentId)) {
    try {
      await supabase.from('comments').delete().eq('id', commentId);
    } catch (err) {
      console.warn('Supabase deleteComment error:', err);
    }
  }

  return { error: null };
}
