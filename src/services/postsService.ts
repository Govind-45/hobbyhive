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

// Helper for local storage demo state
function getDemoPosts(): PostWithDetails[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_POSTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed reading demo posts:', e);
  }
  return INITIAL_POSTS;
}

function saveDemoPosts(posts: PostWithDetails[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_POSTS, JSON.stringify(posts));
  } catch (e) {
    console.warn('Failed saving demo posts:', e);
  }
}

function getDemoComments(): Record<string, CommentWithAuthor[]> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_COMMENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed reading demo comments:', e);
  }
  return INITIAL_COMMENTS;
}

function saveDemoComments(comments: Record<string, CommentWithAuthor[]>) {
  try {
    localStorage.setItem(LOCAL_STORAGE_COMMENTS, JSON.stringify(comments));
  } catch (e) {
    console.warn('Failed saving demo comments:', e);
  }
}

// 1. Categories
export async function fetchCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured) {
    return INITIAL_CATEGORIES;
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error || !data || data.length === 0) {
      return INITIAL_CATEGORIES;
    }
    return data as Category[];
  } catch (err) {
    console.error('Failed to fetch categories:', err);
    return INITIAL_CATEGORIES;
  }
}

// 2. Posts List with filters & sorting
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

  if (!isSupabaseConfigured) {
    let posts = [...getDemoPosts()];

    // Author filter (e.g. for My Posts)
    if (authorId) {
      posts = posts.filter((p) => p.user_id === authorId);
    }

    // Liked posts filter
    if (likedOnlyByUserId) {
      posts = posts.filter((p) => p.is_liked);
    }

    // Category filter
    if (categorySlug && categorySlug !== 'all') {
      posts = posts.filter(
        (p) => p.category?.slug.toLowerCase() === categorySlug.toLowerCase()
      );
    }

    // Search query filter
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.category?.name.toLowerCase().includes(q) ||
          p.author.username.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortMode === 'popular') {
      posts.sort((a, b) => b.likes_count - a.likes_count);
    } else if (sortMode === 'discussed') {
      posts.sort((a, b) => b.comments_count - a.comments_count);
    } else {
      // Latest
      posts.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    return posts;
  }

  // --- Real Supabase Query ---
  try {
    let query = supabase
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
      `);

    if (authorId) {
      query = query.eq('user_id', authorId);
    }

    if (categorySlug && categorySlug !== 'all') {
      // Find category id first or filter by joined category slug
      const { data: catData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .maybeSingle();

      if (catData) {
        query = query.eq('category_id', catData.id);
      }
    }

    if (searchQuery && searchQuery.trim()) {
      query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching posts from Supabase:', error);
      return getDemoPosts();
    }

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

    let formattedPosts: PostWithDetails[] = (data as unknown as SupabasePostRaw[]).map((p) => {
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

    if (likedOnlyByUserId) {
      formattedPosts = formattedPosts.filter((p) => p.is_liked);
    }

    if (sortMode === 'popular') {
      formattedPosts.sort((a, b) => b.likes_count - a.likes_count);
    } else if (sortMode === 'discussed') {
      formattedPosts.sort((a, b) => b.comments_count - a.comments_count);
    }

    return formattedPosts;
  } catch (err) {
    console.error('Fetch posts exception:', err);
    return getDemoPosts();
  }
}

// 3. Create Post
export async function createPost(params: {
  title: string;
  content: string;
  categoryId: string;
  author: Profile;
}): Promise<{ data: PostWithDetails | null; error: Error | null }> {
  const { title, content, categoryId, author } = params;

  if (!isSupabaseConfigured) {
    const categories = INITIAL_CATEGORIES;
    const cat = categories.find((c) => c.id === categoryId || c.slug === categoryId) || categories[0];

    const newPost: PostWithDetails = {
      id: `post-${Date.now()}`,
      user_id: author.id,
      category_id: cat.id,
      title,
      content,
      created_at: new Date().toISOString(),
      author,
      category: cat,
      likes_count: 0,
      comments_count: 0,
      is_liked: false,
    };

    const current = getDemoPosts();
    saveDemoPosts([newPost, ...current]);
    return { data: newPost, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        title,
        content,
        category_id: categoryId,
        user_id: author.id,
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

    if (error) return { data: null, error };

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

    return { data: newPost, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

// 4. Delete Post
export async function deletePost(postId: string): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) {
    const posts = getDemoPosts().filter((p) => p.id !== postId);
    saveDemoPosts(posts);
    return { error: null };
  }

  const { error } = await supabase.from('posts').delete().eq('id', postId);
  return { error };
}

// 5. Toggle Like
export async function toggleLikePost(
  postId: string,
  userId: string,
  isCurrentlyLiked: boolean
): Promise<{ liked: boolean; error: Error | null }> {
  if (!isSupabaseConfigured) {
    const posts = getDemoPosts();
    const target = posts.find((p) => p.id === postId);
    if (target) {
      target.is_liked = !isCurrentlyLiked;
      target.likes_count += isCurrentlyLiked ? -1 : 1;
      saveDemoPosts(posts);
    }
    return { liked: !isCurrentlyLiked, error: null };
  }

  try {
    if (isCurrentlyLiked) {
      // Remove like
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (error) return { liked: true, error };
      return { liked: false, error: null };
    } else {
      // Add like
      const { error } = await supabase
        .from('likes')
        .insert({ post_id: postId, user_id: userId });

      if (error) return { liked: false, error };
      return { liked: true, error: null };
    }
  } catch (err) {
    return { liked: isCurrentlyLiked, error: err as Error };
  }
}

// 6. Fetch Comments for a Post
export async function fetchPostComments(postId: string): Promise<CommentWithAuthor[]> {
  if (!isSupabaseConfigured) {
    const allComments = getDemoComments();
    return allComments[postId] || [];
  }

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

    if (error || !data) {
      const allComments = getDemoComments();
      return allComments[postId] || [];
    }

    interface SupabaseCommentRaw {
      id: string;
      post_id: string;
      user_id: string;
      content: string;
      created_at: string;
      author: Profile | Profile[] | null;
    }

    return (data as unknown as SupabaseCommentRaw[]).map((c) => {
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
  } catch (err) {
    console.error('Fetch comments error:', err);
    return [];
  }
}

// 7. Add Comment
export async function createComment(params: {
  postId: string;
  author: Profile;
  content: string;
}): Promise<{ data: CommentWithAuthor | null; error: Error | null }> {
  const { postId, author, content } = params;

  if (!isSupabaseConfigured) {
    const newComment: CommentWithAuthor = {
      id: `com-${Date.now()}`,
      post_id: postId,
      user_id: author.id,
      content,
      created_at: new Date().toISOString(),
      author,
    };

    const allComments = getDemoComments();
    const postComments = allComments[postId] || [];
    allComments[postId] = [...postComments, newComment];
    saveDemoComments(allComments);

    // Also bump comment count on the post
    const posts = getDemoPosts();
    const p = posts.find((item) => item.id === postId);
    if (p) {
      p.comments_count += 1;
      saveDemoPosts(posts);
    }

    return { data: newComment, error: null };
  }

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

    if (error) return { data: null, error };

    const formattedComment: CommentWithAuthor = {
      id: data.id,
      post_id: data.post_id,
      user_id: data.user_id,
      content: data.content,
      created_at: data.created_at,
      author,
    };

    return { data: formattedComment, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

// 8. Delete Comment
export async function deleteComment(
  commentId: string,
  postId: string
): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) {
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
    return { error: null };
  }

  const { error } = await supabase.from('comments').delete().eq('id', commentId);
  return { error };
}
