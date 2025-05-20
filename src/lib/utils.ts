// File: src/lib/utils.ts
// Purpose: Utility functions for common operations used throughout the application.
// Owner: Advo Team

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names or conditional classes into a single string.
 * Uses clsx for conditional class merging and tailwind-merge to handle Tailwind CSS conflicts.
 *
 * @param inputs - Any number of class strings, objects, or arrays to be merged
 * @returns A single string of merged and deduplicated class names
 *
 * @example
 * // Basic usage
 * cn('text-red-500', 'bg-blue-500') // 'text-red-500 bg-blue-500'
 *
 * @example
 * // With conditional classes
 * cn('btn', isActive && 'btn-active') // 'btn btn-active' or 'btn'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
