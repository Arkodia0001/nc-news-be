const express = require("express");
const { getTopics, getEndpoints, getArticleById, getArticles, getCommentsByArticleID, postCommentByArticleID, patchArticle } = require("./controllers/nc-news.controller");
const { pathNotFound, customError, badRequestError } = require("./errorHandling");
const app = express();

app.use(express.json());

app.get('/api/topics', getTopics);
app.get('/api', getEndpoints)
app.get('/api/articles/:article_id', getArticleById)
app.get('/api/articles', getArticles)

app.get('/api/articles/:article_id/comments', getCommentsByArticleID)

app.post('/api/articles/:article_id/comments', postCommentByArticleID)
app.patch('/api/articles/:article_id', patchArticle)

app.use((error, req, res, next) => {
    if(error.msg && error.status){
        res.status(error.status).send({ msg: error.msg })
    } else if (error.code === "22P02" || error.code === '23502' || error.code === '23503'){
        res.status(400).send({ msg: 'Bad Request'})
    } else {
    console.log(error)
    res.status(500).send({error})
}});

app.all('/*', pathNotFound);

app.use(customError);

app.use(badRequestError);

module.exports = app
