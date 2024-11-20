const express = require('express');
const natural = require('natural');
const path = require('path');
const indexRouter = require('./routes/index');
const chatAiRouter = require('./routes/chat-ai-router');
require('dotenv').config();

const app = express();

// enable it for testing purposes on localmachine
const cors = require("cors");
app.use(cors());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use('/', indexRouter);
app.use('/chat', chatAiRouter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;