import React, { useState } from 'react';
import {
  Heart,
  MessageSquare,
  Share2,
  Trash2,
  Check,
  Clock,
  Sparkles,
} from 'lucide-react';
import { PostWithDetails } from '../types/database';
import { CategoryIcon } from './CategoryIcon';
import { timeAgo } from '../lib/timeAgo';
import { useAuth } from '../context/AuthContext';

interface PostCardProps {
  post: PostWithDetails;
  onOpenDetail: (post: PostWithDetails) => void;
  onToggleLike: (post: PostWithDetails) => void;
  onDeletePost?: (postId: string) => void;
  onSelectCategory?: (slug: string) => void;
  onOpenAuth?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onOpenDetail,
  onToggleLike,
  onDeletePost,
  onSelectCategory,
  onOpenAuth,
}) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);

  const isAuthor = user && user.id === post.user_id;

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/?post=${post.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 400);
    onToggleLike(post);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this discussion post?')) {
      return;
    }
    if (onDeletePost) {
      setIsDeleting(true);
      await onDeletePost(post.id);
      setIsDeleting(false);
    }
  };

  // Estimated read time
  const wordCount = post.content.split(/\s+/).length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <article
      onClick={() => onOpenDetail(post)}
      className="group relative bg-white/90 backdrop-blur-sm rounded-3xl border border-warmgray-200/80 hover:border-hive-400/90 shadow-sm hover:shadow-xl hover:shadow-hive-500/10 hover:-translate-y-1.5 transition-all duration-300 p-6 sm:p-7 cursor-pointer flex flex-col justify-between overflow-hidden"
    >
      {/* Decorative subtle top edge glow line on hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-hive-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div>
        {/* Header: Author + Meta + Category */}
        <div className="flex items-center justify-between gap-3 mb-4">
          {/* Author avatar & info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <img
                src={
                  post.author?.avatar_url ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${post.user_id}`
                }
                alt={post.author?.username || 'User'}
                className="w-11 h-11 rounded-2xl object-cover bg-warmgray-100 border-2 border-white shadow-sm ring-1 ring-warmgray-200/80 group-hover:ring-hive-400 transition-all"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${post.user_id}`;
                }}
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-bold text-warmgray-900 group-hover:text-hive-900 transition-colors truncate">
                  {post.author?.full_name || post.author?.username || 'Hive Member'}
                </span>
                <span className="text-xs text-warmgray-400 font-medium">
                  @{post.author?.username || 'user'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-warmgray-400 mt-0.5">
                <span>{timeAgo(post.created_at)}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {readTimeMinutes} min read
                </span>
              </div>
            </div>
          </div>

          {/* Category Pill with Icon */}
          {post.category && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectCategory && post.category?.slug) {
                  onSelectCategory(post.category.slug);
                }
              }}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50/80 hover:bg-hive-100 text-amber-900 border border-amber-200/80 shadow-xs hover:scale-105 transition-all"
            >
              <CategoryIcon name={post.category.icon} className="w-3.5 h-3.5 text-hive-600" />
              <span>{post.category.name.split('&')[0].trim()}</span>
            </button>
          )}
        </div>

        {/* Title */}
        <h2 className="text-lg sm:text-xl font-extrabold text-warmgray-900 group-hover:text-hive-700 transition-colors leading-snug line-clamp-2 mb-2.5">
          {post.title}
        </h2>

        {/* Snippet */}
        <p className="text-sm text-warmgray-600 leading-relaxed line-clamp-3 whitespace-pre-line mb-5">
          {post.content}
        </p>
      </div>

      {/* Footer Actions */}
      <div className="pt-3.5 border-t border-warmgray-100 flex items-center justify-between gap-3 text-xs text-warmgray-500 font-semibold">
        <div className="flex items-center gap-2">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className={`group/like inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all duration-200 border ${
              post.is_liked
                ? 'bg-rose-50 text-rose-600 font-bold border-rose-200 shadow-sm'
                : 'hover:bg-warmgray-100/80 text-warmgray-600 border-transparent hover:border-warmgray-200'
            }`}
            title={post.is_liked ? 'Unlike discussion' : 'Like discussion'}
          >
            <Heart
              className={`w-4 h-4 transition-transform duration-200 ${
                likeAnimating ? 'scale-130' : 'group-hover/like:scale-115'
              } ${
                post.is_liked ? 'fill-rose-500 text-rose-500' : 'text-warmgray-400 group-hover/like:text-rose-500'
              }`}
            />
            <span>{post.likes_count}</span>
          </button>

          {/* Comment Counter */}
          <button
            onClick={() => onOpenDetail(post)}
            className="group/comment inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl hover:bg-warmgray-100/80 text-warmgray-600 hover:text-warmgray-900 border border-transparent hover:border-warmgray-200 transition-all"
          >
            <MessageSquare className="w-4 h-4 text-warmgray-400 group-hover/comment:text-hive-600 transition-colors" />
            <span>
              {post.comments_count} {post.comments_count === 1 ? 'reply' : 'replies'}
            </span>
          </button>

          {/* Hot Discussion Badge (if > 5 replies) */}
          {post.comments_count >= 5 && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200/80">
              <Sparkles className="w-3 h-3 text-orange-500" />
              <span>Active</span>
            </span>
          )}

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-warmgray-100/80 text-warmgray-500 hover:text-warmgray-800 transition-colors"
            title="Copy discussion link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 animate-in zoom-in-50" />
                <span className="text-emerald-600 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Share</span>
              </>
            )}
          </button>
        </div>

        {/* Delete Button for Author */}
        {isAuthor && onDeletePost && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-warmgray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete this discussion"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        )}
      </div>
    </article>
  );
};
