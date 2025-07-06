export const Amplify = {
  configure: jest.fn(),
  Auth: {
    signIn: jest.fn(),
    signOut: jest.fn(),
    currentAuthenticatedUser: jest.fn(),
  },
  API: {
    graphql: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    del: jest.fn(),
  },
  Storage: {
    get: jest.fn(),
    put: jest.fn(),
    remove: jest.fn(),
    list: jest.fn(),
  },
};
