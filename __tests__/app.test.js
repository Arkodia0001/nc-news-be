const db = require("../db/connection");
const seed  = require("../db/seeds/seed");
const data = require("../db/data/test-data");
const app = require("../app/app");
const request = require("supertest");

beforeEach(() => seed(data));

afterAll(() => db.end());

describe('pathNotFound Error Handling', () => {
    test('should return 404 not found when given an incorrect endpoint', () => {
        return request(app).get('/api/forklift').expect(404).then(({body: {msg}}) => {
            expect(msg).toBe('path not found')
        })
    })
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

describe('GET /api', () => {
    test('should return an object describing all the available endpoints', () => {
        const expected = require('../endpoints.json')
        return request(app).get('/api').expect(200).then(({body: {endpoints}}) => {
            expect(endpoints).toEqual(expected)
        })
    })
})

describe('GET /api/articles/:article_id', () => {
    test('should return the given article as specified by the given ID', () => {
        const articles = require('../db/data/test-data/articles')
        return request(app).get('/api/articles/1').expect(200).then(({body: {article}}) => {
            expect(article.length).toBe(1)
            expect(article[0].article_id).toBe(1)
            expect(article[0].title).toEqual(articles[0].title)
            expect(article[0].topic).toEqual(articles[0].topic)
            expect(article[0].author).toEqual(articles[0].author)
            expect(article[0].body).toEqual(articles[0].body)
            expect(article[0]).toHaveProperty('created_at')
            expect(article[0].votes).toEqual(articles[0].votes)
            expect(article[0].article_img_url).toEqual(articles[0].article_img_url)
        })
    })
    test('should return 404 not found if given an invalid ID number', () => {
        return request(app).get('/api/articles/999999').expect(404).then(({body: {msg}}) => {
            expect(msg).toBe('Not Found')
        })
    })
    test('should return 400 bad request if given an invalid request', () => {
        return request(app).get('/api/articles/forklift').expect(400).then(({body: {msg}}) => {
            expect(msg).toBe('Bad Request')
        })
    })
})
