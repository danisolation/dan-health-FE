import { useState, useEffect, useCallback, useRef } from "react";

interface UseApiDataOptions {
  /** Tự động set document title */
  pageTitle?: string;
}

interface UseApiDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * Hook để fetch data từ API với loading, error states, retry và page title.
 * @param fetcher — async function trả về data
 * @param deps — dependency array để re-fetch
 * @param options — cấu hình thêm (pageTitle)
 */
export function useApiData<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList,
  options?: UseApiDataOptions,
): UseApiDataReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetcherRef.current()
      .then(setData)
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : "Lỗi không xác định";
        setError(msg);
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (options?.pageTitle) {
      document.title = `${options.pageTitle} — Amazfit Health`;
      return () => { document.title = "Amazfit Health Dashboard"; };
    }
  }, [options?.pageTitle]);

  return { data, loading, error, retry: load };
}
