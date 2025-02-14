// Transform nested JSON into flat structure
export const transformData = (data: any) => {
  const verses = [];

  for (const book in data) {
    for (const chapter in data[book]) {
      for (const verse in data[book][chapter]) {
        verses.push({
          book,
          chapter: parseInt(chapter),
          verse: parseInt(verse),
          text: data[book][chapter][verse],
        });
      }
    }
  }

  return verses;
};
