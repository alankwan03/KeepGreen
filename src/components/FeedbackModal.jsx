import React from 'react';
import {
  X,
  MessageSquare,
  Send,
  Copy,
  Check,
  Loader2,
  AlertCircle
} from './Icons.jsx';

const { useState, useEffect } = window.React || React;

const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwLp0-Z69a7V9XslyhbNUWKCKhMUU78JLi-k6YjgUSlH6z3K96dYaFm9HAywO3CGIz4/exec';
const APP_VERSION = 'v0.01 (alpha)';

const CATEGORIES = [
  { id: 'General Comment', label: '✨ General Comment' },
  { id: 'Feature Idea', label: '💡 Feature Idea' },
  { id: 'Bug / Issue', label: '🐛 Bug / Issue' }
];

export function FeedbackModal({ isOpen, onClose, anonymousId = 'KG-UNKNOWN', plantCount = 0 }) {
  const [category, setCategory] = useState('General Comment');
  const [userName, setUserName] = useState('');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [commentError, setCommentError] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isSubmitting]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSubmitSuccess(false);
      setErrorMessage('');
      setCopied(false);
      setCommentError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  const getDeviceType = () => {
    if (typeof window === 'undefined') return 'Desktop';
    const isMobileScreen = window.innerWidth < 768;
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || '');
    return isMobileScreen || isMobileUA ? 'Mobile' : 'Desktop';
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!comments.trim()) {
      setCommentError(true);
      return;
    }

    setCommentError(false);
    setIsSubmitting(true);
    setErrorMessage('');

    const payload = {
      category: category,
      comments: comments.trim(),
      userName: userName.trim() || 'Anonymous',
      anonymousId: anonymousId,
      version: APP_VERSION,
      device: getDeviceType(),
      plantCount: Number(plantCount) || 0
    };

    try {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // Google Apps Script redirect resolution with no-cors
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setComments('');

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Feedback submission error:', err);
      setIsSubmitting(false);
      setErrorMessage('Failed to send feedback. Please try again or copy for WhatsApp.');
    }
  };

  const handleCopyForWhatsApp = () => {
    const textToCopy = `🌿 *KeepGreen Feedback*
• *Category:* ${category}
• *From:* ${userName.trim() || 'Anonymous'}
• *Metadata:* ${APP_VERSION} • ID: ${anonymousId} • Plants: ${plantCount} (${getDeviceType()})

💬 *Comments:*
${comments.trim() || '(No comments provided)'}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }).catch(() => {
        fallbackCopy(textToCopy);
      });
    } else {
      fallbackCopy(textToCopy);
    }
  };

  const fallbackCopy = (text) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Fallback copy failed', err);
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-zinc-950/70 backdrop-blur-sm animate-fade-in w-full max-w-full overflow-x-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-dialog-title"
    >
      <div className="relative w-full max-w-full md:max-w-lg bg-white dark:bg-zinc-900 rounded-t-3xl md:rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92vh] md:max-h-[85vh] animate-slide-up md:animate-fade-in">
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto my-2 md:hidden shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl shadow-md shadow-emerald-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="feedback-dialog-title" className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                  Feedback & Suggestions
                </h2>
                <span className="text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full px-2 py-0.5">
                  {APP_VERSION}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-500 font-medium">
                Report a bug, suggest an idea, or share your thoughts.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close dialog"
            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Success Banner */}
          {submitSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-3 animate-fade-in">
              <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <div>
                <p className="font-bold text-sm">Thank you!</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">Your feedback has been sent successfully.</p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-center gap-2.5 text-xs animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Category Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Feedback Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition text-center truncate ${
                    category === cat.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/30'
                      : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/80 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* User Name Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Your Name <span className="font-normal text-zinc-400">(Optional)</span>
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Sarah M."
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Comments Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Comments & Feedback <span className="text-rose-500">*</span>
              </label>
              {commentError && (
                <span className="text-[11px] font-semibold text-rose-500">Please enter your feedback</span>
              )}
            </div>
            <textarea
              rows={4}
              value={comments}
              onChange={(e) => {
                setComments(e.target.value);
                if (commentError && e.target.value.trim()) setCommentError(false);
              }}
              placeholder="Tell us what happened or what you'd like to see..."
              className={`w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border rounded-xl text-xs sm:text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none ${
                commentError
                  ? 'border-rose-400 ring-2 ring-rose-300/40'
                  : 'border-zinc-200 dark:border-zinc-700'
              }`}
            />
          </div>

          {/* Metadata Preview Box (Muted, subtle info strip) */}
          <div className="px-3.5 py-2.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/50 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between flex-wrap gap-1">
            <span>App: <strong className="text-zinc-700 dark:text-zinc-300">{APP_VERSION}</strong></span>
            <span>•</span>
            <span>ID: <code className="text-emerald-700 dark:text-emerald-400 font-mono font-medium">{anonymousId}</code></span>
            <span>•</span>
            <span>Plants: <strong className="text-zinc-700 dark:text-zinc-300">{plantCount}</strong></span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isSubmitting || submitSuccess}
              className={`w-full py-3 px-4 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                isSubmitting || submitSuccess
                  ? 'bg-emerald-600/70 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] shadow-emerald-600/25'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Feedback...</span>
                </>
              ) : submitSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Feedback Sent!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Feedback</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopyForWhatsApp}
              className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 transition flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-600 font-bold">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy for WhatsApp</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
