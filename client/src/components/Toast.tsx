import { useToastStore } from '../stores/toast.store';
import '../styles/components.css';

export const Toast = () => {
  const { toasts, removeToast } = useToastStore();

  const getToastClasses = (type: string) => {
    const baseClasses = 'toast-message';
    switch (type) {
      case 'success':
        return `${baseClasses} toast-success`;
      case 'error':
        return `${baseClasses} toast-error`;
      case 'warning':
        return `${baseClasses} toast-warning`;
      case 'info':
        return `${baseClasses} toast-info`;
      default:
        return baseClasses;
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={getToastClasses(toast.type)}
          onClick={() => removeToast(toast.id)}
        >
          <p>{toast.message}</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeToast(toast.id);
            }}
            className="toast-close-btn"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};