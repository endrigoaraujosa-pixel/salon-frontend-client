import { useState, useCallback, useRef, useEffect } from 'react';

export function useToast() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const showToast = useCallback((message, type = 'info', duration = 4500) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, type });
    timerRef.current = setTimeout(() => setToast(null), duration);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const ToastEl = toast ? (
    <div className={`toast ${toast.type === 'error' ? 'error' : ''}`}>
      {toast.message}
    </div>
  ) : null;

  return { showToast, ToastEl };
}

