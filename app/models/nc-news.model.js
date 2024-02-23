const db = require("../../db/connection");
const fs = require("fs/promises");
const usersArray = require("../../db/data/test-data/users");
const { string } = require("pg-format");

exports.selectTopics = () => {
  return db.query("SELECT * FROM topics").then(({ rows }) => {
    return rows;
  });
};

exports.selectArticles = (topic) => {
  const validTopics = ["cats", "mitch", "paper"];
  if (topic !== undefined && !validTopics.includes(topic)) {
    return Promise.reject({ status: 400, msg: "Bad Request" });
  }

  let stringQuery = `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.body)::INT AS comment_count
  FROM articles
  LEFT JOIN comments ON articles.article_id = comments.article_id`;
  let queryValues = [];

  if (topic) {
    stringQuery += " WHERE topic = $1";
    queryValues.push(topic);
  }

  stringQuery += ` GROUP BY articles.article_id
  ORDER BY articles.created_at DESC;`;

  return db.query(stringQuery, queryValues).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Not Found" });
    }
    return rows;
  });
};

exports.selectArticleById = (article_id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
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
  const usernames = usersArray.map((user) => {
    return user.username;
  });
  if (typeof newComment.body !== "string") {
    return Promise.reject({ status: 400, msg: "Bad Request" });
  }

  if (!usernames.includes(newComment.username)) {
    return Promise.reject({ status: 404, msg: "Not Found" });
  } else {
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
};

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
