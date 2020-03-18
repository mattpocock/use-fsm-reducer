# useFsmReducer

Heavily inspired by [David Khourshid's article](https://dev.to/davidkpiano/redux-is-half-of-a-pattern-1-2-1hd7).

`useFsmReducer` is a hook which helps to bring state machine code quality to a common React pattern - `useReducer`.

It helps you bootstrap a reducer, similar to [redux-toolkit](https://redux-toolkit.js.org/), but also helps extract your effects and help you scale complexity.

### Installation

`npm i use-fsm-reducer`

# Example Code

```ts
import useFsmReducer from 'use-fsm-reducer';

/**
 * Our state can be in any of these states.
 * Note that data is only declared when we're in
 * the 'loaded' state.
 */
type State =
  | { type: 'pending' }
  | { type: 'errored' }
  | { type: 'loaded'; data: string };

/**
 * We declare all possible actions that can flow
 * through this reducer
 */
type Action =
  | { type: 'reportDataLoaded'; data: string }
  | { type: 'reportError' }
  | { type: 'retry' };

/**
 * We declare all effects that this reducer can fire off.
 *
 * An effect is anything you would put inside a useEffect - an
 * impure function that happens as a result of piece
 * of state changing, or an action firing.
 */
type Effect =
  | { type: 'loadData' }
  | { type: 'showErrorMessage'; message: string };

/**
 * You get back state and dispatch, the API you're
 * used to from useReducer
 */
const [state, dispatch] = useFsmReducer<State, Action, Effect>({
  /**
   * Here, we declare the initial state. Each state
   * must have a 'type'.
   */
  initialState: {
    type: 'pending',
  },
  /**
   * We can run some initial effects on mount.
   */
  runEffectsOnMount: [{ type: 'loadData' }],
  states: {
    /**
     * Each state can handle actions on its own,
     * and fire off effects.
     */
    pending: {
      on: {
        reportDataLoaded: (state, action) => {
          return {
            type: 'loaded',
            data: action.data,
          };
        },
        reportError: () => {
          return {
            type: 'errored',
            /**
             * Return an array of all the effects
             * you'd like this state change to trigger
             */
            effects: [{ type: 'showErrorMessage', message: 'Oh noooo!' }],
          };
        },
      },
    },
    errored: {
      on: {
        retry: () => {
          return {
            type: 'pending',
            effects: [{ type: 'loadData' }],
          };
        },
      },
    },
  },
  effects: {
    loadData: ({ dispatch }) => {
      /** Fetch some data and fire off more actions */
      fetch('...')
        .then(res => res.json())
        .then(data => {
          dispatch({ type: 'reportDataLoaded', data: JSON.stringify(data) });
        })
        .catch(() => {
          dispatch({ type: 'reportError' });
        });
    },
    showErrorMessage: ({ effect }) => {
      console.error(effect.message);
    },
  },
});
```

> There's another example in [examples/form.ts](./examples/form.ts)
