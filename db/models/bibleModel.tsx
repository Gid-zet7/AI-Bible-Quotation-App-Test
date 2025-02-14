import mongoose from "mongoose";

const Schema = mongoose.Schema;

const BibleVerseSchema = new Schema<BibleVerse>(
  {
    book: { type: String, require: true },
    chapter: { type: Number, required: true },
    verse: { type: Number, require: true },
    text: { type: String, require: true },
  },
  { timestamps: true }
);

const BibleVerse =
  mongoose.models.BibleVerse ||
  mongoose.model<BibleVerse>("BibleVerse", BibleVerseSchema);

export default BibleVerse;
