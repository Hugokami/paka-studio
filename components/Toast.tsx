import React, { useEffect } from 'react';

interface ToastProps {
  toast: {
    message: string;
    type: 'success' | 'error';
  } | null;
  onClose: () => void;
}

const SuccessIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const ErrorIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>;
const CloseIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>;

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // 5 seconds
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) {
    return null;
  }

  const isError = toast.type === 'error';
  const bgColor = isError ? 'bg-red-900/95 border-red-700' : 'bg-green-900/95 border-green-700';
  const textColor = isError ? 'text-red-200' : 'text-green-200';
  const Icon = isError ? ErrorIcon : SuccessIcon;

  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 max-w-sm w-full p-4 rounded-xl shadow-lg border backdrop-blur-sm z-[60] animate-toast-in ${bgColor} ${textColor}`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1 pt-0.5">
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={onClose}
            className="inline-flex rounded-md text-current/70 hover:text-current focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white"
          >
            <span className="sr-only">Close</span>
            <CloseIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
