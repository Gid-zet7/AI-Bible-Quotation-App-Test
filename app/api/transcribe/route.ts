import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import FormData from "form-data";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();

    const audioFile = data.get("file") as Blob | null;
    const book = data.get("book") as string | null;
    const chapter = data.get("chapter") as number | null;
    const verse = data.get("verse") as number | null;
    const text = data.get("text") as string | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Convert Blob to Buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Transcribe audio
    const transcription = await transcribeAudio(buffer);

    // Extract Bible quote
    const quoteAddress = await extractBibleQuote(transcription);

    // Fetch full Bible quotation
    const fullQuotation = await fetchBibleQuotation(
      book,
      chapter,
      verse,
      text,
      quoteAddress
    );

    return NextResponse.json({ quotation: fullQuotation });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

async function transcribeAudio(audioData: Buffer): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append("file", audioData, { filename: "audio.mp3" });
    formData.append("model", "whisper-1");

    console.log("Using OpenAI API Key:", process.env.OPENAI_API_KEY);

    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "multipart/form-data",
          ...formData.getHeaders(),
        },
      }
    );

    console.log("Transcription Response:", response.data);
    return response.data.text; // Return the transcribed text
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("❌ AxiosError:", error.message);

      if (error.response) {
        console.error("🔴 Response Data:", error.response.data);
        console.error("🔴 Status Code:", error.response.status);
      } else if (error.request) {
        console.error("⚠️ No response received:", error.request);
      } else {
        console.error("⚠️ Request Setup Error:", error.message);
      }
    } else {
      console.error("❌ Unexpected Error:", error);
    }

    return null; // Return null if an error occurs
  }
}

async function extractBibleQuote(text: string | null): Promise<string | null> {
  console.log("🔍 Extracting Bible reference from text:", text);

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an expert at detecting Bible references in text. Your task is to extract the Bible reference from the following text. Follow these rules:

1. Explicit References:
   - If the text explicitly mentions a Bible reference (e.g., "John 3:16", "Genesis 1:1-3"), extract it in the format "Book Chapter:Verse" (e.g., "John 3:16" or "Genesis 1:1-3").

2. Implicit References:
   - If the text implies a Bible reference (e.g., "the verse we just read", "the passage about the Good Samaritan", "the story of David and Goliath"), make your best guess at the reference based on the context.

3. Sermon Language:
   - If the text uses sermon-like language (e.g., "Next verse"), infer the reference from the surrounding context.

4. No Reference Found:
   - If no Bible reference is mentioned or implied, return "Next verse".

5. Format:
   - Always return the reference in the format "Book Chapter:Verse" (e.g., "John 3:16").
   - For ranges, use the format "Book Chapter:Verse-Verse" (e.g., "Genesis 1:1-3").
   - Do not include any additional text or explanations.

Text: ${text}
`;

    // 🔹 Generate content using Gemini AI
    const result = await model.generateContent(prompt);

    // 🔹 Ensure the response is valid
    if (!result || !result.response) {
      console.warn("⚠️ API response is empty or invalid.");
      return "⚠️ No Bible quote found.";
    }

    // 🔹 Extract and return text from response
    const responseText = await result.response.text();
    console.log("📖 Extracted Quote:", responseText);

    if (!responseText || responseText.toLowerCase() === "none") {
      return "⚠️ No valid Bible reference found.";
    }

    return responseText.trim();
  } catch (error: unknown) {
    console.error("❌ Error extracting Bible quote:", error);

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error("❌ Axios Error:", axiosError.message);

      if (axiosError.response) {
        console.error(`🔴 Response Status: ${axiosError.response.status}`);
        console.error(`🔴 Response Data:`, axiosError.response.data);

        switch (axiosError.response.status) {
          case 401:
            return "🚨 Unauthorized request. Please check your API key.";
          case 403:
            return "🔒 Access denied. Ensure your API key has the right permissions.";
          case 429:
            return "⚠️ Rate limit exceeded. Slow down API requests.";
          case 500:
          case 502:
          case 503:
            return "🛠️ Server error. Try again later.";
          default:
            return "❌ API request failed. Please try again.";
        }
      }
    } else {
      console.error("Unexpected Error:", error);
    }

    return "❌ Failed to extract Bible quote. Please try again.";
  }
}

async function fetchBibleQuotation(
  book: string | null,
  chapter: number | null,
  verse: number | null,
  text: string | null,
  quoteAddress: string | null
): Promise<string> {
  try {
    console.log(`Fetching Bible verse for: ${quoteAddress}`);

    const BASE_URL =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

    // Ensure quoteAddress is a string before using encodeURIComponent
    const safeQuoteAddress = quoteAddress ?? "";

    if (safeQuoteAddress.toLowerCase() === "next verse") {
      if (!book || !chapter || !verse) {
        return "⚠️ Unable to find the next verse.";
      }

      const nextVerseQuery = `${book} ${chapter}:${Number(verse) + 1}`;
      console.log(`Fetching next verse: ${nextVerseQuery}`);

      const nextVerseResponse = await axios.get(
        `${BASE_URL}/api/quotes?search=${encodeURIComponent(nextVerseQuery)}`
      );

      return nextVerseResponse.data || "⚠️ No next verse found.";
    }

    const response = await axios.get(
      `${BASE_URL}/api/quotes?search=${encodeURIComponent(safeQuoteAddress)}`
    );

    if (!response.data) {
      console.warn("⚠️ No matching Bible verse found.");
      return "No matching Bible verse found.";
    }

    return response.data;
  } catch (error) {
    console.error("❌ Error fetching Bible verse:", error);
    return "Error fetching Bible verse. Please try again.";
  }
}
