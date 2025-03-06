import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import type { DayEntry } from "@/types/entries";

export async function PUT(
  request: Request,
  { params }: { params: { entryId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const entryData = await request.json();
    console.log("entryData reçue:", entryData);

    const updatedEntry = await db.weeklyEntry.update({
      where: {
        id: params.entryId,
        userId, // Sécurité: vérifie que l'entrée appartient à l'utilisateur
      },
      data: {
        charityActs: entryData.charityActs,
        comments: entryData.comments,
        difficulties: entryData.difficulties,
        improvements: entryData.improvements,
        successes: entryData.successes,
        days: {
          upsert: entryData.days.map((day: DayEntry) => ({
            where: { id: day.id },
            create: {
              date: new Date(day.date),
              exercises: day.exercises,
            },
            update: {
              exercises: day.exercises,
            },
          })),
        },
      },
      include: {
        days: true,
      },
    });

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}
