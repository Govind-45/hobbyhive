import React, { useState, useEffect } from 'react';
import {
  X,
  PlusCircle,
  Loader2,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Category, PostWithDetails } from '../types/database';
import { useAuth } from '../context/AuthContext';
import { createPost } from '../services/postsService';
import { CategoryIcon } from './CategoryIcon';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  initialCategorySlug?: string;
  onPostCreated: (post: PostWithDetails) => void;
  onOpenAuth: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  categories,
  initialCategorySlug,
  onPostCreated,
  onOpenAuth,
}) => {
  const { user, profile } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Set initial category
  useEffect(() => {
    if (categories.length > 0) {
      if (initialCategorySlug && initialCategorySlug !== 'all') {
        const found = categories.find((c) => c.slug === initialCategorySlug);
        setCategoryId(found ? found.id : categories[0].id);
      } else if (!categoryId) {
        setCategoryId(categories[0].id);
      }
    }
  }, [categories, initialCategorySlug, isOpen]);

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

  if (!isOpen) return null;

  if (!user || !profile) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-warmgray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl border border-warmgray-200">
          <div className="w-12 h-12 rounded-2xl bg-hive-100 text-hive-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-warmgray-900">Sign in to start a discussion</h2>
          <p className="text-sm text-warmgray-600">
            You must be logged in to share tips, ask questions, or showcase your hobby projects to the community.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-warmgray-600 hover:bg-warmgray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="px-5 py-2 text-sm font-bold text-white bg-hive-600 hover:bg-hive-700 rounded-xl shadow-sm"
            >
              Sign In with Email OTP
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (trimmedTitle.length < 3) {
      setErrorMsg('Title must be at least 3 characters long.');
      return;
    }
    if (trimmedTitle.length > 200) {
      setErrorMsg('Title must not exceed 200 characters.');
      return;
    }
    if (trimmedContent.length < 5) {
      setErrorMsg('Content must be at least 5 characters long.');
      return;
    }
    if (!categoryId) {
      setErrorMsg('Please select a hobby community category.');
      return;
    }

    setIsSubmitting(true);

    const { data, error } = await createPost({
      title: trimmedTitle,
      content: trimmedContent,
      categoryId,
      author: profile,
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMsg(error.message || 'Failed to publish post. Please try again.');
      return;
    }

    if (data) {
      onPostCreated(data);
      setTitle('');
      setContent('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-warmgray-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-warmgray-200 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-warmgray-100 flex items-center justify-between bg-warmgray-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-hive-500 text-white flex items-center justify-center shadow-sm">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-warmgray-900 tracking-tight">
                Start a New Discussion
              </h2>
              <p className="text-xs text-warmgray-500">
                Posting as <span className="font-semibold text-warmgray-800">@{profile.username}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-warmgray-400 hover:text-warmgray-700 hover:bg-warmgray-200/80 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-warmgray-500 mb-2">
              Hobby Community <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-left transition-all border ${
                      isSelected
                        ? 'bg-hive-50 text-hive-900 border-hive-500 ring-2 ring-hive-500/20'
                        : 'bg-warmgray-50/80 text-warmgray-700 border-warmgray-200 hover:bg-warmgray-100'
                    }`}
                  >
                    <CategoryIcon
                      name={cat.icon}
                      className={`w-4 h-4 shrink-0 ${isSelected ? 'text-hive-600' : 'text-warmgray-500'}`}
                    />
                    <span className="truncate">{cat.name.split('&')[0].trim()}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-warmgray-500">
                Discussion Title <span className="text-rose-500">*</span>
              </label>
              <span className={`text-xs ${title.length > 180 ? 'text-amber-600 font-bold' : 'text-warmgray-400'}`}>
                {title.length}/200
              </span>
            </div>
            <input
              type="text"
              placeholder="e.g., Best prime lens for low-light street photography under $400?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              className="w-full px-4 py-2.5 text-sm font-medium bg-warmgray-50 border border-warmgray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-hive-500 focus:border-transparent transition-all placeholder:text-warmgray-400"
              required
            />
          </div>

          {/* Body */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-warmgray-500">
                Content & Details <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-warmgray-400">
                {content.length} characters
              </span>
            </div>
            <textarea
              rows={6}
              placeholder="Share your experience, specific questions, context, or steps you've already tried. Keep it constructive and welcoming..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-4 text-sm bg-warmgray-50 border border-warmgray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-hive-500 focus:border-transparent transition-all placeholder:text-warmgray-400 resize-none leading-relaxed"
              required
            />
          </div>

          {/* Guidelines info */}
          <div className="p-3 bg-hive-50/60 rounded-xl border border-hive-200/60 text-xs text-hive-950 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-hive-600 shrink-0 mt-0.5" />
            <span>
              Tip: Clear titles and respectful details get the most insightful responses from fellow hobbyists.
            </span>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-warmgray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-sm font-semibold text-warmgray-600 hover:bg-warmgray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-hive-600 hover:bg-hive-700 active:scale-95 disabled:opacity-40 disabled:pointer-events-none rounded-xl shadow-md shadow-hive-600/20 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Publish Discussion</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
