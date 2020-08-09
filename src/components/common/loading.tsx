import React from "react";
import { Retry } from "./retry";
import { LoadingIcon } from "./loading-icon";

interface IOptions<T> {
  data?: T;
  loading?: boolean;
  error?: Error | boolean;
  load?: () => void;
}

interface IProps<T> extends IOptions<T> {
  skipDataChecking?: boolean;
  errorTips?: string;
  options?: IOptions<T>;
  render: (data?: T) => React.ReactNode;
  renderError?: () => React.ReactNode;
}

function renderLoadingError<T>(props: IProps<T>) {
  const options: IOptions<any> = props.options || {};
  const { renderError, load = options.load, errorTips } = props;

  if (renderError != null) {
    return <>{renderError()}</>;
  }

  return load ? <Retry tips={errorTips} retry={load} /> : null;
}

function isLoadFailed(data: any | any[], loading: boolean) {
  if (!loading) {
    if (Array.isArray(data)) {
      const failedDataIndex = data.findIndex((item) => item == null);
      return failedDataIndex !== -1;
    } else {
      return data == null;
    }
  }

  return false;
}

export const Loading: <T>(p: IProps<T>) => React.ReactElement<IProps<T>> | null = (props) => {
  const options: IOptions<any> = props.options || {};
  const {
    loading = options.loading || false,
    error = options.error,
    data = options.data,
    render,
    skipDataChecking,
  } = props;

  if (loading) {
    return <LoadingIcon />;
  }

  if (error != null) {
    if (error !== false) {
      return renderLoadingError(props);
    }
  } else if (!skipDataChecking && isLoadFailed(data, loading)) {
    return renderLoadingError(props);
  }

  return <>{render(data)}</>;
};
