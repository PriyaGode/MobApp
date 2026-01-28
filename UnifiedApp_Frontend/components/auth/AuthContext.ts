import React from 'react';

export type AuthUI = {
  authedEmail: string | null;
  setAuthedEmail: (v: string | null) => void;
  // Which screen to show first when unauthenticated
  unauthStart: 'Login' | 'AuthLanding';
  setUnauthStart: (v: 'Login' | 'AuthLanding') => void;
};

export const AuthUIContext = React.createContext<AuthUI>({
  authedEmail: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setAuthedEmail: () => {},
  unauthStart: 'Login',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setUnauthStart: () => {},
});
