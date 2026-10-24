import React, { useState, useEffect } from 'react';
import {
  X,
  User as UserIcon,
  MessageSquare,
  Heart,
  Calendar,
  Edit3,
  Check,
  Loader2,
  PlusCircle,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PostWithDetails } from '../types/database';
import { fetchPosts } from '../services/postsService';
import { PostCard } from './PostCard';
import { formatDate } from '../lib/timeAgo';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDetail: (post: PostWithDetails) => void;
  onToggleLike: (post: PostWithDetails) => void;
  onDeletePost: (postId: string) => void;
  onOpenCreatePost: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenDetail,
  onToggleLike,
  onDeletePost,
  onOpenCreatePost,
}) => {
  const { user, profile, updateProfile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'liked'>('posts');
  const [myPosts, setMyPosts] = useState<PostWithDetails[]>([]);
  const [likedPosts, setLikedPosts] = useState<PostWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  // Load user posts and liked posts
  useEffect(() => {
    if (!isOpen || !user) return;

    let mounted = true;
    setIsLoading(true);

    Promise.all([
      fetchPosts({ authorId: user.id }),
      fetchPosts({ likedOnlyByUserId: user.id }),
    ])
      .then(([posts, liked]) => {
        if (mounted) {
          setMyPosts(posts);
          setLikedPosts(liked);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load profile posts:', err);
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, user]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !user || !profile) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateProfile({
      full_name: fullName.trim(),
      bio: bio.trim(),
    });
    setIsSaving(false);
    setIsEditing(false);
  };

  const handlePostDeleted = (postId: string) => {
    setMyPosts((prev) => prev.filter((p) => p.id !== postId));
    setLikedPosts((prev) => prev.filter((p) => p.id !== postId));
    onDeletePost(postId);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-warmgray-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="bg-white/95 backdrop-blur-xl w-full max-w-3xl rounded-3xl shadow-2xl border border-warmgray-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-warmgray-100 flex items-center justify-between bg-warmgray-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              <UserIcon className="w-5 h-5 text-hive-600" />
            </div>
            <h2 className="text-lg font-black text-warmgray-900 tracking-tight">
              My Activity & Profile
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-warmgray-400 hover:text-warmgray-700 hover:bg-warmgray-200/80 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* User Bio Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-white to-hive-50/60 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={
                    profile.avatar_url ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.id}`
                  }
                  alt={profile.username}
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl object-cover bg-warmgray-100 border-2 border-white shadow-md ring-2 ring-amber-300/40"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
              </div>

              <div>
                <h3 className="text-xl font-black text-warmgray-900">
                  {profile.full_name || profile.username}
                </h3>
                <p className="text-xs text-warmgray-500 font-semibold">@{profile.username}</p>
                <div className="flex items-center gap-1.5 text-xs text-warmgray-400 mt-1 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Joined {formatDate(profile.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-warmgray-700 bg-white hover:bg-warmgray-50 border border-warmgray-200/90 rounded-2xl shadow-xs transition-all hover:scale-102"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              )}
              <button
                onClick={async () => {
                  await signOut();
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-2xl transition-all ml-auto sm:ml-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Edit Form */}
          {isEditing && (
            <form
              onSubmit={handleSaveProfile}
              className="p-5 rounded-3xl bg-warmgray-50/90 border border-warmgray-200 space-y-3.5 animate-in fade-in duration-150"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-warmgray-500 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-warmgray-200 rounded-2xl focus:ring-2 focus:ring-hive-500 focus:outline-none"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-warmgray-500 mb-1">
                  About / Bio
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-warmgray-200 rounded-2xl focus:ring-2 focus:ring-hive-500 focus:outline-none resize-none leading-relaxed"
                  placeholder="What hobbies are you into?"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-bold text-warmgray-600 hover:bg-warmgray-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-hive-600 to-amber-600 hover:from-hive-700 hover:to-amber-700 rounded-xl shadow-sm"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          )}

          {/* User Bio text if present */}
          {!isEditing && profile.bio && (
            <p className="text-sm text-warmgray-700 italic px-2 font-medium">
              "{profile.bio}"
            </p>
          )}

          {/* Activity Tabs */}
          <div>
            <div className="flex items-center gap-2 border-b border-warmgray-200 pb-3">
              <button
                onClick={() => setActiveTab('posts')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'posts'
                    ? 'bg-warmgray-900 text-white shadow-sm'
                    : 'text-warmgray-600 hover:bg-warmgray-100'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>My Discussions ({myPosts.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('liked')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'liked'
                    ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-sm'
                    : 'text-warmgray-600 hover:bg-warmgray-100'
                }`}
              >
                <Heart className="w-4 h-4" />
                <span>Liked Posts ({likedPosts.length})</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="mt-5">
              {isLoading ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="w-7 h-7 animate-spin text-hive-600" />
                </div>
              ) : activeTab === 'posts' ? (
                myPosts.length === 0 ? (
                  <div className="text-center py-12 bg-warmgray-50/60 rounded-3xl border border-dashed border-warmgray-200 space-y-3">
                    <MessageSquare className="w-10 h-10 text-warmgray-300 mx-auto" />
                    <p className="text-sm font-bold text-warmgray-800">No discussions posted yet</p>
                    <p className="text-xs text-warmgray-400">
                      Share your questions, setup, or projects with your hobby community.
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenCreatePost();
                      }}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-hive-600 to-amber-600 hover:from-hive-700 hover:to-amber-700 rounded-2xl shadow-sm"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Create Your First Post</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onOpenDetail={onOpenDetail}
                        onToggleLike={onToggleLike}
                        onDeletePost={handlePostDeleted}
                      />
                    ))}
                  </div>
                )
              ) : (
                likedPosts.length === 0 ? (
                  <div className="text-center py-12 bg-warmgray-50/60 rounded-3xl border border-dashed border-warmgray-200">
                    <Heart className="w-10 h-10 text-warmgray-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-warmgray-800">No liked posts yet</p>
                    <p className="text-xs text-warmgray-400">
                      Click the heart icon on any discussion in the feed to save it here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {likedPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onOpenDetail={onOpenDetail}
                        onToggleLike={onToggleLike}
                        onDeletePost={handlePostDeleted}
                      />
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
