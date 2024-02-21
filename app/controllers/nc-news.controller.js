const { selectTopics, selectArticleById, selectArticles, selectCommentsByArticleID, insertNewComment } = require("../models/nc-news.model")
const endpoints = require('../../endpoints.json')


exports.getTopics = (req, res, next) => {
    selectTopics().then((topics)=> {
        res.status(200).send({topics})
    }).catch((error)=> {
        next(error)
    })
}

exports.getEndpoints = (req, res, next) => {
    res.status(200).send({endpoints})
}

exports.getArticles = (req, res, next) => {
    selectArticles().then((articles) => {
        res.status(200).send({articles})
    }).catch((error) => {
        next(error)
    })
}

exports.getArticleById = (req, res, next) => {
    const { article_id } = req.params
    selectArticleById(article_id).then((article) => {
        res.status(200).send({article})
    }).catch((error) => {
        next(error)
    })
}

exports.getCommentsByArticleID = (req, res, next) => {
    const { article_id } = req.params
    selectCommentsByArticleID(article_id).then((comments) => {
        res.status(200).send({comments})
    }).catch((error) => {
        next(error)
    })
}

exports.postCommentByArticleID = (req, res, next) => {
    const newComment = req.body;
    const article_id = req.params
    insertNewComment(article_id, newComment).then((comment)=>{
        res.status(201).send({comment})
    }).catch((error)=> {
        next(error)
    });
};