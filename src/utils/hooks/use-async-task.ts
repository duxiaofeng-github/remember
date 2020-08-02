import { useState } from "react";

interface Result<D> {
  execute: (data: D) => void;
  cancel: () => void;
  canceled: boolean;
}

export function useAsyncTask<D>(task: (data: D) => void): Result<D> {
  const [canceled, setCanceled] = useState(false);

  return {
    execute: (data: D) => {
      if (!canceled) {
        task(data);
      }
    },
    cancel: () => {
      setCanceled(true);
    },
    canceled,
  };
}
