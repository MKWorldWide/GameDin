import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock modules
jest.mock('aws-amplify');
jest.mock('@aws-amplify/ui-react');
jest.mock('../aws-exports', () => ({
  __esModule: true,
  default: {
    aws_project_region: 'us-east-1',
    aws_cognito_identity_pool_id: 'test-identity-pool-id',
    aws_cognito_region: 'us-east-1',
    aws_user_pools_id: 'test-user-pool-id',
    aws_user_pools_web_client_id: 'test-client-id',
    aws_appsync_graphqlEndpoint: 'https://test.appsync-api.us-east-1.amazonaws.com/graphql',
    aws_appsync_region: 'us-east-1',
    aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS'
  }
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => {
      return (
        <actual.MemoryRouter>
          {children}
        </actual.MemoryRouter>
      );
    },
    Routes: actual.Routes,
    Route: actual.Route
  };
});

describe('App', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<App />);
    
    // Verify that the navigation is rendered
    expect(screen.getByText('GameDin')).toBeInTheDocument();
    // Verify that the sign in button is shown when not authenticated
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });
}); 