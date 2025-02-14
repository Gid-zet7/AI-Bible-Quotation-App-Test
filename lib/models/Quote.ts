import mongoose, { Schema } from "mongoose";

export interface IQuote {
  reference: string;
  verse: string;
  transcription: string;
  timestamp: Date;
}

const BibleVerseSchema = new Schema<BibleVerse>({
  book: { type: String, required: true },
  chapter: { type: Number, required: true },
  verse: { type: Number, required: true },
  text: { type: String, required: true },
});

export const BibleVerse =
  mongoose.models.BibleVerse ||
  mongoose.model<BibleVerse>("BibleVerse", BibleVerseSchema);
