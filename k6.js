// brew install k6
import http from 'k6/http';
import { sleep, check } from 'k6';
import { Counter } from 'k6/metrics';

// A simple counter for http requests

export const requests = new Counter('http_reqs');

// you can specify stages of your test (ramp up/down patterns) through the options object
// target is the number of VUs you are aiming for

export const options = {
  stages: [
    { target: 100, duration: '2s' },
    { target: 0, duration: '2s' },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'], // http errors should be less than 1%
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 200ms
  },
};

export default function () {
  // our HTTP request, note that we are saving the response to res, which can be accessed later

  const res = http.get('http://test.k6.io/contacts.php');

  sleep(1);

  const checkRes = check(res, {
    'status is 200': (r) => r.status === 200
  });
}


// k6 run k6.js