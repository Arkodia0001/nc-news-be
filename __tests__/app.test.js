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
        expect(comments).toBeSortedBy("created_at", { descending: false });
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
  test("should give 400 bad request error when not given enough information", () => {
    const badComment = {
      username: "username",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(badComment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
  test("should give 400 bad request error when given incorrect data types", () => {
    const badComment = {
      username: 123823,
      body: 120874
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
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });
});
