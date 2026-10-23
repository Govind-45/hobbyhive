import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  KeyRound,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MOCK_USERS } from '../lib/mockData';

type AuthViewMode =
  | 'signin'
  | 'signup'
  | 'verify_signup'
  | 'forgot'
  | 'verify_reset';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    signInWithPassword,
    signUpWithPassword,
    verifySignupOtp,
    resetPasswordRequest,
    verifyResetOtp,
    quickDemoLogin,
    isDemoMode,
  } = useAuth();

  const [mode, setMode] = useState<AuthViewMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(30);

  // Auto-close when user logs in
  useEffect(() => {
    if (user && isOpen) {
      onClose();
    }
  }, [user, isOpen, onClose]);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setMode('signin');
      setEmail('');
      setPassword('');
      setFullName('');
      setUsername('');
      setOtpToken('');
      setNewPassword('');
      setErrorMsg(null);
      setSuccessNotice(null);
      setShowPassword(false);
    }
  }, [isOpen]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (
      (mode !== 'verify_signup' && mode !== 'verify_reset') ||
      resendCountdown <= 0
    ) {
      return;
    }
    const timer = setInterval(() => {
      setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [mode, resendCountdown]);

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

  if (!isOpen) return null;

  // 1. Handle Sign In (Email + Password) - No OTP needed!
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessNotice(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg('Please enter your email.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);
    const { error } = await signInWithPassword(trimmedEmail, password);
    setIsLoading(false);

    if (error) {
      setErrorMsg(
        error.message === 'Invalid login credentials'
          ? 'Incorrect email or password. Please try again or create an account.'
          : error.message
      );
      return;
    }

    onClose();
  };

  // 2. Handle Sign Up (Triggers OTP verification for new accounts)
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessNotice(null);

    const trimmedEmail = email.trim();
    const trimmedName = fullName.trim();
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

    if (!trimmedName) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!cleanUsername || cleanUsername.length < 3) {
      setErrorMsg('Username must be at least 3 letters or numbers.');
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    const { error, needsEmailVerification } = await signUpWithPassword(
      trimmedEmail,
      password,
      trimmedName,
      cleanUsername
    );
    setIsLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Failed to create account. Please try again.');
      return;
    }

    if (needsEmailVerification) {
      setMode('verify_signup');
      setResendCountdown(30);
      setSuccessNotice(
        isDemoMode
          ? 'Verification code: Enter any 6-digit number (e.g. 123456) to confirm!'
          : `We sent a 6-digit confirmation code to ${trimmedEmail}`
      );
    } else {
      onClose();
    }
  };

  // 3. Handle Verify Signup OTP
  const handleVerifySignupOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedCode = otpToken.trim();
    if (trimmedCode.length < 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    const { error } = await verifySignupOtp(email.trim(), trimmedCode);
    setIsLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Invalid or expired code. Please try again.');
      return;
    }

    onClose();
  };

  // 4. Handle Forgot Password Request
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    setIsLoading(true);
    const { error } = await resetPasswordRequest(trimmedEmail);
    setIsLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Failed to send reset code.');
      return;
    }

    setMode('verify_reset');
    setResendCountdown(30);
    setSuccessNotice(`Password reset code sent to ${trimmedEmail}`);
  };

  // 5. Handle Verify Reset OTP & Set New Password
  const handleVerifyResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedCode = otpToken.trim();
    if (trimmedCode.length < 6) {
      setErrorMsg('Please enter the 6-digit code.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    const { error } = await verifyResetOtp(email.trim(), trimmedCode, newPassword);
    setIsLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Invalid code or password reset failed.');
      return;
    }

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
              {mode === 'signin' && 'Welcome Back'}
              {mode === 'signup' && 'Create Your Account'}
              {mode === 'verify_signup' && 'Verify Your Email'}
              {mode === 'forgot' && 'Reset Password'}
              {mode === 'verify_reset' && 'Set New Password'}
            </h2>
            <p className="text-xs text-warmgray-500 mt-0.5">
              {mode === 'signin' && 'Sign in with your registered email and password'}
              {mode === 'signup' && 'Join the Hive community to share and discuss hobbies'}
              {mode === 'verify_signup' && `Enter the OTP sent to ${email}`}
              {mode === 'forgot' && 'Enter your registered email to receive an OTP code'}
              {mode === 'verify_reset' && 'Enter the OTP code and your new password'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-warmgray-400 hover:text-warmgray-700 hover:bg-warmgray-200/80 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
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

          {/* ============================================================== */}
          {/* 1. SIGN IN (Email + Password — NO OTP!)                         */}
          {/* ============================================================== */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
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
                    className="w-full pl-10 pr-4 py-2.5 text-sm font-medium bg-warmgray-50 border border-warmgray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-hive-500 transition-all placeholder:text-warmgray-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-warmgray-500">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMsg(null);
                      setSuccessNotice(null);
                    }}
                    className="text-xs text-hive-700 hover:text-hive-800 font-semibold"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warmgray-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-sm font-medium bg-warmgray-50 border border-warmgray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-hive-500 transition-all placeholder:text-warmgray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-warmgray-400 hover:text-warmgray-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email.trim() || !password}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-hive-600 hover:bg-hive-700 active:scale-98 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-md shadow-hive-600/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2 text-xs text-warmgray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                    setSuccessNotice(null);
                  }}
                  className="font-bold text-hive-700 hover:underline"
                >
                  Create one now
                </button>
              </div>
            </form>
          )}

          {/* ============================================================== */}
          {/* 2. SIGN UP (Email, Password, Name -> Sends OTP)                */}
          {/* ============================================================== */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-warmgray-500 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Alex Morgan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm bg-warmgray-50 border border-warmgray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-hive-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-warmgray-500 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    placeholder="alex_m"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm bg-warmgray-50 border border-warmgray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-hive-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-warmgray-500 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warmgray-400 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2 text-sm bg-warmgray-50 border border-warmgray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-hive-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-warmgray-500 mb-1">
                  Create Password (min 6 chars)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warmgray-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2 text-sm bg-warmgray-50 border border-warmgray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-hive-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-warmgray-400 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-hive-50 border border-hive-200 text-[11px] text-hive-900 leading-snug">
                🔒 You will receive a 6-digit confirmation code on this email to activate your account.
              </div>

              <button
                type="submit"
                disabled={isLoading || !email.trim() || password.length < 6}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-hive-600 hover:bg-hive-700 active:scale-98 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-md shadow-hive-600/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Sign Up with Email OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-1 text-xs text-warmgray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg(null);
                    setSuccessNotice(null);
                  }}
                  className="font-bold text-hive-700 hover:underline"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* ============================================================== */}
          {/* 3. VERIFY SIGNUP OTP                                           */}
          {/* ============================================================== */}
          {mode === 'verify_signup' && (
            <form onSubmit={handleVerifySignupOtp} className="space-y-4">
              <div className="p-3 bg-hive-50 border border-hive-200 rounded-xl text-xs text-hive-900 leading-relaxed">
                ✉️ Enter the 6-digit verification code sent to <strong>{email}</strong> (or click the confirmation link in your email).
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-warmgray-500 mb-1.5">
                  6-Digit Verification Code
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
                    className="w-full pl-10 pr-4 py-3 text-center tracking-widest text-xl font-bold bg-warmgray-50 border border-warmgray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-hive-500 transition-all placeholder:text-warmgray-300"
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

              <div className="flex items-center justify-between pt-1 text-xs text-warmgray-500">
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="hover:text-warmgray-800 font-semibold"
                >
                  Change Email
                </button>
                <button
                  type="button"
                  onClick={handleSignUp}
                  disabled={resendCountdown > 0 || isLoading}
                  className="inline-flex items-center gap-1 hover:text-hive-700 disabled:opacity-50 font-semibold"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>
                    {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend Code'}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* ============================================================== */}
          {/* 4. FORGOT PASSWORD (Request OTP)                               */}
          {/* ============================================================== */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-warmgray-500 mb-1.5">
                  Enter Your Registered Email
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
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-warmgray-50 border border-warmgray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-hive-500"
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
                    <span>Sending reset code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Code (OTP)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-1 text-xs text-warmgray-600">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="font-bold text-hive-700 hover:underline"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* ============================================================== */}
          {/* 5. VERIFY RESET OTP & SET NEW PASSWORD                         */}
          {/* ============================================================== */}
          {mode === 'verify_reset' && (
            <form onSubmit={handleVerifyResetOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-warmgray-500 mb-1.5">
                  6-Digit Reset Code
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
                    className="w-full pl-10 pr-4 py-2.5 text-center tracking-widest text-lg font-bold bg-warmgray-50 border border-warmgray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-hive-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-warmgray-500 mb-1.5">
                  New Password (min 6 chars)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warmgray-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-warmgray-50 border border-warmgray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-hive-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-warmgray-400 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || otpToken.length < 6 || newPassword.length < 6}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-hive-600 hover:bg-hive-700 active:scale-98 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-md shadow-hive-600/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Resetting password...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Reset Password & Sign In</span>
                  </>
                )}
              </button>

              <div className="text-center pt-1 text-xs text-warmgray-600">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="font-semibold text-warmgray-700 hover:underline"
                >
                  Cancel & Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* Quick Demo Sign-in Personas (always available) */}
          <div className="pt-3 border-t border-warmgray-100">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-hive-600" />
              <span className="text-xs font-bold text-warmgray-700">
                Instant Demo Testing (1-Click)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {MOCK_USERS.slice(0, 4).map((mock, idx) => (
                <button
                  key={mock.id}
                  type="button"
                  onClick={() => {
                    quickDemoLogin(idx);
                    onClose();
                  }}
                  className="flex items-center gap-2 p-1.5 px-2 rounded-xl bg-warmgray-50 hover:bg-hive-50 border border-warmgray-200 hover:border-hive-300 transition-colors text-left"
                >
                  <img
                    src={mock.avatar_url || ''}
                    alt={mock.username}
                    className="w-5 h-5 rounded-md object-cover"
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
