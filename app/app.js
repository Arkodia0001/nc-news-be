const express = require("express");
const { getTopics, getEndpoints, getArticleById, getArticles } = require("./controllers/nc-news.controller");
const { pathNotFound, customError } = require("./errorHandling");
const app = express();


app.get('/api/topics', getTopics);
app.get('/api', getEndpoints)
app.get('/api/articles/:article_id', getArticleById)
app.get('/api/articles', getArticles)

app.use((error, req, res, next) => {
    if(error.msg && error.status){
        res.status(error.status).send({ msg: error.msg })
    } else if (error.code === "22P02"){
        res.status(400).send({ msg: 'Bad Request'})
    } else {
    console.log(error)
    res.status(500).send({error})
}});

app.use(customError);

app.all('/*', pathNotFound)

module.exports = app
