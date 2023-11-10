# Swimhub API

This API forms the backend of the Swimhub project, providing endpoints for fetch requests, user authentication and database storage for the Swimhub client.

The project is written in Express.js and Typescript, and connects to the following databases:

- PostgreSQL - Main database containing most of the generated data.
- MongoDB - Contains logs for fetch requests.
- Redis - Caching database used for user sessions and endpoint rate limiting.

Other packages include:

- Prisma - ORM connected to PostgreSQL database.
- Mongoose - ODM connected to MongoDB database.
- Sendgrid - Automated emails for user authentication and error log notification.
- Express-Session - Session token creation and storage
- Jest and Supertest - Unit testing endpoints.

## Requirements

- Node v18
- npm v9

## Installation

To run the project locally you will need to connect to your own PostgreSQL, MongoDB and Redis databases. To use the automated email functionality you will also need a Sendgrid account.

1. To install and run locally, clone the github repo, then run the command `npm install` to install all depencies.
2. create a `.env` file in the project root and add the environment variables as listed in the `.env.example` file.
3. Run the command `npx prisma migrate dev` to generate all the tables in the PostreSQL database.
4. Run the command `npm run dev` to start the server. The default url for the server is `http://localhost:5000`. If you wish to change this to a different port, change the `port` constant in the `server.ts` file.
5. **(Optional)** There are prisma seeds for creating dummy users and entries in the PostreSQL database. The code for these are in the `lib/prisma/seeds` directory. By default the user-seed will generate 100 random users, and the entry-seed will generate 100 random entries.

**_NOTE: Entries have a direct relationship to Users, so each entry has to be linked to a user. If you are generating seeds, you MUST generate the users first, THEN the entries._**

### To generate the seeds:

1. In the `package.json` file, change the "prisma" -> "seed" section to

```json
"seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} src/lib/prisma/seeds/user-seed.prisma.ts"
```

2. Run the command `npx prisma db seed` to generate random users.
3. In the `package.json` file, change the "prisma" -> "seed" section to

```json
"seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} src/lib/prisma/seeds/entry-seed.prisma.ts"
```

4. Run the command `npx prisma db seed` to generate random entries linked to the users.

If you wish to change the number of seeds generated, change the `genCount` constant in the corresponding seed file.

## Usage

You can either make calls to the API from the deployed version or locally. When running locally the default base url is `http://localhost:5000`, so to get a list of entries send a GET request to `http://localhost:5000/entry`.

For more details and instruction on using the API, please refer to [The Official Documentation](https://swimhub-api-docs.netlify.app/).
