import React, { useState, useEffect, createContext, useContext } from "react";
import produce from "immer";

export interface IRexStore<T> {
  getState: () => T;
  register: (stateGetter: () => T, stateUpdater: (state: T) => void) => void;
  unregister: () => void;
  subscribe: (f: (store: T) => void) => { unsubscribe: () => void };
  emit: () => void;
  update: (f: (store: T) => void) => Promise<void>;
  updateAt: <K extends keyof T>(k: K, v: T[K]) => Promise<void>;
}

interface IRexContainer<T> {
  listeners: ((state: T) => void)[];
  stateGetter?: () => T;
  stateUpdater?: (state: T) => void;
  updates: ((store: T) => void)[];
}

export function createStore<T>(): IRexStore<T> {
  const rexContainer: IRexContainer<T> = {
    listeners: [],
    updates: [],
  };

  let frameTimer: number | undefined;

  function applyBatchUpdate() {
    if (frameTimer == null) {
      frameTimer = requestAnimationFrame(() => {
        const getter = getStateGetter();
        const updater = getStateUpdater();
        let newState = getter();

        rexContainer.updates.forEach((f) => {
          newState = produce(newState, f);
        });

        updater(newState);

        rexContainer.updates = [];

        frameTimer = undefined;
      });
    }
  }

  function getStateUpdater() {
    if (rexContainer.stateUpdater == null) {
      throw new Error("Rex state updater is not existed. Please wrap your component by <RexProvider>");
    }

    return rexContainer.stateUpdater;
  }

  function getStateGetter() {
    if (rexContainer.stateGetter == null) {
      throw new Error("Rex state getter is not existed. Please wrap your component by <RexProvider>");
    }

    return rexContainer.stateGetter;
  }

  function getState() {
    const stateGetter = getStateGetter();

    return stateGetter();
  }

  function register(stateGetter: () => T, stateUpdater: (state: T) => void) {
    rexContainer.stateGetter = stateGetter;
    rexContainer.stateUpdater = stateUpdater;
  }

  function unregister() {
    rexContainer.stateGetter = undefined;
    rexContainer.stateUpdater = undefined;
  }

  function subscribe(f: (store: T) => void) {
    rexContainer.listeners.unshift(f);

    return {
      unsubscribe: () => {
        rexContainer.listeners = rexContainer.listeners.filter((x) => x != f);
      },
    };
  }

  function update(f: (store: T) => void) {
    rexContainer.updates.push(f);

    const promise = new Promise<void>((resolve) => {
      // one time subscribe
      const ret = subscribe(() => {
        resolve();

        ret.unsubscribe();
      });
    });

    applyBatchUpdate();

    return promise;
  }

  function updateAt<K extends keyof T>(k: K, v: T[K]) {
    return update((store) => {
      store[k] = v;
    });
  }

  function emit() {
    rexContainer.listeners.forEach((cb) => {
      cb(getState());
    });
  }

  return {
    getState,
    register,
    unregister,
    subscribe,
    emit,
    update,
    updateAt,
  };
}

// Context

const RexContext = createContext<any>(null);

// Context Provider

interface IRexProviderProps<T> {
  store: IRexStore<T>;
  initialValue?: T;
}

export function RexProvider<T>(
  props: React.PropsWithChildren<IRexProviderProps<T>>,
): React.ReactElement<IRexProviderProps<T>> | null {
  const [storeValue, setStoreValue] = useState(props.initialValue || ({} as T));

  useEffect(() => {
    props.store.register(() => storeValue, setStoreValue);

    props.store.emit();

    return () => {
      props.store.unregister();
    };
  }, [storeValue]);

  return <RexContext.Provider value={storeValue}>{props.children}</RexContext.Provider>;
}

export function useRexContext<S, T>(selector: (s: S) => T): T {
  // [Caution on performance] components use useContext will be called on every change
  const contextValue = useContext(RexContext);

  return selector(contextValue);
}
