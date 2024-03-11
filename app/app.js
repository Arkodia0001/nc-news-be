const cors = require('cors');

const {
    getTopics,
    getEndpoints,
    getArticleById,
    getArticles,
    getCommentsByArticleID,
    postCommentByArticleID,
    patchArticle,
    sendDeleteRequest,
    getUsers,
} = require("./controllers/nc-news.controller");
const {
    pathNotFound,
    customError,
    badRequestError,
} = require("./errorHandling");

const express = require("express");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/topics", getTopics);
app.get("/api", getEndpoints);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles/:article_id/comments", getCommentsByArticleID);
app.post("/api/articles/:article_id/comments", postCommentByArticleID);
app.patch("/api/articles/:article_id", patchArticle);
app.delete("/api/comments/:comment_id", sendDeleteRequest);
app.get("/api/users", getUsers)

app.all("/*", pathNotFound);
app.use(customError);
app.use(badRequestError);
app.use((error, req, res, next) => {
    res.status(500).send({ error });
});

module.exports = app;
