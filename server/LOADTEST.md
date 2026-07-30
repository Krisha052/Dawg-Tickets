# Load test results

Measured with `scripts/loadtest.js` against `GET /api/listings`, run locally against Postgres 16
with 5,000 seeded `open` listings (each joined to `event`, `ticket`, and `seller`).

Reproduce:

```
node scripts/seed/seedLoadTestData.js   # seeds 5,000 listings
node scripts/loadtest.js                # LOADTEST_CONNECTIONS=50, LOADTEST_DURATION=15 by default
```

## Before indexes + pagination

`GET /api/listings` had no `take`/`skip`, so every request fetched and serialized all 5,000 rows
with their joins.

| Metric | Value |
|---|---|
| p50 | 4421.90 ms |
| p90 | 6838.90 ms |
| p95 | 7628.68 ms |
| p99 | 11652.61 ms |
| Requests/sec | 9.6 |

## After indexes (`Listing.status/createdAt`, `Listing.sellerId`, `Trade.buyerId/sellerId`) + pagination (default page size 50)

| Metric | Value |
|---|---|
| p50 | 38.94 ms |
| p90 | 51.67 ms |
| p95 | 57.61 ms |
| p99 | 69.66 ms |
| Requests/sec | 1241.7 |

50 concurrent connections, 15s duration, 18,655 requests, 0 errors.
