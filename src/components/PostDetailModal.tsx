import React, { useEffect, useState } from 'react';
import {
  X,
  Heart,
  MessageSquare,
  Share2,
  Trash2,
  Send,
  Loader2,
  Check,
  LogIn,
} from 'lucide-react';
import { PostWithDetails, CommentWithAuthor } from '../types/database';
import { CategoryIcon } from './CategoryIcon';
import { timeAgo } from '../lib/timeAgo';
import { useAuth } from '../context/AuthContext';
import {
  fetchPostComments,
  createComment,
  deleteComment,
} from '../services/postsService';

interface PostDetailModalProps {
  post: PostWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleLike: (post: PostWithDetails) => void;
  onDeletePost?: (postId: string) => void;
  onOpenAuth: () => void;
  onCommentCountChange?: (postId: string, newCount: number) => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  isOpen,
  onClose,
  onToggleLike,
  onDeletePost,
  onOpenAuth,
  onCommentCountChange,
}) => {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load comments when modal opens for a post
  useEffect(() => {
    if (!isOpen || !post) return;

    let isMounted = true;
    setIsLoadingComments(true);
    fetchPostComments(post.id)
      .then((data) => {
        if (isMounted) {
          setComments(data);
          setIsLoadingComments(false);
        }
      })
      .catch((err) => {
        console.error('Error loading comments:', err);
        if (isMounted) setIsLoadingComments(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, post]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !post) return null;

  const isPostAuthor = user && user.id === post.user_id;

  const handleShare = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/?post=${post.id}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) {
      onOpenAuth();
      return;
    }

    const trimmed = newCommentText.trim();
    if (!trimmed) return;

    setIsSubmittingComment(true);
    const { data, error } = await createComment({
      postId: post.id,
      author: profile,
      content: trimmed,
    });

    setIsSubmittingComment(false);

    if (error) {
      alert(`Could not add comment: ${error.message}`);
      return;
    }

    if (data) {
      const updated = [...comments, data];
      setComments(updated);
      setNewCommentText('');
      if (onCommentCountChange) {
        onCommentCountChange(post.id, updated.length);
      }
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Delete your comment?')) return;

    const { error } = await deleteComment(commentId, post.id);
    if (!error) {
      const updated = comments.filter((c) => c.id !== commentId);
      setComments(updated);
      if (onCommentCountChange) {
        onCommentCountChange(post.id, updated.length);
      }
    } else {
      alert(`Could not delete comment: ${error.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-warmgray-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-warmgray-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-warmgray-100 flex items-center justify-between gap-4 bg-warmgray-50/70">
          <div className="flex items-center gap-3">
            <img
              src={
                post.author?.avatar_url ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${post.user_id}`
              }
              alt={post.author?.username || 'User'}
              className="w-10 h-10 rounded-xl object-cover bg-warmgray-100 border border-warmgray-200"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-warmgray-900">
                  {post.author?.full_name || post.author?.username}
                </span>
                <span className="text-xs text-warmgray-400">
                  @{post.author?.username}
                </span>
              </div>
              <p className="text-xs text-warmgray-400">
                Posted {timeAgo(post.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {post.category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-hive-100 text-hive-800 border border-hive-200">
                <CategoryIcon name={post.category.icon} className="w-3.5 h-3.5 text-hive-600" />
                <span>{post.category.name}</span>
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-warmgray-400 hover:text-warmgray-700 hover:bg-warmgray-200/80 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Scrollable Content */}
        <div className="overflow-y-auto p-4 sm:p-8 space-y-6">
          {/* Post Title */}
          <h1 className="text-xl sm:text-2xl font-black text-warmgray-900 tracking-tight leading-snug">
            {post.title}
          </h1>

          {/* Post Full Content */}
          <div className="text-base text-warmgray-700 leading-relaxed whitespace-pre-line font-normal space-y-4">
            {post.content}
          </div>

          {/* Post Action Bar */}
          <div className="pt-4 border-t border-warmgray-200/80 flex items-center justify-between text-xs text-warmgray-600">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleLike(post)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  post.is_liked
                    ? 'bg-rose-50 text-rose-600 font-bold border border-rose-200'
                    : 'hover:bg-warmgray-100 text-warmgray-700 border border-warmgray-200'
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${
                    post.is_liked ? 'fill-rose-500 text-rose-500' : 'text-warmgray-500'
                  }`}
                />
                <span>{post.likes_count} Likes</span>
              </button>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl hover:bg-warmgray-100 border border-warmgray-200 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-warmgray-500" />
                    <span>Share</span>
                  </>
                )}
              </button>
            </div>

            {isPostAuthor && onDeletePost && (
              <button
                onClick={() => {
                  if (window.confirm('Delete this discussion post?')) {
                    onDeletePost(post.id);
                    onClose();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors font-semibold"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Post</span>
              </button>
            )}
          </div>

          {/* Comments Section */}
          <div className="pt-6 border-t border-warmgray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-warmgray-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-hive-600" />
                <span>Discussion ({comments.length})</span>
              </h3>
            </div>

            {/* Comment Form */}
            {user ? (
              <form onSubmit={handleAddComment} className="mb-6">
                <div className="bg-warmgray-50 rounded-2xl border border-warmgray-200 p-3 focus-within:border-hive-400 focus-within:ring-2 focus-within:ring-hive-400/20 transition-all">
                  <textarea
                    rows={3}
                    placeholder="Share your thoughts, advice, or perspective..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="w-full bg-transparent resize-none text-sm text-warmgray-800 placeholder:text-warmgray-400 focus:outline-none"
                  />
                  <div className="flex items-center justify-between pt-2 border-t border-warmgray-200/60">
                    <span className="text-xs text-warmgray-400">
                      {newCommentText.length} characters
                    </span>
                    <button
                      type="submit"
                      disabled={isSubmittingComment || !newCommentText.trim()}
                      className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-white bg-hive-600 hover:bg-hive-700 active:scale-95 disabled:opacity-40 disabled:pointer-events-none rounded-xl transition-all shadow-sm"
                    >
                      {isSubmittingComment ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Posting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Reply</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="mb-6 p-4 rounded-2xl bg-hive-50/70 border border-hive-200/80 flex items-center justify-between flex-wrap gap-3">
                <p className="text-xs sm:text-sm text-hive-900 font-medium">
                  Join the conversation! Sign in with your email to add a comment.
                </p>
                <button
                  onClick={onOpenAuth}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-hive-600 hover:bg-hive-700 text-white text-xs font-bold shadow-sm transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In / Join</span>
                </button>
              </div>
            )}

            {/* Comments List */}
            {isLoadingComments ? (
              <div className="space-y-3 py-4">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse flex items-start gap-3 p-3 bg-warmgray-50 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-warmgray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-warmgray-200 rounded w-1/4" />
                      <div className="h-3 bg-warmgray-200 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-10 bg-warmgray-50/50 rounded-2xl border border-dashed border-warmgray-200">
                <MessageSquare className="w-8 h-8 text-warmgray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-warmgray-700">No replies yet</p>
                <p className="text-xs text-warmgray-400 mt-1">
                  Be the first one to leave a reply on this topic!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => {
                  const isCommentAuthor = user && user.id === comment.user_id;
                  return (
                    <div
                      key={comment.id}
                      className="p-3.5 sm:p-4 rounded-2xl bg-warmgray-50/70 border border-warmgray-100 hover:border-warmgray-200 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              comment.author?.avatar_url ||
                              `https://api.dicebear.com/7.x/bottts/svg?seed=${comment.user_id}`
                            }
                            alt={comment.author?.username}
                            className="w-7 h-7 rounded-lg object-cover bg-warmgray-200"
                          />
                          <div>
                            <span className="text-xs font-bold text-warmgray-900 mr-1.5">
                              {comment.author?.full_name || comment.author?.username}
                            </span>
                            <span className="text-[11px] text-warmgray-400">
                              @{comment.author?.username} • {timeAgo(comment.created_at)}
                            </span>
                          </div>
                        </div>

                        {isCommentAuthor && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-warmgray-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Delete comment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <p className="text-sm text-warmgray-700 leading-relaxed pl-9 whitespace-pre-line">
                        {comment.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
