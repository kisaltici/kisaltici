import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import './Toast.css';

/**
 * App-wide toast notifications: every warning, error and confirmation appears at the top centre of the screen,
 * fades in, stays for 3 seconds (paused while hovered or focused) and fades out.
 *
 *   const toast = useToast();
 *   toast.error('Something went wrong');
 *   toast.info('Heads up');
 *   toast.success('Saved');
 *   toast.show(message, type, { action: { label, onClick } });
 */
const ToastContext = createContext(null);

const VISIBLE_MS = 3000;
const FADE_MS = 260;
const MAX_TOASTS = 3;
const DEDUPE_MS = 600;

let toastId = 0;

const Icon = ({ type }) => {
  if (type === 'success') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="8 12.5 11 15.5 16 9" />
      </svg>
    );
  }
  if (type === 'info') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
};

function ToastItem({ toast, onDone }) {
  const [phase, setPhase] = useState('enter'); // enter -> show -> leave
  const timer = useRef(null);
  const paused = useRef(false);
  const remaining = useRef(VISIBLE_MS);
  const startedAt = useRef(0);

  const leave = useCallback(() => {
    setPhase('leave');
    window.setTimeout(() => onDone(toast.id), FADE_MS);
  }, [onDone, toast.id]);

  const arm = useCallback(() => {
    window.clearTimeout(timer.current);
    startedAt.current = Date.now();
    timer.current = window.setTimeout(leave, remaining.current);
  }, [leave]);

  useEffect(() => {
    // next frame: switch to the visible state so the fade-in transition runs
    const frame = requestAnimationFrame(() => setPhase('show'));
    arm();
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer.current);
    };
  }, [arm]);

  const pause = () => {
    if (paused.current) return;
    paused.current = true;
    window.clearTimeout(timer.current);
    remaining.current = Math.max(800, remaining.current - (Date.now() - startedAt.current));
  };

  const resume = () => {
    if (!paused.current) return;
    paused.current = false;
    arm();
  };

  return (
    <div
      className={`kToast kToast--${toast.type} ${phase === 'show' ? 'isIn' : ''} ${phase === 'leave' ? 'isOut' : ''}`}
      role={toast.type === 'error' ? 'alert' : 'status'}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
    >
      <span className="kToastIcon">
        <Icon type={toast.type} />
      </span>
      <span className="kToastText">{toast.message}</span>
      {toast.action && (
        <button
          type="button"
          className="kToastAction"
          onClick={() => {
            toast.action.onClick();
            leave();
          }}
        >
          {toast.action.label}
        </button>
      )}
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const last = useRef({ message: '', time: 0 });

  const remove = useCallback((id) => setToasts((current) => current.filter((item) => item.id !== id)), []);

  const show = useCallback((message, type = 'error', options = {}) => {
    if (!message) return;
    const now = Date.now();
    // Same message within a moment (double clicks, repeated renders): show it once
    if (last.current.message === message && now - last.current.time < DEDUPE_MS) return;
    last.current = { message, time: now };
    toastId += 1;
    const item = { id: toastId, message: String(message), type, action: options.action || null };
    setToasts((current) => [...current.slice(-(MAX_TOASTS - 1)), item]);
  }, []);

  const api = useMemo(
    () => ({
      show,
      error: (message, options) => show(message, 'error', options),
      info: (message, options) => show(message, 'info', options),
      success: (message, options) => show(message, 'success', options),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="kToastStack" aria-live="polite">
        {toasts.map((item) => (
          <ToastItem key={item.id} toast={item} onDone={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}
