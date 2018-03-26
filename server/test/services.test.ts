import { DailyService } from '../src/services/daily-service'
import { DocumentService } from '../src/services/document-service'
import { DailyRepository } from '../src/repositories/daily-repository'
import { DocumentRepository } from '../src/repositories/document-repository'

import {} from 'jest'

const context = require('./context')

let id = ''

let src = {
  date: new Date('2018-03-27T00:00:00.000Z'),
  week: '31',
  garden: '雅苑',
  roomnumber: '603',
  leader: '李佳航',
  sex: '女生',
  desc: '脸盆脏',
  class: '2',
  grade: '2019',
  teacher: '李飞'
}

describe('test dailies service', () => {
  test('should create service object success.', () => {
    const ds = new DailyService(new DailyRepository('dailies'))
    expect(ds.config.dbname).toBe('sanitation')
  })

  test('should create a new daily.', async () => {
    let ctx = context()
    ctx.request.body = src
    let r: any = await new DailyService(new DailyRepository('dailies')).create(
      ctx
    )
    console.log('isSuccess?', r)
    id = r
    expect(r).toBeDefined()
  })

  test('should find one daily.', async () => {
    let ctx = context({
      url: '/api/v2/dailies'
    })
    ctx.search = '?grade=2019&week=31&sex=女生'

    let r: any = await new DailyService(new DailyRepository('dailies')).find(
      ctx
    )
    console.log(r)
    expect(r.length).toBe(1)
  })

  test('should delete daily.', async () => {
    let d: any = await new DailyRepository('dailies').delete(id)
    expect(d).toBe(1)
  })
})

describe('test document service', () => {
  test('shoud get class dormitory.', async () => {
    let ctx = context({ url: '/api/v2/documents' })
    ctx.search = '?grade=2019&type=dormitory&format=docx'
    let ds = await new DocumentService(new DocumentRepository())
    let doc = await ds.export(ctx)
    expect(doc.split('.')[1]).toBe('docx')
  })

  test('shoud get class dormitory.', async () => {
    let ctx = context({ url: '/api/v2/documents' })
    ctx.search = '?grade=2019&type=dormitory&format=pdf'
    let ds = await new DocumentService(new DocumentRepository())
    let doc = await ds.export(ctx)
    expect(doc.split('.')[1]).toBe('pdf')
  })
})
