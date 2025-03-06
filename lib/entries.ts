import { db } from "@/lib/db";
import type { WeeklyEntry } from "@/types/entries";

export async function getUserEntries(
  startDate: Date,
  endDate: Date
): Promise<WeeklyEntry[]> {
  const response = await fetch(
    `/api/entries?start=${startDate.toISOString()}&end=${endDate.toISOString()}`
  );
  if (!response.ok) throw new Error("Failed to fetch entries");
  return response.json();
}

export async function createNewWeek(
  startDate: Date,
  endDate: Date
): Promise<WeeklyEntry> {
  const response = await fetch("/api/entries", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ startDate, endDate }),
  });
  if (!response.ok) throw new Error("Failed to create week");
  return response.json();
}

export async function updateWeeklyEntry(
  entry: WeeklyEntry
): Promise<WeeklyEntry> {
  console.log("Envoi de la mise à jour pour l'entrée:", entry.id);
  const response = await fetch(`/api/entries/${entry.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(entry),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Échec de la mise à jour");
  }

  return response.json();
}

export async function getEntries() {
  return await db.weeklyEntry.findMany();
}
