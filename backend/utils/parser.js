const fs = require("fs");
const pdfParse = require("pdf-parse");
const path = require("path");

async function parseAllFiles(folder) {
  try {
    // Read all files in the folder
    const files = fs.readdirSync(folder);
    const fileContents = {};
    for (const file of files) {
      const filePath = path.join(folder, file);

      // Check if the path is a file (not a directory)
      if (fs.lstatSync(filePath).isFile()) {
        try {
          console.log(`Parsing file: ${file}`);
          // Extract text using pdf-parse
          const text = await pdfParse(filePath);
          console.log(`Extracted text from ${file}:\n`, text.text);
          fileContents[file] = text.text;
        } catch (error) {
          console.error(`Failed to parse ${file}:`, error);
        }
      }
    }

    return fileContents;
  } catch (err) {
    console.error("Error reading folder:", err);
  }
}

module.exports = { parseAllFiles };
