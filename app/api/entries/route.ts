import { NextResponse } from "next/server";
import { getServerEntries, createServerWeek } from "@/lib/api/entries";
import { updateWeeklyEntry } from "@/lib/entries";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const start = new Date(searchParams.get("start") || "");
  const end = new Date(searchParams.get("end") || "");

  try {
    const entries = await getServerEntries(start, end);
    return NextResponse.json(entries);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { startDate, endDate } = await request.json();
    const entry = await createServerWeek(
      new Date(startDate),
      new Date(endDate)
    );
    return NextResponse.json(entry);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create week" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  console.log("request nous sommes ici");
  try {
    const entryData = await request.json();
    console.log("entryData", entryData);
    const updatedEntry = await updateWeeklyEntry(entryData);
    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.log("error", error);
    return NextResponse.json(
      { error: "Failed to update entry" },
      { status: 500 }
    );
  }
}
