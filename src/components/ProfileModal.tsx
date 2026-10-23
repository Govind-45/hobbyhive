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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-warmgray-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-warmgray-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-warmgray-100 flex items-center justify-between bg-warmgray-50/70">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-hive-600" />
            <h2 className="text-lg font-black text-warmgray-900 tracking-tight">
              My Activity & Profile
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-warmgray-400 hover:text-warmgray-700 hover:bg-warmgray-200/80 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* User Bio Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-hive-50/70 via-white to-warmgray-50 border border-warmgray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={
                  profile.avatar_url ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.id}`
                }
                alt={profile.username}
                className="w-16 h-16 rounded-2xl object-cover bg-warmgray-100 border-2 border-white shadow-md"
              />
              <div>
                <h3 className="text-lg font-bold text-warmgray-900">
                  {profile.full_name || profile.username}
                </h3>
                <p className="text-xs text-warmgray-500 font-medium">@{profile.username}</p>
                <div className="flex items-center gap-1.5 text-xs text-warmgray-400 mt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Joined {formatDate(profile.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-warmgray-700 bg-white hover:bg-warmgray-100 border border-warmgray-200 rounded-xl transition-colors"
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors ml-auto sm:ml-0"
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
              className="p-4 rounded-2xl bg-warmgray-50 border border-warmgray-200 space-y-3 animate-in fade-in duration-150"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-warmgray-500 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-warmgray-200 rounded-xl focus:ring-2 focus:ring-hive-500 focus:outline-none"
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
                  className="w-full px-3 py-2 text-sm bg-white border border-warmgray-200 rounded-xl focus:ring-2 focus:ring-hive-500 focus:outline-none resize-none"
                  placeholder="What hobbies are you into?"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-warmgray-600 hover:bg-warmgray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-bold text-white bg-hive-600 hover:bg-hive-700 rounded-lg shadow-sm"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          )}

          {/* User Bio text if present */}
          {!isEditing && profile.bio && (
            <p className="text-sm text-warmgray-600 italic px-1">
              "{profile.bio}"
            </p>
          )}

          {/* Activity Tabs */}
          <div>
            <div className="flex items-center gap-2 border-b border-warmgray-200 pb-2">
              <button
                onClick={() => setActiveTab('posts')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
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
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'liked'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-warmgray-600 hover:bg-warmgray-100'
                }`}
              >
                <Heart className="w-4 h-4" />
                <span>Liked Posts ({likedPosts.length})</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="mt-4">
              {isLoading ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-hive-600" />
                </div>
              ) : activeTab === 'posts' ? (
                myPosts.length === 0 ? (
                  <div className="text-center py-12 bg-warmgray-50/60 rounded-2xl border border-dashed border-warmgray-200 space-y-3">
                    <MessageSquare className="w-8 h-8 text-warmgray-300 mx-auto" />
                    <p className="text-sm font-semibold text-warmgray-700">No discussions posted yet</p>
                    <p className="text-xs text-warmgray-400">
                      Share your questions, setup, or projects with your hobby community.
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenCreatePost();
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-hive-600 hover:bg-hive-700 rounded-xl shadow-sm"
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
                /* Liked Posts */
                likedPosts.length === 0 ? (
                  <div className="text-center py-12 bg-warmgray-50/60 rounded-2xl border border-dashed border-warmgray-200">
                    <Heart className="w-8 h-8 text-warmgray-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-warmgray-700">No liked posts yet</p>
                    <p className="text-xs text-warmgray-400">
                      Click the heart on any discussion in the feed to save it here.
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
