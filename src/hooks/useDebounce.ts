import { useEffect, useState } from "react";

/**
 * useDebounce
 * Trả về giá trị đã debounce sau delay milliseconds.
 *
 * @example
 * const debounced = useDebounce(value, 500);
 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debouncedValue;
}
