import { useEffect, useReducer } from 'react';

type State<TState, TEffect> = TState & {
  effects?: TEffect[];
};

export type UseFsmReducerEffects<TAction, TEffect extends { type: string }> = {
  [K in TEffect['type']]: (params: {
    effect: Extract<TEffect, { type: K }>;
    dispatch: (action: TAction) => void;
  }) => void;
};

export type UseFsmReducerStates<
  TState extends { type: string },
  TAction extends { type: string },
  TEffect extends { type: string }
> = {
  [S in TState['type']]?: {
    on?: {
      [A in TAction['type']]?: (
        state: State<Extract<TState, { type: S }>, TEffect>,
        action: Extract<TAction, { type: A }>,
      ) => State<TState, TEffect>;
    };
  };
};

export interface UseFsmReducerParams<
  TState extends { type: string },
  TAction extends { type: string },
  TEffect extends { type: string }
> {
  initialState: TState;
  states: UseFsmReducerStates<TState, TAction, TEffect>;
  effects?: UseFsmReducerEffects<TAction, TEffect>;
  on?: {
    [A in TAction['type']]?: (
      state: State<TState, TEffect>,
      action: Extract<TAction, { type: A }>,
    ) => State<TState, TEffect>;
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
  on,
  effects,
  runEffectsOnMount,
}: UseFsmReducerParams<TState, TAction, TEffect>) => {
  const reducer = (
    state: State<TState, TEffect>,
    action: TAction,
  ): State<TState, TEffect> => {
    const actionWithinState =
      states?.[state.type as TState['type']]?.on?.[
        action.type as TAction['type']
      ];

    const globalAction = on?.[action.type as TAction['type']];

    const actionToRun = actionWithinState || globalAction;
    return (
      /**
       * If a case exists in this state's 'on' for
       * the current state.type, then run it.
       *
       * If a case exists in the global 'on',
       * then run it.
       *
       * Otherwise, return the current state
       */
      actionToRun?.(state as any, action as any) || state
    );
  };
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    effects: runEffectsOnMount || [],
  } as State<TState, TEffect>);

  useEffect(() => {
    state.effects?.forEach(effect => {
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

export default useFsmReducer;
