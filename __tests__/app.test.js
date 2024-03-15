const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");
const app = require("../app/app");
const request = require("supertest");

beforeEach(() => seed(data));

afterAll(() => db.end());

describe("pathNotFound Error Handling", () => {
  test("should return 404 not found when given an incorrect endpoint", () => {
    return request(app)
      .get("/api/forklift")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("path not found");
      });
  });
});

describe("GET /api/topics", () => {
  test("should return an array of topic objects, with properties of Slug and Description", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(topics.length).toBe(3);
        topics.forEach((topic) => {
          expect(typeof topic.slug).toBe("string");
          expect(typeof topic.description).toBe("string");
        });
      });
  });
});

describe("GET /api", () => {
  test("should return an object describing all the available endpoints", () => {
    const expected = require("../endpoints.json");
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(expected);
      });
  });
});

describe("GET /api/articles", () => {
  test("should return an array containing all the article objects", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(13);
      });
  });
  test("each article object should be formatted correctly with the required properties", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        articles.forEach((article) => {
          expect(article).not.toHaveProperty("body");
          expect(article).toMatchObject({
            article_id: expect.any(Number),
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
      });
  });
  test("returned objects should be sorted by date descending", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("should return the given article as specified by the given ID", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article.length).toBe(1);
        expect(article[0].article_id).toBe(1);
      });
  });
  test("article should be returned with the correct properties", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article[0]).toMatchObject({
          article_id: expect.any(Number),
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
        });
      });
  });
  test("should return 404 not found if given an invalid ID number", () => {
    return request(app)
      .get("/api/articles/999999")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Not Found");
      });
  });
  test("should return 400 bad request if given an invalid request", () => {
    return request(app)
      .get("/api/articles/forklift")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("returns an array of comments for the given article_id", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments.length).toBe(11);
      });
  });
  test("comments should be formatted correctly", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: expect.any(Number),
          });
          expect(comment.article_id).toBe(1);
        });
      });
  });
  test("comments should be arranged most recent comments first", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("should return 200 code and an empty array when there is an article present with no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toEqual([]);
      });
  });
  test("should return error 400 Bad Request when given an invalid article ID", () => {
    return request(app)
      .get("/api/articles/forklift/comments")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toEqual("Bad Request");
      });
  });
  test("should return a 404 not found when given a valid but non-existant article_id", () => {
    return request(app)
      .get("/api/articles/99999/comments")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toEqual("Not Found");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("should post new comment to given article", () => {
    const newComment = {
      username: "lurker",
      body: "Test Comment",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(201)
      .then(({ body: { comment } }) => {
        expect(comment.author).toBe("lurker"),
          expect(comment.body).toBe("Test Comment"),
          expect(comment).toHaveProperty("created_at"),
          expect(comment.votes).toBe(0),
          expect(typeof comment.comment_id).toBe("number"),
          expect(comment.article_id).toBe(1);
      });
  });
  test("should ignore any unnecessary properties on the request body", () => {
    const newComment = {
      username: "lurker",
      body: "Test Comment",
      randomProperty: "This should defo be ignored..",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(201)
      .then(({ body: { comment } }) => {
        expect(comment.author).toBe("lurker"),
          expect(comment.body).toBe("Test Comment"),
          expect(comment).toHaveProperty("created_at"),
          expect(comment.votes).toBe(0),
          expect(typeof comment.comment_id).toBe("number"),
          expect(comment.article_id).toBe(1);
        expect(comment).not.toHaveProperty("randomProperty");
      });
  });
  test("should give 404 bad request error when given an incorrect username", () => {
    const badComment = {
      username: "ForkliftMasta",
      body: "Test Comment",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(badComment)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Not Found");
      });
  });
  test("should give 400 bad request error when not given enough information", () => {
    const badComment = {
      username: "lurker",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(badComment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
  test("should give 404 when article doesnt exist", () => {
    const newComment = {
      username: "lurker",
      body: "Test Comment",
    };
    return request(app)
      .post("/api/articles/3242/comments")
      .send(newComment)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Not Found");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("should return 200 code and update an article with only the information sent to be updated", () => {
    const patchInfo = { inc_votes: 100 };
    const article_1 = {
      article_id: 1,
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "butter_bridge",
      body: "I find this existence challenging",
      created_at: "2020-07-09T20:11:00.000Z",
      votes: 200,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };
    return request(app)
      .patch("/api/articles/1")
      .send(patchInfo)
      .expect(200)
      .then(({ body: { patchedArticle } }) => {
        expect(patchedArticle).toEqual(article_1);
      });
  });
  test("should return 200 code and update an article with minus inputs", () => {
    const patchInfo = { inc_votes: -50 };
    return request(app)
      .patch("/api/articles/1")
      .send(patchInfo)
      .expect(200)
      .then(({ body: { patchedArticle } }) => {
        expect(patchedArticle.votes).toEqual(50);
      });
  });
  test("should give 400 bad request error when patchInfo includes something other than updating votes", () => {
    const patchInfo = { topic: "cats" };
    return request(app)
      .patch("/api/articles/1")
      .send(patchInfo)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
  test("should give 400 bad request error when patchInfo includes votes, but the data type is incorrect", () => {
    const patchInfo = { inc_votes: "i love forklifts me" };
    return request(app)
      .patch("/api/articles/1")
      .send(patchInfo)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
  test("should give 404 not found when given an invalid article_id", () => {
    const patchInfo = { inc_votes: 100 };
    return request(app)
      .patch("/api/articles/99999")
      .send(patchInfo)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Article Not Found");
      });
  });
  test("should give 400 bad request when given a valid, but non-existant article_id", () => {
    const patchInfo = { inc_votes: 100 };
    return request(app)
      .patch("/api/articles/forklift")
      .send(patchInfo)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("should respond with 204 code and delete the given comment", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
      .then(({ body: { msg } }) => {
        expect(msg).toBe(undefined);
      });
  });
  test("should return error 404 if the given comment ID does not exist", () => {
    return request(app)
      .delete("/api/comments/986712")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Comment does not exist!");
      });
  });
  test("should return 400 bad request if given an invalid comment id", () => {
    return request(app)
      .delete("/api/comments/forklift")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
});

describe("GET /api/users", () => {
  test("should respond with 200 code and an array containing all the user objects", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: { users } }) => {
        expect(users.length).toBe(4);
      });
  });
  test("each user object should be formatted correctly with the required properties", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: { users } }) => {
        users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api/articles (topic query)", () => {
  test("should return an array of articles that match the given topic query", () => {
    return request(app)
      .get("/api/articles?topic=cats")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(1);
        articles.forEach((article) => {
          expect(article.topic).toBe("cats");
        });
      });
  });
  test("should return an empty array when given a valid topic with no results", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(0);
        expect(articles).toEqual([]);
      });
  });
  test("should return a 404 error when the queried topic is invalid", () => {
    return request(app)
      .get("/api/articles?topic=forklift")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Not Found");
      });
  });
});

describe("GET /api/articles/:article_id (comment_count)", () => {
  test("should return the requested article with comment count property", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article[0]).toHaveProperty("comment_count");
        expect(article[0].comment_count).toBe(11);
      });
  });
});

describe.only("GET /api/articles (sortBy query)", () => {
  test("should return an array of articles that match the given topic query", () => {
    return request(app)
      .get("/api/articles?sort_by=votes")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy(articles.votes);
      });
  });
  test("should return a 404 when given an incorrect sortBy value", () => {
    return request(app)
      .get("/api/articles?sort_by=forklift")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Not Found');
      });
  });
});

xdescribe("GET /api/articles (sortBy AND order query)", () => {
  test("should return an array of articles that match the given topic query", () => {
    return request(app)
      .get("/api/articles?sortby=votes&order=ASC")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy(articles.votes)
        expect(articles).toBeSorted({ descending: false });
      });
  });
  test("should return a 404 when given an incorrect order value", () => {
    return request(app)
      .get("/api/articles?order=forklift")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe('Not Found');
      });
  });
});