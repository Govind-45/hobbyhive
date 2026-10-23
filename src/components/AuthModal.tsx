import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  KeyRound,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MOCK_USERS } from '../lib/mockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, signInWithOtp, verifyOtp, quickDemoLogin, isDemoMode } = useAuth();

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(30);

  // Auto-close modal when user signs in (e.g. from clicking email link)
  useEffect(() => {
    if (user && isOpen) {
      onClose();
    }
  }, [user, isOpen, onClose]);

  // Reset state on open/close
  useEffect(() => {
    if (isOpen) {
      setStep('email');
      setEmail('');
      setOtpToken('');
      setErrorMsg(null);
      setSuccessNotice(null);
      setResendCountdown(30);
    }
  }, [isOpen]);

  // Resend countdown timer
  useEffect(() => {
    if (step !== 'otp' || resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [step, resendCountdown]);

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

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessNotice(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    const { error } = await signInWithOtp(trimmedEmail);
    setIsLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Failed to send OTP code. Please try again.');
      return;
    }

    setStep('otp');
    setResendCountdown(30);
    if (isDemoMode) {
      setSuccessNotice('Demo code: Enter any 6 digits (e.g. 123456) to sign in!');
    } else {
      setSuccessNotice(`Sign-in link sent to ${trimmedEmail}! Click "Sign in" in your email to log in instantly.`);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedCode = otpToken.trim();
    if (trimmedCode.length < 6) {
      setErrorMsg('Please enter the full 6-digit code.');
      return;
    }

    setIsLoading(true);
    const { error } = await verifyOtp(email.trim(), trimmedCode);
    setIsLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Invalid or expired code. Please try again.');
      return;
    }

    onClose();
  };

  // Quick Demo User Switch
  const handleQuickDemo = (index: number) => {
    quickDemoLogin(index);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-warmgray-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-warmgray-200 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-warmgray-100 flex items-center justify-between bg-warmgray-50/70">
          <div>
            <h2 className="text-xl font-black text-warmgray-900 tracking-tight">
              {step === 'email' ? 'Welcome to HobbyHive' : 'Verify Your Email'}
            </h2>
            <p className="text-xs text-warmgray-500 mt-0.5">
              {step === 'email'
                ? 'Sign in or sign up with a passwordless email OTP'
                : `Enter the code sent to ${email}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-warmgray-400 hover:text-warmgray-700 hover:bg-warmgray-200/80 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {/* Notifications */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {step === 'email' ? (
            /* Step 1: Email Form */
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-warmgray-500 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warmgray-400 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm font-medium bg-warmgray-50 border border-warmgray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-hive-500 focus:border-transparent transition-all placeholder:text-warmgray-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-hive-600 hover:bg-hive-700 active:scale-98 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-md shadow-hive-600/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending code...</span>
                  </>
                ) : (
                  <>
                    <span>Continue with Email OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Step 2: OTP Verification Form */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 bg-hive-50/80 border border-hive-200/80 rounded-xl text-xs text-hive-900 leading-relaxed">
                ✨ <strong>Check your email:</strong> Click the blue <strong>"Sign in"</strong> button in your email to log in instantly, or enter the 6-digit code below.
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-warmgray-500 mb-1.5">
                  6-Digit Verification Code (Optional if clicking email link)
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warmgray-400 pointer-events-none" />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="123456"
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ''))}
                    autoFocus
                    required
                    className="w-full pl-10 pr-4 py-3 text-center tracking-widest text-xl font-bold bg-warmgray-50 border border-warmgray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-hive-500 focus:border-transparent transition-all placeholder:text-warmgray-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || otpToken.length < 6}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-hive-600 hover:bg-hive-700 active:scale-98 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-md shadow-hive-600/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying code...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Enter Hive</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2 text-xs text-warmgray-500">
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setOtpToken('');
                  }}
                  className="hover:text-warmgray-800 font-semibold"
                >
                  Change Email
                </button>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={resendCountdown > 0 || isLoading}
                  className="inline-flex items-center gap-1 hover:text-hive-700 disabled:opacity-50 disabled:hover:text-warmgray-500 font-semibold"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>
                    {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend Code'}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* Quick Demo Sign-in Helper */}
          <div className="pt-4 border-t border-warmgray-100">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-hive-600" />
              <span className="text-xs font-bold text-warmgray-700">
                Instant Demo Testing (1-Click)
              </span>
            </div>
            <p className="text-[11px] text-warmgray-500 mb-3">
              Want to test instantly without waiting for an email? Choose a persona:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {MOCK_USERS.slice(0, 4).map((mock, idx) => (
                <button
                  key={mock.id}
                  type="button"
                  onClick={() => handleQuickDemo(idx)}
                  className="flex items-center gap-2 p-2 rounded-xl bg-warmgray-50 hover:bg-hive-50 border border-warmgray-200 hover:border-hive-300 transition-colors text-left"
                >
                  <img
                    src={mock.avatar_url || ''}
                    alt={mock.username}
                    className="w-6 h-6 rounded-md object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-warmgray-800 truncate">
                      {mock.full_name}
                    </p>
                    <p className="text-[10px] text-warmgray-400 truncate">@{mock.username}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
