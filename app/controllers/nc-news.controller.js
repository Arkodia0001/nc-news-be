const { selectTopics, selectArticleById } = require("../models/nc-news.model")
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

exports.getArticleById = (req, res, next) => {
    const { article_id } = req.params
    selectArticleById(article_id).then((article) => {
        res.status(200).send({article})
    }).catch((error) => {
        next(error)
    })
}