import React from 'react';

export const Authenticator = ({ children }: { children: any }) => {
  return children({
    signOut: jest.fn(),
    user: null,
  });
};
