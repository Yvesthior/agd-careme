import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function getServerEntries(startDate: Date, endDate: Date) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const entries = await db.weeklyEntry.findMany({
    where: {
      userId,
      startDate: {
        gte: startDate,
      },
      endDate: {
        lte: endDate,
      },
    },
    include: {
      days: true,
    },
  });

  return entries;
}

export async function createServerWeek(startDate: Date, endDate: Date) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  return await db.weeklyEntry.create({
    data: {
      userId,
      startDate,
      endDate,
      days: {
        create: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000),
          exercises: {},
        })),
      },
    },
    include: {
      days: true,
    },
  });
}
