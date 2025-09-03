import http from 'node:http';
const port = Number(process.env.PORT || 3000);
const req = http.request(
  {
    hostname: '127.0.0.1',
    port,
    path: '/health',
    method: 'GET',
    timeout: 2000,
  },
  (res) => process.exit(res.statusCode >= 200 && res.statusCode < 400 ? 0 : 1),
);
req.on('error', () => process.exit(1));
req.on('timeout', () => {
  req.destroy();
  process.exit(1);
});
req.end();
