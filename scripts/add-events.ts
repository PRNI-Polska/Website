import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) {
    console.error("No admin user found");
    process.exit(1);
  }

  const events = [
    {
      title: "Wystąpienie publiczne oraz rozdawanie ulotek",
      description: `## Wystąpienie publiczne PRNI

Zapraszamy na wystąpienie publiczne Polskiego Ruchu Narodowo-Integralistycznego połączone z rozdawaniem ulotek informacyjnych.

### Program:
- Wystąpienie publiczne przedstawicieli PRNI
- Rozdawanie ulotek i materiałów informacyjnych
- Spotkania regionowe z sympatykami ruchu

**Dołącz do nas i bądź częścią zmian!**

*Przyszłość zaczyna się teraz*`,
      startDateTime: new Date("2026-04-18T12:00:00+02:00"),
      endDateTime: new Date("2026-04-18T16:00:00+02:00"),
      location: "Polska — szczegóły wkrótce",
      tags: "wystąpienie,ulotki,spotkanie regionalne",
      status: "PUBLISHED",
      createdById: admin.id,
    },
    {
      title: "Wystąpienie publiczne, rozdawanie ulotek i możliwość marszu",
      description: `## Wielkie wystąpienie publiczne PRNI

Zapraszamy na jedno z największych wydarzeń PRNI — wystąpienie publiczne połączone z rozdawaniem ulotek oraz **możliwością marszu**.

### Program:
- Wystąpienie publiczne przedstawicieli PRNI
- Rozdawanie ulotek i materiałów informacyjnych
- Spotkania regionowe z sympatykami
- **Możliwość marszu** — szczegóły zostaną ogłoszone

**To wydarzenie, na którym nie może Cię zabraknąć!**

*Przyszłość zaczyna się teraz*`,
      startDateTime: new Date("2026-05-16T11:00:00+02:00"),
      endDateTime: new Date("2026-05-16T17:00:00+02:00"),
      location: "Polska — szczegóły wkrótce",
      tags: "wystąpienie,ulotki,spotkanie regionalne,marsz",
      status: "PUBLISHED",
      createdById: admin.id,
    },
    {
      title: "Wystąpienie publiczne i rozdawanie ulotek — Czerwiec",
      description: `## Wystąpienie publiczne PRNI — Czerwiec

Zapraszamy na czerwcowe wystąpienie publiczne Polskiego Ruchu Narodowo-Integralistycznego.

### Program:
- Wystąpienie publiczne przedstawicieli PRNI
- Rozdawanie ulotek i materiałów informacyjnych
- Spotkanie regionowe z sympatykami ruchu

**Razem budujemy silną i suwerenną Polskę!**

*Przyszłość zaczyna się teraz*`,
      startDateTime: new Date("2026-06-13T12:00:00+02:00"),
      endDateTime: new Date("2026-06-13T16:00:00+02:00"),
      location: "Polska — szczegóły wkrótce",
      tags: "wystąpienie,ulotki,spotkanie regionalne",
      status: "PUBLISHED",
      createdById: admin.id,
    },
  ];

  for (const event of events) {
    const existing = await prisma.event.findFirst({
      where: {
        startDateTime: event.startDateTime,
        title: { contains: event.title.substring(0, 20) },
      },
    });

    if (existing) {
      console.log(`⏭ Already exists: ${event.title}`);
      continue;
    }

    const created = await prisma.event.create({ data: event });
    console.log(`✓ Created: ${created.title} (${created.startDateTime.toLocaleDateString("pl")})`);
  }

  console.log("\nDone!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
