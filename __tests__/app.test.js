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

