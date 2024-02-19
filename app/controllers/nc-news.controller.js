const { selectTopics, selectEndpoints } = require("../models/nc-news.model")

exports.getTopics = (req, res, next) => {
    selectTopics().then((topics)=> {
        res.status(200).send({topics})
    }).catch((error)=> {
        next(error)
    })
}

exports.getEndpoints = (req, res, next) => {
    selectEndpoints().then((endpoints) => {
        res.status(200).send({endpoints})
    }).catch((error) => {
        next(error)
    })
}