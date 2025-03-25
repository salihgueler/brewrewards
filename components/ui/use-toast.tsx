// Simplified toast implementation for the example
import { useState, useEffect } from 'react';

type ToastVariant = 'default' | 'destructive';

interface ToastProps {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

let toastId = 0;
const toasts: ToastProps[] = [];
let listeners: ((toasts: ToastProps[]) => void)[] = [];

export function toast(props: ToastProps) {
  const id = toastId++;
  const newToast = { ...props };
  
  toasts.push(newToast);
  
  // Notify listeners
  listeners.forEach(listener => listener([...toasts]));
  
  // Auto-dismiss after duration
  setTimeout(() => {
    const index = toasts.indexOf(newToast);
    if (index !== -1) {
      toasts.splice(index, 1);
      listeners.forEach(listener => listener([...toasts]));
    }
  }, props.duration || 3000);
  
  return {
    id,
    dismiss: () => {
      const index = toasts.indexOf(newToast);
      if (index !== -1) {
        toasts.splice(index, 1);
        listeners.forEach(listener => listener([...toasts]));
      }
    },
    update: (props: Partial<ToastProps>) => {
      const index = toasts.indexOf(newToast);
      if (index !== -1) {
        toasts[index] = { ...toasts[index], ...props };
        listeners.forEach(listener => listener([...toasts]));
      }
    }
  };
}

export function useToast() {
  const [currentToasts, setCurrentToasts] = useState<ToastProps[]>([]);
  
  useEffect(() => {
    const listener = (updatedToasts: ToastProps[]) => {
      setCurrentToasts(updatedToasts);
    };
    
    listeners.push(listener);
    
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);
  
  return {
    toast,
    toasts: currentToasts,
    dismiss: (index: number) => {
      if (index >= 0 && index < toasts.length) {
        toasts.splice(index, 1);
        listeners.forEach(listener => listener([...toasts]));
      }
    }
  };
}
