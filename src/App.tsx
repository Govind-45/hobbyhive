import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { CategoryBar } from './components/CategoryBar';
import { PostFeed } from './components/PostFeed';
import { Sidebar } from './components/Sidebar';
import { PostDetailModal } from './components/PostDetailModal';
import { CreatePostModal } from './components/CreatePostModal';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { SetupModal } from './components/SetupModal';
import { useAuth } from './context/AuthContext';
import {
  PostWithDetails,
  Category,
  SortMode,
} from './types/database';
import {
  fetchCategories,
  fetchPosts,
  toggleLikePost,
  deletePost,
} from './services/postsService';

export const App: React.FC = () => {
  const { user } = useAuth();

  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  // Filters & Sorting
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortMode, setSortMode] = useState<SortMode>('latest');

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [selectedPostDetail, setSelectedPostDetail] = useState<PostWithDetails | null>(null);

  // Load Categories on mount
  useEffect(() => {
    fetchCategories().then((cats) => {
      setCategories(cats);
    });
  }, []);

  // Fetch posts when category, search, or sort changes
  const loadPosts = useCallback(async () => {
    setIsLoadingPosts(true);
    try {
      const data = await fetchPosts({
        categorySlug: selectedCategory,
        searchQuery,
        sortMode,
        currentUserId: user?.id,
      });
      setPosts(data);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setIsLoadingPosts(false);
    }
  }, [selectedCategory, searchQuery, sortMode, user?.id]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Deep-linking via query parameters (e.g. ?post=... or ?category=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('category');
    const postParam = params.get('post');

    if (catParam) {
      setSelectedCategory(catParam);
    }

    if (postParam && posts.length > 0) {
      const matched = posts.find((p) => p.id === postParam);
      if (matched) {
        setSelectedPostDetail(matched);
      }
    }
  }, [posts]);

  // Handlers
  const handleToggleLike = async (targetPost: PostWithDetails) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const previousLiked = targetPost.is_liked;
    const previousCount = targetPost.likes_count;

    // Optimistic UI update
    const updatedPost = {
      ...targetPost,
      is_liked: !previousLiked,
      likes_count: previousLiked ? previousCount - 1 : previousCount + 1,
    };

    setPosts((prev) =>
      prev.map((p) => (p.id === targetPost.id ? updatedPost : p))
    );

    if (selectedPostDetail && selectedPostDetail.id === targetPost.id) {
      setSelectedPostDetail(updatedPost);
    }

    // Call service
    const { error } = await toggleLikePost(
      targetPost.id,
      user.id,
      previousLiked
    );

    if (error) {
      // Revert if error
      console.error('Failed to like post:', error);
      setPosts((prev) =>
        prev.map((p) => (p.id === targetPost.id ? targetPost : p))
      );
      if (selectedPostDetail && selectedPostDetail.id === targetPost.id) {
        setSelectedPostDetail(targetPost);
      }
    }
  };

  const handleDeletePost = async (postId: string) => {
    const { error } = await deletePost(postId);
    if (!error) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      if (selectedPostDetail?.id === postId) {
        setSelectedPostDetail(null);
      }
    } else {
      alert(`Could not delete post: ${error.message}`);
    }
  };

  const handlePostCreated = (newPost: PostWithDetails) => {
    setPosts((prev) => [newPost, ...prev]);
    // Switch to category of post or 'all'
    if (selectedCategory !== 'all' && newPost.category?.slug !== selectedCategory) {
      setSelectedCategory('all');
    }
  };

  const handleCommentCountChange = (postId: string, newCount: number) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments_count: newCount } : p))
    );
    if (selectedPostDetail && selectedPostDetail.id === postId) {
      setSelectedPostDetail((prev) =>
        prev ? { ...prev, comments_count: newCount } : null
      );
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortMode('latest');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf9f4] bg-dots-pattern text-warmgray-900 selection:bg-hive-200">
      {/* Top Navigation */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCreatePost={() => {
          if (!user) {
            setIsAuthModalOpen(true);
          } else {
            setIsCreatePostModalOpen(true);
          }
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenSetupModal={() => setIsSetupModalOpen(true)}
        onResetFilters={handleResetFilters}
      />

      {/* Hero Section (only when on 'all' without active search, or compact) */}
      {!searchQuery && selectedCategory === 'all' && (
        <LandingHero
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(slug) => {
            setSelectedCategory(slug);
            const el = document.getElementById('feed-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenCreatePost={() => {
            if (!user) setIsAuthModalOpen(true);
            else setIsCreatePostModalOpen(true);
          }}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Category Horizontal Filter Bar */}
        <div className="mb-6">
          <CategoryBar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* 2-Column Responsive Layout: Main Feed + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Feed Column */}
          <div className="lg:col-span-8">
            <PostFeed
              posts={posts}
              isLoading={isLoadingPosts}
              selectedCategorySlug={selectedCategory}
              categories={categories}
              searchQuery={searchQuery}
              sortMode={sortMode}
              onSortChange={setSortMode}
              onOpenDetail={(post) => setSelectedPostDetail(post)}
              onToggleLike={handleToggleLike}
              onDeletePost={handleDeletePost}
              onOpenCreatePost={() => {
                if (!user) setIsAuthModalOpen(true);
                else setIsCreatePostModalOpen(true);
              }}
              onSelectCategory={setSelectedCategory}
              onResetFilters={handleResetFilters}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          </div>

          {/* Right Sidebar Column (Sticky on Desktop) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-24">
            <Sidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onOpenCreatePost={() => {
                if (!user) setIsAuthModalOpen(true);
                else setIsCreatePostModalOpen(true);
              }}
              onOpenSetupModal={() => setIsSetupModalOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <PostDetailModal
        post={selectedPostDetail}
        isOpen={Boolean(selectedPostDetail)}
        onClose={() => setSelectedPostDetail(null)}
        onToggleLike={handleToggleLike}
        onDeletePost={handleDeletePost}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onCommentCountChange={handleCommentCountChange}
      />

      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        categories={categories}
        initialCategorySlug={selectedCategory}
        onPostCreated={handlePostCreated}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onOpenDetail={(post) => setSelectedPostDetail(post)}
        onToggleLike={handleToggleLike}
        onDeletePost={handleDeletePost}
        onOpenCreatePost={() => {
          setIsProfileModalOpen(false);
          setIsCreatePostModalOpen(true);
        }}
      />

      <SetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
      />
    </div>
  );
};
