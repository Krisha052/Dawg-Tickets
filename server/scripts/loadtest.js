const url = process.env.LOADTEST_URL || "http://localhost:3000/api/listings";
const connections = Number(process.env.LOADTEST_CONNECTIONS || 50);
const duration = Number(process.env.LOADTEST_DURATION || 15) * 1000;

function percentile(sortedLatencies, p) {
  const idx = Math.min(sortedLatencies.length - 1, Math.ceil((p / 100) * sortedLatencies.length) - 1);
  return sortedLatencies[idx];
}

async function worker(latencies, deadline, errors) {
  while (Date.now() < deadline) {
    const start = performance.now();
    try {
      const res = await fetch(url);
      await res.arrayBuffer();
      if (!res.ok) errors.count++;
    } catch {
      errors.count++;
    }
    latencies.push(performance.now() - start);
  }
}

async function main() {
  console.log(`Load testing ${url} with ${connections} concurrent connections for ${duration / 1000}s...`);

  const latencies = [];
  const errors = { count: 0 };
  const deadline = Date.now() + duration;
  const started = Date.now();

  await Promise.all(Array.from({ length: connections }, () => worker(latencies, deadline, errors)));

  const elapsedSec = (Date.now() - started) / 1000;
  latencies.sort((a, b) => a - b);

  console.log(`\nTotal requests: ${latencies.length}`);
  console.log(`Requests/sec:   ${(latencies.length / elapsedSec).toFixed(1)}`);
  console.log(`Errors:         ${errors.count}`);
  console.log("\n--- Latency (ms) ---");
  console.log(`p50: ${percentile(latencies, 50).toFixed(2)}`);
  console.log(`p90: ${percentile(latencies, 90).toFixed(2)}`);
  console.log(`p95: ${percentile(latencies, 95).toFixed(2)}`);
  console.log(`p99: ${percentile(latencies, 99).toFixed(2)}`);
  console.log(`max: ${latencies[latencies.length - 1].toFixed(2)}`);
}

main();
