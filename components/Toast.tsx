import React, { useEffect, useState } from 'react';
import type { ToastInfo } from '../types';
import { ToastType } from '../types';
import { UndoIcon } from './icons/UndoIcon';

interface ToastProps {
  info: ToastInfo | null;
  onClear: () => void;
}

export const Toast: React.FC<ToastProps> = ({ info, onClear }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: number | undefined;
    if (info) {
      setVisible(true);
      const duration = info.action ? 7000 : 3000;
      timer = window.setTimeout(() => {
        setVisible(false);
        // Allow time for fade-out animation before clearing the message
        setTimeout(onClear, 300); 
      }, duration);
    } else {
      setVisible(false);
    }
    return () => clearTimeout(timer);
  }, [info, onClear]);

  if (!info) return null;

  const toastStyles = {
    [ToastType.INFO]: 'bg-gray-700 text-white',
    [ToastType.DANGER]: 'bg-red-800 text-red-100',
  };

  const handleActionClick = () => {
    if (info.action?.onClick) {
      info.action.onClick();
    }
  }

  return (
    <div
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${toastStyles[info.type]} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      }`}
    >
      <span>{info.message}</span>
      {info.action && (
        <button onClick={handleActionClick} className="flex items-center gap-1.5 font-bold text-sm bg-black/20 hover:bg-black/40 px-3 py-1 rounded-md transition">
           <UndoIcon className="w-4 h-4" />
           {info.action.label}
        </button>
      )}
    </div>
  );
};
