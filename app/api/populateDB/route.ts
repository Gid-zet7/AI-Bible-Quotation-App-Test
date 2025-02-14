import mongoose from "mongoose";
import { populateDatabase } from "@/utils/populateDB";

export const GET = async () => {
  try {
    populateDatabase();
    console.log("Bible data populated successfully!");
    return new Response("Bible data populated successfully!", {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching/inserting data:", error);
    mongoose.connection.close();
  }
};
