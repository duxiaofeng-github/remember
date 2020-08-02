import React, { useState } from "react";

async function submitData<D, R>(options: {
  data?: D;
  submitter: (data?: D) => Promise<R>;
  setSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<Error | undefined>>;
  setResult: React.Dispatch<React.SetStateAction<R | undefined>>;
}) {
  const { data, submitter, setSubmitting, setError, setResult } = options;

  setSubmitting(true);
  setError(undefined);

  try {
    const result = await submitter(data);

    setResult(result);
  } catch (e) {
    setError(e);

    throw e;
  } finally {
    setSubmitting(false);
  }
}

interface Submission<D, R> {
  result?: R;
  error?: Error;
  submitting: boolean;
  triggerer: (data?: D) => Promise<void>;
}

export function useSubmission<D, R>(
  submitter: (data?: D) => Promise<R>
): Submission<D, R> {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [result, setResult] = useState<R | undefined>(undefined);

  function triggerer(data?: D) {
    return submitData<D, R>({
      data,
      submitter,
      setSubmitting,
      setError,
      setResult
    });
  }

  return { result, error, submitting, triggerer };
}
