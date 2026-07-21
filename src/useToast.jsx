import { useState, useCallback } from 'react';

export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const ToastEl = toast ? (
    <div className={`toast ${toast.type === 'error' ? 'error' : ''}`}>
      {toast.message}
    </div>
  ) : null;

  return { showToast, ToastEl };
}
