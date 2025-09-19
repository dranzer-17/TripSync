// src/hooks/useDebounce.ts

import { useState, useEffect } from 'react';

/**
 * A custom React hook that debounces a value.
 * This is useful for delaying an expensive operation (like an API call)
 * until the user has stopped typing for a specified period.
 * @param value The value to debounce (e.g., a search query).
 * @param delay The debounce delay in milliseconds.
 * @returns The debounced value, which only updates after the delay.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the specified delay.
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if the value changes before the delay has passed.
    // This prevents the debounced value from updating prematurely.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Only re-run the effect if value or delay changes.

  return debouncedValue;
}