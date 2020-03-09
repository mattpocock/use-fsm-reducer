import useFsmReducer from '../src/index';

type State =
  | {
      type: 'initial';
      email: string;
      password: string;
      formError?: string;
    }
  | {
      type: 'pending';
      email: string;
      password: string;
    }
  | { type: 'errored'; error: string }
  | { type: 'success' };

type Action =
  | {
      type: 'submitForm';
      values: {
        email: string;
        password: string;
      };
    }
  | {
      type: 'changeValue';
      input: 'email' | 'password';
      value: string;
    }
  | {
      type: 'reportSubmitSuccess';
    }
  | {
      type: 'clickBackButton';
    }
  | {
      type: 'reportSubmitError';
    };

type Effect =
  | {
      type: 'submitForm';
      values: {
        email: string;
        password: string;
      };
    }
  | { type: 'navigateAwayFromPage' };

export const useFormLogic = () => {
  return useFsmReducer<State, Action, Effect>({
    initialState: { type: 'initial', email: '', password: '' },
    states: {
      initial: {
        changeValue: (state, action) => {
          return {
            ...state,
            type: 'initial',
            [action.input]: action.value,
            formError: '',
          };
        },
        submitForm: (state, action) => {
          if (!state.password || !state.email) {
            return {
              ...state,
              type: 'initial',
              formError: 'You must include all values above.',
            };
          }
          return {
            ...state,
            type: 'pending',
            effects: [
              {
                type: 'submitForm',
                values: { email: state.email, password: state.password },
              },
            ],
          };
        },
      },
      pending: {
        reportSubmitError: () => {
          return {
            type: 'errored',
            error: 'Oh no, something bad happened.',
          };
        },
        reportSubmitSuccess: () => {
          return {
            type: 'success',
          };
        },
      },
      errored: {
        clickBackButton: state => {
          return {
            ...state,
            effects: [{ type: 'navigateAwayFromPage' }],
          };
        },
      },
      success: {
        clickBackButton: state => {
          return {
            ...state,
            effects: [{ type: 'navigateAwayFromPage' }],
          };
        },
      },
    },
    effects: {
      navigateAwayFromPage: () => {
        window.location.href = '/';
      },
      submitForm: ({ dispatch, effect }) => {
        fetch(
          `user-token?email=${effect.values.email}&password=${effect.values.password}`,
        )
          .then(() => {
            dispatch({ type: 'reportSubmitSuccess' });
          })
          .catch(() => {
            dispatch({ type: 'reportSubmitError' });
          });
      },
    },
  });
};
