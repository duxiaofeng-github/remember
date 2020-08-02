import { useState, useEffect } from "react";

export type Callback<V> = (state: V) => void;
export type Dispatcher<V> = (value: V, callback?: Callback<V>) => void;
export type State<V> = { value: V; callback?: Callback<V> };

export function useCallbackState<V>(initialState: V): [V, Dispatcher<V>] {
  const [state, setState] = useState<State<V>>({
    value: initialState,
    callback: undefined,
  });

  const dispatcher: Dispatcher<V> = (value, callback) => {
    setState({ value, callback });
  };

  useEffect(() => {
    if (state.callback != null) {
      state.callback(state.value);
    }
  }, [state]);

  return [state.value, dispatcher];
}
