# Dawg-Tickets

![CI](https://github.com/Krisha052/Dawg-Tickets/actions/workflows/ci.yml/badge.svg)

This is a project by Krisha Rathod who is the chief programmer, Brendan Sheppard, Joshua Candra, and Jeremiah Jones

The University of Georgia Athletic Association (UGAAA) would like to create a web application that allows students to trade and transfer game tickets between each other. This UGA Ticket Trading Web Application will enable users to exchange tickets for UGA sporting events, such as football, basketball, gymnastics, without money transactions. This application will focus strictly on trading and transferring, not selling, allowing users to swap tickets they already own for those to other events or seats, ensuring fairness and compliance with university policies. 

From this platform, users will be able to post tickets available for trade, search for others seeking trades, and securely connect through a verified account system (SSO). Users may also simply transfer tickets one way to their account of choice (similar to the current donation system, but with the additional option of selecting which peer receives the ticket)

It is the goal of this project to provide a functional web-based trading system that satisfies the UGAAA and student users. The project goals are:
- Provide a secure and accessible platform for users to list and trade UGA athletic tickets.
- Allow users to log in via SSO to ensure trades occur within the UGA community.
- Enable users to filter by sport, date, and seat section to find relevant trade offers.
- Offer a request and confirmation system allowing both parties to agree on a trade.
- Maintain a trade history and confirmation log for accountability.

The success of this project is measured by:
- Meeting all the functional and non-functional requirements (outlined in the Requirements Document).
- Achieving usability for at least 90% …
- Demonstrating the team’s ability to work through the software development lifecycles with understanding of its necessary components, while producing a working product and
deliverables.

## Tech Stack

- **Client:** React (Vite), React Router
- **Server:** Node.js, Express, JWT authentication, role-based access control (RBAC)
- **Data:** PostgreSQL via Prisma (users, roles, events, tickets, listings, trades) with indexes on hot query paths (`Listing.status/createdAt`, `Listing.sellerId`, `Trade.buyerId/sellerId`); MongoDB via Mongoose for the validated-ticket registry and audit log
- **Infra:** Docker (server container + Postgres/Mongo via `docker-compose`), GitHub Actions CI/CD (test on every push/PR, build and push the server image to GHCR on merge to `main`)

See `server/LOADTEST.md` for measured latency under concurrent load.

## Environment Setup

Create a `server/.env` file (see `server/.env.example`):

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dawgtickets?schema=public
MONGO_URI=mongodb://localhost:27017/dawgtickets
JWT_SECRET=replace-with-a-long-random-secret
ADMIN_EMAILS=admin1@uga.edu,admin2@uga.edu   # login with one of these emails to get admin access
PORT=3000
```

Never commit real secrets — use a local `.env` (already gitignored) or your deployment platform's secret manager.

## Running the program

### With Docker (recommended)

```
docker compose up --build
```

This starts Postgres, Mongo, and the API server together.

### Manually

```
cd server
npm install
npx prisma migrate deploy
node index.js
# or: npm run dev
```

```
cd client
npm install
npm run dev
```

Visit `http://localhost:5173` for the React client (proxies `/api` to the server on port 3000), or `http://localhost:3000` for the legacy server-rendered pages under `server/public/`.

## Testing

```
cd server
npm test
```

Tests run against a real Postgres database (set `DATABASE_URL`) and an in-memory MongoDB instance spun up automatically via `mongodb-memory-server`.

## Legacy UI screenshots

The screenshots below are from the original static HTML/CSS/JS prototype (still served from `server/public/`). The project has since grown a React client under `client/`.

<img src="https://github.com/Krisha052/Dawg-Tickets/blob/main/server/public/images/Login%20Page.png?raw=true">
<img src="https://github.com/Krisha052/Dawg-Tickets/blob/main/server/public/images/Sign-up%20Page.png?raw=true">
<img src="https://github.com/Krisha052/Dawg-Tickets/blob/main/server/public/images/Navigation%20Page.png?raw=true">
<img src="https://github.com/Krisha052/Dawg-Tickets/blob/main/server/public/images/Home%20Page.png?raw=true">
<img src="https://github.com/Krisha052/Dawg-Tickets/blob/main/server/public/images/Trade%20Creation%20Page.png?raw=true">
<img src="https://github.com/Krisha052/Dawg-Tickets/blob/main/server/public/images/Current%20Trades.png?raw=true">
<img src="https://github.com/Krisha052/Dawg-Tickets/blob/main/server/public/images/Trade%20History%20Page.png?raw=true">
