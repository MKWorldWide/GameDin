import React, { useEffect, useState } from 'react';
import { useToast } from '../context/ToastContext';

const Toast: React.FC = () => {
  const { toastMessage } = useToast();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (toastMessage) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 2700); // Should be slightly less than the timeout in context
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  if (!toastMessage) return null;

  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 bg-accent text-on-accent px-6 py-3 rounded-full shadow-lg z-50 transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}
      role="alert"
    >
      {toastMessage}
    </div>
  );
};

export default Toast;