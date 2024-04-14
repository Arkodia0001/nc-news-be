# [Northcoders News API](https://nc-news-project-lijk.onrender.com)

[NC News](https://nc-news-project-lijk.onrender.com) is a back-end JS project, creating various server endpoints. 
This project is designed to demonstrate several types of requests the server receives and how the server processes 
these requests in order to provide the required responses. These requests include:

- GET
- POST
- PATCH
- DELETE

This project was envisioned using a TDD approach and, as a result, all parameters are carefully tested for successful 
and unsuccessful request-responses, leading to specific errors in the result of an error. [FRONT END PROJECT](https://github.com/Arkodia0001/nc-news)
## Run Locally
### Requirements

node - v21.4.0
PostgreSQL 14.11 (Homebrew) 

### Cloning & Set-up

#### Clone the project

```bash
  git clone https://github.com/Arkodia0001/nc-news.git
```

#### Go to the project directory

```bash
  cd nc-news
```

#### Install dependencies

```bash
  npm install
```

### Environment Variables
Create 2 .env files to gain access to the testing or development DBs conditionally. 
#### .env.development containing:

```
PGDATABASE=development_nc_news
```

#### .env.test containing:

```
PGDATABASE=test_nc_news
```
### Seeding & Starting
#### Set-up local databases 

```bash
  npm run setup-dbs
```

#### Seed local databases

```bash
  npm run seed
```

#### Start the server

```bash
  npm run start
```


## Running Tests

To run all tests, run the following command

```bash
  npm run test
```

To run app tests, run the following command

```bash
  npm run test app
```

To run utils tests, run the following command

```bash
  npm run test utils
```
## Tech Stack

**Server:** Node, Express