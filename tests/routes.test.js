const request = require('supertest');
const { clearSummaryCache } = require('../src/services/plantSummaryCache');

process.env.NODE_ENV = 'test';

jest.mock('../src/database', () => {
  const { createDatabase } = jest.requireActual('../src/database');
  const db = createDatabase(':memory:');
  db.createDatabase = createDatabase;
  return db;
});

const app = require('../src/app');

describe('Routes', () => {
  afterEach(() => {
    clearSummaryCache();
    if (global.fetch && global.fetch.mockRestore) {
      global.fetch.mockRestore();
    }
  });

  test('GET / returns 200', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
  });

  test('GET /garden-plan returns 200', async () => {
    const res = await request(app).get('/garden-plan');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Garden Plan Designer');
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

  test('GET /plant-database returns 200', async () => {
    const res = await request(app).get('/plant-database');
    expect(res.status).toBe(200);
  });

  test('GET /plant-database supports query filters', async () => {
    const res = await request(app).get('/plant-database?search=tomato&type=vegetable&sunlight=full&page=1');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Tomato');
  });

  test('GET /plant-database supports new tree category filter', async () => {
    const res = await request(app).get('/plant-database?type=tree&page=1');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Japanese Maple');
  });

  test('GET /plant-database supports cactus category filter', async () => {
    const res = await request(app).get('/plant-database?type=cactus&page=1');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Saguaro');
  });

  test('GET /plant-database/:id returns dedicated plant detail page', async () => {
    const res = await request(app).get('/plant-database/acer-palmatum');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Japanese Maple');
    expect(res.text).toContain('Open Reference Summary Page');
  });

  test('GET /plant-database/:id/reference returns dedicated summary page', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        query: {
          pages: {
            123: { extract: 'Maple summary from API.' }
          }
        }
      })
    });

    const res = await request(app).get('/plant-database/acer-palmatum/reference');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Reference Summary');
    expect(res.text).toContain('Maple summary from API.');
  });

  test('GET /plant-database/api/summary returns cached summary payload', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        query: {
          pages: {
            123: { extract: 'Tomato summary from API.' }
          }
        }
      })
    });

    const first = await request(app).get('/plant-database/api/summary?query=Tomato');
    const second = await request(app).get('/plant-database/api/summary?query=Tomato');

    expect(first.status).toBe(200);
    expect(first.body.summary).toBe('Tomato summary from API.');
    expect(first.body.cached).toBe(false);
    expect(second.status).toBe(200);
    expect(second.body.cached).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  test('GET /plants/:id/edit returns 200 for existing plant', async () => {
    await request(app)
      .post('/plants/add')
      .send('name=Basil&type=herb&cultivation=indoor&planting_date=2024-03-01&notes=initial');

    const plantsPage = await request(app).get('/plants');
    const match = plantsPage.text.match(/\/plants\/(\d+)\/edit/);

    expect(match).toBeTruthy();

    const res = await request(app).get(`/plants/${match[1]}/edit`);
    expect(res.status).toBe(200);
  });

  test('POST /plants/:id/edit redirects to /plants', async () => {
    await request(app)
      .post('/plants/add')
      .send('name=Rosemary&type=herb&cultivation=outdoor&planting_date=2024-03-01&notes=initial');

    const plantsPage = await request(app).get('/plants');
    const match = plantsPage.text.match(/\/plants\/(\d+)\/edit/);

    expect(match).toBeTruthy();

    const res = await request(app)
      .post(`/plants/${match[1]}/edit`)
      .send('name=Rosemary+Bed+A&common_name=Rosemary&scientific_name=Rosmarinus+officinalis&genus=Salvia&family=Lamiaceae&sunlight_preference=full&soil_type=Sandy&common_pests_diseases=Powdery+mildew&toxicity=Concentrated+oil+harmful&type=herb&cultivation=outdoor&planting_date=2024-03-01&notes=updated');

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/plants');
  });
});
