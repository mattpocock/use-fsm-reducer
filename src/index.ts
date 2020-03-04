import { useEffect, useReducer } from 'react';

type State<TState, TEffect> = TState & {
  effects?: TEffect[];
};

interface Params<
  TState extends { type: string },
  TAction extends { type: string },
  TEffect extends { type: string }
> {
  initialState: TState;
  states: {
    [S in TState['type']]?: {
      [A in TAction['type']]?: (
        state: State<Extract<TState, { type: S }>, TEffect>,
        action: Extract<TAction, { type: A }>,
      ) => State<TState, TEffect>;
    };
  };
  effects?: {
    [K in TEffect['type']]: (params: {
      effect: Extract<TEffect, { type: K }>;
      dispatch: (action: TAction) => void;
    }) => void;
  };
  runEffectsOnMount?: TEffect[];
}

const useFsmReducer = <
  TState extends { type: string } = any,
  TAction extends { type: string } = any,
  TEffect extends { type: string } = any
>({
  initialState,
  states,
  effects,
  runEffectsOnMount,
}: Params<TState, TAction, TEffect>) => {
  const reducer = (
    state: State<TState, TEffect>,
    action: TAction,
  ): State<TState, TEffect> => {
    return (
      /**
       * If a case exists in states for
       * the current state.type, then run it.
       *
       * Otherwise, return the current state
       */
      states?.[state.type as TState['type']]?.[
        action.type as TAction['type']
      ]?.(state as any, action as any) || state
    );
  };
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    effects: runEffectsOnMount || [],
  } as State<TState, TEffect>);

  useEffect(() => {
    state.effects?.forEach((effect) => {
      /**
       * If an effect exists, call it whenever
       * the effects change
       */
      effects?.[effect.type as TEffect['type']]?.({
        dispatch,
        effect: effect as any,
      });
    });
  }, [state.effects]);

  return [state, dispatch] as const;
};

export default useFsmReducer