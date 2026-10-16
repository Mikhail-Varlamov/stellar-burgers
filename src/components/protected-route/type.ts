import type { ReactNode } from 'react';

export type ProtectedRouteProps = {
  onlyUnAuth?: boolean;
  children: ReactNode;
};
