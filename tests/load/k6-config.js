import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 300 }, // Ramp up to 300 users
    { duration: '5m', target: 300 }, // Stay at 300 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    'http_req_duration{type:staticAsset}': ['p(95)<100'], // 95% of static asset requests should be below 100ms
    'http_req_duration{type:apiEndpoint}': ['p(95)<1000'], // 95% of API requests should be below 1000ms
    errors: ['rate<0.1'], // Error rate should be below 10%
  },
};

const BASE_URL = __ENV.TARGET_URL || 'https://gamedin.xyz';

export function setup() {
  // Perform login and get session token
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, {
    username: __ENV.TEST_USERNAME,
    password: __ENV.TEST_PASSWORD,
  });

  check(loginRes, {
    'logged in successfully': (resp) => resp.status === 200,
  });

  return { token: loginRes.json('token') };
}

export default function(data) {
  const headers = {
    'Authorization': `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  };

  // Test homepage load
  const homeRes = http.get(BASE_URL, { tags: { type: 'staticAsset' } });
  check(homeRes, {
    'homepage loaded': (resp) => resp.status === 200,
  });

  // Test game search
  const searchRes = http.get(`${BASE_URL}/api/games/search?q=action`, {
    headers,
    tags: { type: 'apiEndpoint' },
  });
  check(searchRes, {
    'search successful': (resp) => resp.status === 200,
  });

  // Test game recommendations
  const recommendationsRes = http.get(`${BASE_URL}/api/games/recommendations`, {
    headers,
    tags: { type: 'apiEndpoint' },
  });
  check(recommendationsRes, {
    'recommendations loaded': (resp) => resp.status === 200,
  });

  // Test WebSocket connection
  const wsRes = http.get(`${BASE_URL}/api/ws`, {
    headers,
    tags: { type: 'apiEndpoint' },
  });
  check(wsRes, {
    'websocket connection successful': (resp) => resp.status === 101,
  });

  // Test user profile update
  const profileRes = http.put(`${BASE_URL}/api/users/profile`, {
    headers,
    body: JSON.stringify({
      bio: 'Test bio update',
    }),
    tags: { type: 'apiEndpoint' },
  });
  check(profileRes, {
    'profile update successful': (resp) => resp.status === 200,
  });

  // Random sleep between 1s and 5s
  sleep(Math.random() * 4 + 1);
}

export function teardown(data) {
  // Cleanup: Logout and close any open connections
  const logoutRes = http.post(`${BASE_URL}/api/auth/logout`, {
    headers: {
      'Authorization': `Bearer ${data.token}`,
    },
  });

  check(logoutRes, {
    'logged out successfully': (resp) => resp.status === 200,
  });
} 