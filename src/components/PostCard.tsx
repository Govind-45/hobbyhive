import React, { useState } from 'react';
import {
  Heart,
  MessageSquare,
  Share2,
  Trash2,
  Check,
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

  const isAuthor = user && user.id === post.user_id;

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(
      `${window.location.origin}/?post=${post.id}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
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

  return (
    <article
      onClick={() => onOpenDetail(post)}
      className="group bg-white rounded-2xl border border-warmgray-200/90 hover:border-hive-300 shadow-sm hover:shadow-md transition-all duration-200 p-5 sm:p-6 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Header: Author + Category */}
        <div className="flex items-center justify-between gap-3 mb-3">
          {/* Author info */}
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={
                post.author?.avatar_url ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${post.user_id}`
              }
              alt={post.author?.username || 'User'}
              className="w-10 h-10 rounded-xl object-cover bg-warmgray-100 border border-warmgray-200 shrink-0"
              onError={(e) => {
                // Fallback if image fails to load
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${post.user_id}`;
              }}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-bold text-warmgray-900 truncate">
                  {post.author?.full_name || post.author?.username || 'Hive Member'}
                </span>
                <span className="text-xs text-warmgray-400 font-medium">
                  @{post.author?.username || 'user'}
                </span>
              </div>
              <p className="text-xs text-warmgray-400 font-medium">
                {timeAgo(post.created_at)}
              </p>
            </div>
          </div>

          {/* Category Badge */}
          {post.category && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectCategory && post.category?.slug) {
                  onSelectCategory(post.category.slug);
                }
              }}
              className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-hive-50 hover:bg-hive-100 text-hive-800 border border-hive-200/80 transition-colors"
            >
              <CategoryIcon name={post.category.icon} className="w-3.5 h-3.5 text-hive-600" />
              <span>{post.category.name.split('&')[0].trim()}</span>
            </button>
          )}
        </div>

        {/* Post Title */}
        <h2 className="text-lg sm:text-xl font-bold text-warmgray-900 group-hover:text-hive-700 transition-colors leading-snug line-clamp-2 mb-2">
          {post.title}
        </h2>

        {/* Post Body Snippet */}
        <p className="text-sm text-warmgray-600 leading-relaxed line-clamp-3 whitespace-pre-line mb-4">
          {post.content}
        </p>
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-warmgray-100 flex items-center justify-between gap-3 text-xs text-warmgray-500 font-semibold">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              post.is_liked
                ? 'bg-rose-50 text-rose-600 font-bold border border-rose-200'
                : 'hover:bg-warmgray-100 text-warmgray-600'
            }`}
            title={post.is_liked ? 'Unlike' : 'Like'}
          >
            <Heart
              className={`w-4 h-4 transition-transform active:scale-125 ${
                post.is_liked ? 'fill-rose-500 text-rose-500' : 'text-warmgray-500'
              }`}
            />
            <span>{post.likes_count}</span>
          </button>

          {/* Comment Count */}
          <button
            onClick={() => onOpenDetail(post)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-warmgray-100 text-warmgray-600 transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-warmgray-500" />
            <span>
              {post.comments_count} {post.comments_count === 1 ? 'comment' : 'comments'}
            </span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-warmgray-100 text-warmgray-500 transition-colors"
            title="Copy discussion link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-semibold">Copied</span>
              </>
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Delete (Author only) */}
        {isAuthor && onDeletePost && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-warmgray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete post"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        )}
      </div>
    </article>
  );
};
