import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import BibleVerse from "@/db/models/bibleModel";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get("search"); // User input (partial/full quote or reference)

    console.log(searchQuery);

    if (!searchQuery) {
      return NextResponse.json(
        { error: "Please provide a search query" },
        { status: 400 }
      );
    }

    let query = {};

    // 1️⃣ Check if the searchQuery is a Bible reference (e.g., "John 3:16")
    const referencePattern = /^([1-3]?\s?[A-Za-z]+)\s(\d+):(\d+)$/;
    const match = searchQuery.match(referencePattern);

    if (match) {
      const [, book, chapter, verse] = match;
      query = { book, chapter: Number(chapter), verse: Number(verse) };
    } else {
      // 2️⃣ If it's not a reference, assume it's a keyword search
      query = { text: { $regex: searchQuery, $options: "i" } };
    }

    console.log(query);

    // Search the database for a single verse
    const bibleVerse = await BibleVerse.findOne(query).lean();
    console.log(bibleVerse);

    if (bibleVerse) {
      return NextResponse.json(bibleVerse, { status: 200 });
    } else {
      return NextResponse.json(
        { error: "No matching Bible verse found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error fetching Bible verse:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
