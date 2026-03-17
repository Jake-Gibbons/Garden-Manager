const request = require('supertest');

process.env.NODE_ENV = 'test';

jest.mock('../src/database', () => {
  const { createDatabase } = jest.requireActual('../src/database');
  const db = createDatabase(':memory:');
  db.createDatabase = createDatabase;
  return db;
});

const app = require('../src/app');

describe('Routes', () => {
  test('GET / returns 200', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
  });

  test('GET /plants returns 200', async () => {
    const res = await request(app).get('/plants');
    expect(res.status).toBe(200);
  });

  test('GET /plants/add returns 200', async () => {
    const res = await request(app).get('/plants/add');
    expect(res.status).toBe(200);
  });

  test('POST /plants/add redirects to /plants', async () => {
    const res = await request(app)
      .post('/plants/add')
      .send('name=Tomato&type=vegetable&cultivation=outdoor&planting_date=2024-03-01&notes=test');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/plants');
  });

  test('GET /reminders returns 200', async () => {
    const res = await request(app).get('/reminders');
    expect(res.status).toBe(200);
  });
});
