const express = require("express");
const { getTopics } = require("./controllers/nc-news.controller");
const { pathNotFound } = require("./errorHandling");
const app = express();

app.get('/api/topics', getTopics);

app.use((error, req, res, next) => {
    console.log(error)
    res.status(500).send({error})
});

app.all('/*', pathNotFound)

module.exports = app