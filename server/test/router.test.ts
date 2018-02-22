

import { app } from "../src/app"
import * as request from "supertest"

let server

beforeEach(() => {
  server = app.listen()
})

afterEach(() => {
  server.close()
  
});

describe('测试路由', () => {

  test('GET /connet', async () => {
    let response = await request(server).get('/api/v2/connect')
    expect(response.status).toBe(200)
  })

  test('GET /config', async () => {
    let response = await request(server).get('/api/v2/config')
    expect(response.status).toBe(200)
    expect(response.body.dbname).toBe('sanitation')
  })

  test('GET /backup', async () => {
    let response = await request(server).get('/api/v2/backup')
    expect(response.status).toBe(200)
  })
  test('GET /classes', async () => {
    let response = await request(server)
      .get('/api/v2/classes?grade=2019')
    expect(response.status).toBe(200)
    expect(response.body.length).toBe(0)
  })

  test('GET /classes', async () => {
    let response = await request(server)
      .get('/api/v2/classes?grade=2018')
    expect(response.status).toBe(200)
    expect(response.body.length).toBe(18)
  })


  test('GET /dormitories', async () => {
    let response = await request(server)
      .get('/api/v2/dormitories?grade=2018')
    expect(response.status).toBe(200)
    expect(response.body.length).toBeGreaterThan(1)
  })




})