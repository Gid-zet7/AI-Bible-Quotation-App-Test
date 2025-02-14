import axios from "axios";

const GITHUB_RAW_URL =
  "https://raw.githubusercontent.com/jadenzaleski/BibleTranslations/refs/heads/master/KJV/KJV_bible.json";

// Fetch data from GitHub
export const fetchData = async () => {
  try {
    const response = await axios.get(GITHUB_RAW_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    process.exit(1);
  }
};

// Run the script
// populateDatabase();
