/*
  "POST /auth/signin endpoint" unit tests

  Uses Jest and Supertest packages to test POST /auth/signin endpoint responses.
  For more information on Jest, go to https://jestjs.io/docs/getting-started
  For more information on Supertest, go to https://www.npmjs.com/package/supertest
*/

//import packages
import request from 'supertest';

//test for successful signin
describe('user successfully signed in', () => {
  it('should return a 200 status code', async () => {
    const response = await request('http://localhost:5000')
      .post('/auth/signin')
      .send({ email: 'joe0345ws@mail.com', password: 'HelloWorld2023!' });
    expect(response.statusCode).toBe(200);
  });
});
