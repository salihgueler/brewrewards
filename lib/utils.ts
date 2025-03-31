import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
/**
 * Format a number as currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}
/**
 * Format a date string to a human-readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/**
 * Format a date to a relative time string (e.g., "in 2 days" or "3 days ago")
 */
export function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
  
  // Future date
  if (diffInSeconds > 0) {
    const days = Math.floor(diffInSeconds / 86400);
    const hours = Math.floor((diffInSeconds % 86400) / 3600);
    
    if (days > 0) {
      return `Expires in ${days} day${days !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `Expires in ${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      const minutes = Math.floor((diffInSeconds % 3600) / 60);
      return `Expires in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
  }
  
  // Past date
  const absDiffInSeconds = Math.abs(diffInSeconds);
  const days = Math.floor(absDiffInSeconds / 86400);
  const hours = Math.floor((absDiffInSeconds % 86400) / 3600);
  
  if (days > 0) {
    return `Expired ${days} day${days !== 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `Expired ${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else {
    const minutes = Math.floor((absDiffInSeconds % 3600) / 60);
    return `Expired ${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }
}
// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

// Format date
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}
