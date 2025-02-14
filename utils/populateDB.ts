import mongoose from "mongoose";
import { fetchData } from "./fetchData";
import { transformData } from "./transformData";
import BibleVerse from "../db/models/bibleModel";
import { connectDB } from "@/db/mongodb";

// Insert data into MongoDB
export const populateDatabase = async () => {
  const data = await fetchData();
  const transformedData = transformData(data);

  try {
    await connectDB();
    await BibleVerse.insertMany(transformedData);
    console.log("Data inserted successfully!");
  } catch (error) {
    console.error("Error inserting data:", error);
  } finally {
    mongoose.connection.close();
  }
};
