/*
  "GET /user endpoint" unit tests

  Uses Jest and Supertest packages to test GET /user endpoint responses.
  For more information on Jest, go to https://jestjs.io/docs/getting-started
  For more information on Supertest, go to https://www.npmjs.com/package/supertest
*/

//import packages
import request from 'supertest';
import { UserObjectAdmin } from '../../types/user';

//test for successfully getting list of users with no params
describe('Users successfully fetched with no search params', () => {
  it('should return a 200 status code', async () => {
    const response = await request('http://localhost:5000').get('/user');
    expect(response.statusCode).toBe(200);
    expect(response.body.users.length).toBeLessThanOrEqual(10);
  });
});

//test for successfully getting users with different user roles
const userRoleOptions = ['user', 'moderator', 'admin'];

userRoleOptions.forEach((option) => {
  describe(`Users successfully fetched with role param: ${option}`, () => {
    it('should return a 200 status code', async () => {
      const response = await request('http://localhost:5000').get(
        `/user?role=${option}`
      );
      expect(response.statusCode).toBe(200);
      expect(response.body.users.length).toBeLessThanOrEqual(10);
      response.body.users.forEach((user: UserObjectAdmin) => {
        expect(user).toHaveProperty('role', option);
      });
    });
  });
});

//test for successfully getting users with different user statuses
const userStatusOptions = [
  'active',
  'inactive',
  'muted',
  'banned',
  'deleted',
  'locked',
];

userStatusOptions.forEach((option) => {
  describe(`Users successfully fetched with status param: ${option}`, () => {
    it('should return a 200 status code', async () => {
      const response = await request('http://localhost:5000').get(
        `/user?status=${option}`
      );
      expect(response.statusCode).toBe(200);
      expect(response.body.users.length).toBeLessThanOrEqual(10);
      response.body.users.forEach((user: UserObjectAdmin) => {
        expect(user).toHaveProperty('status', option);
      });
    });
  });
});

const booleanOptions = ['true', 'false'];
//test for successfully getting users with different is_teacher properties

booleanOptions.forEach((option) => {
  describe(`Users successfully fetched with ${option} teacher param`, () => {
    it('should return a 200 status code', async () => {
      const response = await request('http://localhost:5000').get(
        `/user?teacher=${option}`
      );
      expect(response.statusCode).toBe(200);
      expect(response.body.users.length).toBeLessThanOrEqual(10);
      response.body.users.forEach((user: UserObjectAdmin) => {
        expect(user).toHaveProperty('is_teacher', Boolean(option));
      });
    });
  });
});

//test for successfully getting users with different is_bio_public properties

booleanOptions.forEach((option) => {
  describe(`Users successfully fetched with ${option} biopublic param`, () => {
    it('should return a 200 status code', async () => {
      const response = await request('http://localhost:5000').get(
        `/user?biopublic=${option}`
      );
      expect(response.statusCode).toBe(200);
      expect(response.body.users.length).toBeLessThanOrEqual(10);
      response.body.users.forEach((user: UserObjectAdmin) => {
        expect(user).toHaveProperty('is_bio_public', Boolean(option));
      });
    });
  });
});

//test for getting error message from invalid email param
describe('Error returned from invalid email param', () => {
  it('should return a 400 status code', async () => {
    const response = await request('http://localhost:5000').get(
      '/user?email=joeblogs'
    );
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      code: 400,
      message: 'Invalid "email" search parameter.',
      params: ['email'],
    });
  });
});

//test for getting error message from invalid email param
describe('Error returned from invalid email param', () => {
  it('should return a 400 status code', async () => {
    const response = await request('http://localhost:5000').get(
      '/user?email=joeblogs'
    );
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      code: 400,
      message: 'Invalid "email" search parameter.',
      params: ['email'],
    });
  });
});

//test for getting error message from invalid role param
describe('Error returned from invalid email param', () => {
  it('should return a 400 status code', async () => {
    const response = await request('http://localhost:5000').get(
      '/user?role=joeblogs'
    );
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      code: 400,
      message: 'Invalid "role" search parameter.',
      params: ['role'],
    });
  });
});

//test for getting error message from invalid status param
describe('Error returned from invalid status param', () => {
  it('should return a 400 status code', async () => {
    const response = await request('http://localhost:5000').get(
      '/user?status=joeblogs'
    );
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      code: 400,
      message: 'Invalid "status" search parameter.',
      params: ['status'],
    });
  });
});

//test for getting error message from invalid teacher param
describe('Error returned from invalid teacher param', () => {
  it('should return a 400 status code', async () => {
    const response = await request('http://localhost:5000').get(
      '/user?teacher=joeblogs'
    );
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      code: 400,
      message: 'Invalid "teacher" search parameter.',
      params: ['teacher'],
    });
  });
});

//test for getting error message from invalid biopublic param
describe('Error returned from invalid biopublic param', () => {
  it('should return a 400 status code', async () => {
    const response = await request('http://localhost:5000').get(
      '/user?biopublic=joeblogs'
    );
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      code: 400,
      message: 'Invalid "biopublic" search parameter.',
      params: ['biopublic'],
    });
  });
});

//test for getting error message from invalid page param
describe('Error returned from invalid page param', () => {
  it('should return a 400 status code', async () => {
    const response = await request('http://localhost:5000').get(
      '/user?page=joeblogs'
    );
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      code: 400,
      message: 'Invalid "page" search parameter.',
      params: ['page'],
    });
  });
});

//test for getting error message from invalid limit param
describe('Error returned from invalid page param', () => {
  it('should return a 400 status code', async () => {
    const response = await request('http://localhost:5000').get(
      '/user?limit=joeblogs'
    );
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      code: 400,
      message: 'Invalid "limit" search parameter.',
      params: ['limit'],
    });
  });
});
