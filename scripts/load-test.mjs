#!/usr/bin/env node
// Simple load test: make N concurrent requests M times and report averages
import { request } from 'http';

const DEFAULT_URL = process.argv[2] || 'http://localhost:3000/api/reservations';
const CONCURRENCY = Number(process.env.LT_CONCURRENCY || 10);
const ITERATIONS = Number(process.env.LT_ITERATIONS || 100);

const makeRequest = (url) => new Promise((resolve) => {
  const start = Date.now();
  const req = request(url, (res) => {
    res.on('data', () => {});
    res.on('end', () => resolve(Date.now() - start));
  });
  req.on('error', () => resolve(null));
  req.end();
});

const run = async () => {
  console.log(`Load test to ${DEFAULT_URL} — concurrency ${CONCURRENCY}, iterations ${ITERATIONS}`);
  const durations = [];
  for (let i = 0; i < ITERATIONS; i += CONCURRENCY) {
    const batch = [];
    for (let j = 0; j < CONCURRENCY; j++) {
      batch.push(makeRequest(DEFAULT_URL));
    }
    const results = await Promise.all(batch);
    durations.push(...results.filter(Boolean));
    process.stdout.write('.');
  }
  const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
  console.log(`\nRequests: ${durations.length}, avg ms: ${Math.round(avg)}`);
};

run().catch((e) => { console.error(e); process.exit(1); });
