import React, { useState, useEffect, DependencyList } from "react";

async function loadData<T>(options: {
  loader: () => Promise<T>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<Error | false>>;
  setData: React.Dispatch<React.SetStateAction<T | undefined>>;
}) {
  const { loader, setLoading, setError, setData } = options;

  setLoading(true);
  setError(false);

  try {
    const data = await loader();

    setData(data);
  } catch (e) {
    setError(e);

    throw e;
  } finally {
    setLoading(false);
  }
}

interface DataResult<T> {
  data?: T;
  error: Error | false;
  loading: boolean;
  setData: React.Dispatch<React.SetStateAction<T | undefined>>;
  retry: () => Promise<void>;
}

export function useData<T>(
  loader: () => Promise<T>,
  dependencies?: DependencyList,
  cleanup?: () => void
): DataResult<T> {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | false>(false);
  const [data, setData] = useState<T | undefined>(undefined);

  function retry() {
    return loadData<T>({ loader, setLoading, setError, setData });
  }

  useEffect(() => {
    loadData<T>({ loader, setLoading, setError, setData });

    return cleanup;
  }, dependencies || []);

  return { data, error, loading, setData, retry };
}
