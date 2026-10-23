import React from 'react';
import {
  Clock,
  Flame,
  MessageSquare,
  PlusCircle,
  Search,
  FilterX,
} from 'lucide-react';
import { PostWithDetails, SortMode, Category } from '../types/database';
import { PostCard } from './PostCard';

interface PostFeedProps {
  posts: PostWithDetails[];
  isLoading: boolean;
  selectedCategorySlug: string;
  categories: Category[];
  searchQuery: string;
  sortMode: SortMode;
  onSortChange: (mode: SortMode) => void;
  onOpenDetail: (post: PostWithDetails) => void;
  onToggleLike: (post: PostWithDetails) => void;
  onDeletePost: (postId: string) => void;
  onOpenCreatePost: () => void;
  onSelectCategory: (slug: string) => void;
  onResetFilters: () => void;
  onOpenAuth: () => void;
}

export const PostFeed: React.FC<PostFeedProps> = ({
  posts,
  isLoading,
  selectedCategorySlug,
  categories,
  searchQuery,
  sortMode,
  onSortChange,
  onOpenDetail,
  onToggleLike,
  onDeletePost,
  onOpenCreatePost,
  onSelectCategory,
  onResetFilters,
  onOpenAuth,
}) => {
  const activeCategory =
    selectedCategorySlug !== 'all'
      ? categories.find((c) => c.slug === selectedCategorySlug)
      : null;

  return (
    <section id="feed-section" className="w-full">
      {/* Header controls bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-warmgray-200">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-warmgray-900 tracking-tight">
              {activeCategory ? activeCategory.name : 'Latest Community Feed'}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-warmgray-200 text-warmgray-700">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            </span>
          </div>
          {activeCategory && (
            <p className="text-xs sm:text-sm text-warmgray-500 mt-1 max-w-xl">
              {activeCategory.description}
            </p>
          )}
          {searchQuery && (
            <div className="flex items-center gap-2 mt-1.5 text-xs text-warmgray-600">
              <span>Searching for: <strong>"{searchQuery}"</strong></span>
              <button
                onClick={onResetFilters}
                className="text-hive-600 hover:text-hive-800 font-semibold inline-flex items-center gap-1"
              >
                <FilterX className="w-3.5 h-3.5" />
                <span>Clear filters</span>
              </button>
            </div>
          )}
        </div>

        {/* Sort Options */}
        <div className="flex items-center bg-warmgray-100 p-1 rounded-xl self-start sm:self-auto border border-warmgray-200/80">
          <button
            onClick={() => onSortChange('latest')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              sortMode === 'latest'
                ? 'bg-white text-warmgray-900 shadow-sm'
                : 'text-warmgray-500 hover:text-warmgray-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Latest</span>
          </button>

          <button
            onClick={() => onSortChange('popular')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              sortMode === 'popular'
                ? 'bg-white text-warmgray-900 shadow-sm'
                : 'text-warmgray-500 hover:text-warmgray-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>Most Liked</span>
          </button>

          <button
            onClick={() => onSortChange('discussed')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              sortMode === 'discussed'
                ? 'bg-white text-warmgray-900 shadow-sm'
                : 'text-warmgray-500 hover:text-warmgray-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-hive-600" />
            <span>Discussed</span>
          </button>
        </div>
      </div>

      {/* Posts List or States */}
      {isLoading ? (
        /* Loading Skeleton */
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 bg-white rounded-2xl border border-warmgray-200 animate-pulse space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warmgray-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-warmgray-200 rounded w-1/4" />
                  <div className="h-3 bg-warmgray-100 rounded w-1/6" />
                </div>
              </div>
              <div className="h-5 bg-warmgray-200 rounded w-3/4" />
              <div className="space-y-2">
                <div className="h-4 bg-warmgray-100 rounded w-full" />
                <div className="h-4 bg-warmgray-100 rounded w-5/6" />
              </div>
              <div className="pt-3 border-t border-warmgray-100 flex gap-4">
                <div className="h-6 bg-warmgray-100 rounded w-16" />
                <div className="h-6 bg-warmgray-100 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        /* Empty State */
        <div className="py-16 px-4 text-center bg-white rounded-3xl border border-dashed border-warmgray-300 space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-hive-100 text-hive-600 flex items-center justify-center mx-auto">
            {searchQuery ? <Search className="w-7 h-7" /> : <PlusCircle className="w-7 h-7" />}
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-warmgray-900">
              {searchQuery
                ? `No discussions matching "${searchQuery}"`
                : 'No discussions yet in this community'}
            </h3>
            <p className="text-sm text-warmgray-500 mt-1">
              {searchQuery
                ? 'Try searching with different keywords, or clear your filters to browse everything.'
                : 'Be the one to spark the conversation! Share your projects, favorite tools, or ask for advice.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            {searchQuery && (
              <button
                onClick={onResetFilters}
                className="px-4 py-2 text-xs font-semibold text-warmgray-700 bg-warmgray-100 hover:bg-warmgray-200 rounded-xl transition-colors"
              >
                Clear Search
              </button>
            )}
            <button
              onClick={onOpenCreatePost}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-hive-600 hover:bg-hive-700 rounded-xl shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Start a Discussion</span>
            </button>
          </div>
        </div>
      ) : (
        /* Render Posts */
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onOpenDetail={onOpenDetail}
              onToggleLike={onToggleLike}
              onDeletePost={onDeletePost}
              onSelectCategory={onSelectCategory}
              onOpenAuth={onOpenAuth}
            />
          ))}
        </div>
      )}
    </section>
  );
};
