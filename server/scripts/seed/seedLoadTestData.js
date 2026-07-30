require("dotenv").config();
const prisma = require("../../lib/prisma");

const LISTING_COUNT = 5000;

async function main() {
  console.log(`Seeding ${LISTING_COUNT} listings for load testing...`);

  const user = await prisma.user.upsert({
    where: { email: "loadtest@test.com" },
    update: {},
    create: { username: "loadtest", email: "loadtest@test.com", password: "unused" }
  });

  const event = await prisma.event.create({
    data: { name: "Load Test Event", date: new Date() }
  });

  const batchSize = 500;
  for (let batchStart = 0; batchStart < LISTING_COUNT; batchStart += batchSize) {
    const tickets = await prisma.$transaction(
      Array.from({ length: Math.min(batchSize, LISTING_COUNT - batchStart) }, (_, i) => {
        const n = batchStart + i;
        return prisma.ticket.create({
          data: { eventId: event.id, seat: `LT-${n}`, ticketNumber: `LOADTEST-${n}` }
        });
      })
    );

    await prisma.listing.createMany({
      data: tickets.map((t) => ({
        sellerId: user.id,
        eventId: event.id,
        ticketId: t.id,
        category: "UGA Football",
        status: "open"
      }))
    });

    console.log(`  seeded ${batchStart + tickets.length}/${LISTING_COUNT}`);
  }

  console.log("Done.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
