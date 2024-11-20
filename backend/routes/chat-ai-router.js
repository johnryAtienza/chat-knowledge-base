"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const express = require("express");
const router = express.Router();
const multer = require("multer");
const pdfParse = require("pdf-parse");
const OpenAI = require("openai");
const fs = require("fs");
const bodyParser = require("body-parser");
const path = require("path");
const { parseAllFiles } = require("../utils/parser");
router.use(bodyParser.json());
// OpenAI Configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
// const openai = new OpenAIApi(openaiConfig);
// In-memory storage for extracted texts
const fileContents = {};
const fileStorage = "uploads/";
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Specify the destination folder for uploads
        cb(null, fileStorage);
    },
    filename: (req, file, cb) => {
        // Customize the file name
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname); // Get file extension
        const basename = path.basename(file.originalname, ext); // Get file basename
        const filename = `${basename}-${uniqueSuffix}${ext}`;
        cb(null, filename);
    },
});
// Create the upload middleware
const upload = multer({ storage: storage });
// const upload = multer({ dest: "uploads/" });
router.post("/upload", upload.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    if (!file) {
        return res.status(400).send("No file uploaded.");
    }
    try {
        console.info(file);
        if (file.mimetype === "application/pdf") {
            // const dataBuffer = fs.readFileSync(file.path);
            // const text = await pdfParse(dataBuffer);
            // fileContents[file.originalname] = text.text;
        }
        else {
            return res
                .status(400)
                .send("Unsupported file format. Only PDFs are allowed.");
        }
        res.send(`File "${file.originalname}" processed successfully.`);
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Error processing the file.");
    }
}));
router.post("/query", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body)
        return res.status(400).send("Parameter is needed.");
    const { query } = req.body;
    if (!query) {
        return res.status(400).send("Query is required.");
    }
    try {
        // Combine all file contents
        const contents = yield parseAllFiles(fileStorage);
        // res.send(content);
        // return;
        const allText = Object.values(contents).join("\n");
        // const chatCompletion = await openai.chat.completions.create({
        //   messages: [{ role: "user", content: "Say this is a test" }],
        //   model: "gpt-4o-mini",
        // });
        const chatCompletion = yield openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "user", content: `Context: ${allText}\nQuestion: ${query}` },
            ],
        });
        const data = chatCompletion.choices[0].message;
        console.log(chatCompletion.choices[0].message);
        // Pass context to OpenAI
        // const response = await openai.createChatCompletion({
        //   model: "gpt-4",
        //   messages: [
        //     {
        //       role: "system",
        //       content:
        //         "You are an assistant that answers questions based on provided text.",
        //     },
        //     {
        //       role: "user",
        //       content: `Context: ${allText}\nQuestion: ${query}`,
        //     },
        //   ],
        //   max_tokens: 150,
        // });
        // const answer = response.data.choices[0].message.content;
        res.send(data);
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Error processing the query.");
    }
}));
module.exports = router;
