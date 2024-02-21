const db = require('../../db/connection')
const fs = require('fs/promises');
const comments = require('../../db/data/test-data/comments');
const { nextTick } = require('process');

exports.selectTopics = () => {
    return db.query('SELECT * FROM topics')
    .then(({rows}) => {
        return rows;
    })
}


exports.selectArticles = () => {
    return db.query(`SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.body)::INT AS comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
    GROUP BY articles.article_id
    ORDER BY articles.created_at DESC;`)
    .then(({rows}) => {
        return rows;
    })
}

exports.selectArticleById = (article_id) => {
    return db.query(`SELECT * FROM articles WHERE article_id = $1`, [article_id]).then(({rows}) => {
        if(rows.length === 0){
            return Promise.reject({status: 404, msg: "Not Found"});
        }
        return rows;
    })
}

exports.selectCommentsByArticleID = (article_id) => {
    return db.query('SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at', [article_id]).then(({rows}) => {
        return rows
    })
}

exports.insertNewComment = ({article_id}, newComment) => {
    return db.query(`INSERT INTO comments
    (article_id, author, body)
    VALUES
    ($1, $2, $3) RETURNING *`,
    [article_id, newComment.username, newComment.body])
    .then(({rows})=>{
        return rows[0];
    })
}
