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
      {/* Feed Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-warmgray-200/90">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-2xl sm:text-3xl font-black text-warmgray-900 tracking-tight">
              {activeCategory ? activeCategory.name : 'Community Discussions'}
            </h2>
            <span className="text-xs px-3 py-1 rounded-full font-extrabold bg-amber-100 text-amber-900 border border-amber-200/80 shadow-xs">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            </span>
          </div>

          {activeCategory && (
            <p className="text-xs sm:text-sm text-warmgray-500 mt-1 max-w-xl font-medium">
              {activeCategory.description}
            </p>
          )}

          {searchQuery && (
            <div className="flex items-center gap-2 mt-2 text-xs text-warmgray-600 bg-white/80 px-3 py-1.5 rounded-xl border border-warmgray-200/80 inline-flex shadow-xs">
              <span>Searching for: <strong>"{searchQuery}"</strong></span>
              <button
                onClick={onResetFilters}
                className="text-hive-600 hover:text-hive-800 font-bold inline-flex items-center gap-1 hover:underline ml-1"
              >
                <FilterX className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          )}
        </div>

        {/* Sort Options Buttons */}
        <div className="flex items-center bg-white/90 backdrop-blur-sm p-1.5 rounded-2xl border border-warmgray-200/90 shadow-xs self-start sm:self-auto">
          <button
            onClick={() => onSortChange('latest')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              sortMode === 'latest'
                ? 'bg-warmgray-900 text-white shadow-sm'
                : 'text-warmgray-500 hover:text-warmgray-800 hover:bg-warmgray-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Latest</span>
          </button>

          <button
            onClick={() => onSortChange('popular')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              sortMode === 'popular'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-sm'
                : 'text-warmgray-500 hover:text-warmgray-800 hover:bg-warmgray-50'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Most Liked</span>
          </button>

          <button
            onClick={() => onSortChange('discussed')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              sortMode === 'discussed'
                ? 'bg-hive-600 text-white shadow-sm'
                : 'text-warmgray-500 hover:text-warmgray-800 hover:bg-warmgray-50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Discussed</span>
          </button>
        </div>
      </div>

      {/* Posts List or States */}
      {isLoading ? (
        /* Loading Skeleton with Shimmer */
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 sm:p-7 bg-white/90 rounded-3xl border border-warmgray-200/80 animate-pulse space-y-4 shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-warmgray-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-warmgray-200 rounded-lg w-1/4" />
                  <div className="h-3 bg-warmgray-100 rounded-lg w-1/6" />
                </div>
              </div>
              <div className="h-6 bg-warmgray-200 rounded-lg w-3/4" />
              <div className="space-y-2">
                <div className="h-4 bg-warmgray-100 rounded-lg w-full" />
                <div className="h-4 bg-warmgray-100 rounded-lg w-4/5" />
              </div>
              <div className="pt-3 border-t border-warmgray-100 flex gap-4">
                <div className="h-7 bg-warmgray-100 rounded-xl w-20" />
                <div className="h-7 bg-warmgray-100 rounded-xl w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        /* Empty State */
        <div className="py-16 px-6 text-center bg-white/90 backdrop-blur-sm rounded-3xl border border-dashed border-warmgray-300 space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-hive-400 text-white flex items-center justify-center mx-auto shadow-md shadow-hive-500/20">
            {searchQuery ? <Search className="w-8 h-8" /> : <PlusCircle className="w-8 h-8" />}
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-xl font-bold text-warmgray-900">
              {searchQuery
                ? `No discussions matching "${searchQuery}"`
                : 'No discussions yet in this community'}
            </h3>
            <p className="text-sm text-warmgray-500 leading-relaxed">
              {searchQuery
                ? 'Try searching with different keywords, or clear your filters to browse everything.'
                : 'Be the one to spark the conversation! Share your projects, favorite tools, or ask for advice.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            {searchQuery && (
              <button
                onClick={onResetFilters}
                className="px-5 py-2.5 text-xs font-bold text-warmgray-700 bg-warmgray-100 hover:bg-warmgray-200 rounded-2xl transition-colors"
              >
                Clear Search
              </button>
            )}
            <button
              onClick={onOpenCreatePost}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-hive-600 to-amber-600 hover:from-hive-700 hover:to-amber-700 rounded-2xl shadow-md shadow-hive-600/25 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Start a Discussion</span>
            </button>
          </div>
        </div>
      ) : (
        /* Post Cards */
        <div className="space-y-5">
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
