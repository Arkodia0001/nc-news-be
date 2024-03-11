const db = require("../../db/connection");
const fs = require("fs/promises");

exports.selectTopics = () => {
  return db.query("SELECT * FROM topics").then(({ rows }) => {
    return rows;
  });
};

exports.selectArticles = (topics, query) => {
  const validTopics = topics.map((topic) => {
    return topic.slug;
  });

  if (query !== undefined && !validTopics.includes(query)) {
    return Promise.reject({ status: 404, msg: "Not Found" });
  }

  let stringQuery = `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.body)::INT AS comment_count
  FROM articles
  LEFT JOIN comments ON articles.article_id = comments.article_id`;
  let queryValues = [];

  if (query) {
    stringQuery += ` WHERE topic = $1`;
    queryValues.push(query);
  }

  stringQuery += ` GROUP BY articles.article_id
  ORDER BY articles.created_at DESC;`;

  return db.query(stringQuery, queryValues).then(({ rows }) => {
    return rows;
  });
};

exports.selectArticleById = (article_id) => {
  return db
    .query(
      `
    SELECT 
        articles.author, 
        articles.title, 
        articles.article_id, 
        articles.topic, 
        articles.body,
        articles.created_at, 
        articles.votes, 
        articles.article_img_url, 
        COUNT(comments.body)::INT AS comment_count
    FROM articles
    LEFT JOIN comments 
    ON articles.article_id = comments.article_id 
    WHERE articles.article_id = $1
    GROUP BY articles.article_id`,
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not Found" });
      }
      return rows;
    });
};

exports.selectCommentsByArticleID = (article_id) => {
  return db
    .query("SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at", [
      article_id,
    ])
    .then(({ rows }) => {
      return rows;
    });
};

exports.insertNewComment = ({ article_id }, newComment) => {
    return db
      .query(
        `INSERT INTO comments
    (article_id, author, body)
    VALUES
    ($1, $2, $3) RETURNING *`,
        [article_id, newComment.username, newComment.body]
      )
      .then(({ rows }) => {
        return rows[0];
      });
  }


exports.updateArticleByID = (update, article_id) => {
  let stringQuery = `UPDATE articles`;
  const validPatchData = ["inc_votes"];
  const values = [];

  for (const key in update) {
    if (!validPatchData.includes(key)) {
      return Promise.reject({ status: 400, msg: "Bad Request" });
    } else {
      stringQuery += ` SET votes = votes + $1`;
      values.push(update[key]);
    }
  }
  values.push(article_id);
  stringQuery += ` WHERE article_id = $2 RETURNING *`;

  return db.query(stringQuery, values).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Article Not Found" });
    }
    return rows[0];
  });
};

exports.deleteCommentByID = (comment_id) => {
  return db
    .query("DELETE FROM comments WHERE comment_id = $1 RETURNING *", [
      comment_id,
    ])
    .then(({ rowCount }) => {
      if (rowCount === 0) {
        return Promise.reject({ status: 404, msg: "Comment does not exist!" });
      }
    });
};

exports.selectUsers = () => {
  return db.query(`SELECT * FROM users`).then(({ rows }) => {
    return rows;
  });
};
