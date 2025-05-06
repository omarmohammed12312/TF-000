import request from 'supertest';
import { app } from './server';
import { resizeImage } from './imageProcessor';
import fs from 'fs';
import path from 'path';

describe('API Endpoints', () => {
  it('GET /api/health should return status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/images should return list of jpg files', async () => {
    const res = await request(app).get('/api/images');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      expect(res.body[0]).toMatch(/\.jpg$/i);
    }
  });

  it('GET /api/resize should return 400 for missing params', async () => {
    const res = await request(app).get('/api/resize');
    expect(res.status).toBe(400);
  });

  it('GET /api/resize should return 400 for non-existent file', async () => {
    const res = await request(app).get(
      '/api/resize?filename=nonexistent.jpg&width=100&height=100'
    );
    expect(res.status).toBe(400);
  });

  it('POST /api/upload should reject non-jpg files', async () => {
    const res = await request(app)
      .post('/api/upload')
      .attach('image', Buffer.from('test'), 'test.png');
    expect(res.status).toBe(400);
  });

});
