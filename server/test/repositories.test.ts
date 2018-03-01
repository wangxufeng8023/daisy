import { DailyRepository } from '../src/repositories/daily-repository'
import {} from 'jest'

let id = ''

let src = {
  date: '2017-11-07T00:00:00.000Z',
  week: '11',
  garden: '雅苑',
  roomnumber: '603',
  leader: '李佳航',
  sex: '女生',
  desc: '脸盆脏',
  class: '2',
  grade: '2018',
  teacher: '李飞'
}

describe('test dailies repository', () => {
  test('should create object success.', () => {
    let r: any = new DailyRepository('dailies')
    expect(r.collection).toBe('dailies')
    expect(r.config.dbname).toBe('sanitation')
  })

  test('should create a new daily.', async () => {
    let r: any = await new DailyRepository('dailies').create(src)
    console.log(r)
    id = r
    expect(r).toBeDefined()
  })

  test('should find one daily.', async () => {
    let r: any = await new DailyRepository('dailies').find({ _id: id })
    console.log(r)
    expect(r.length).toBe(1)
  })

  test('should delete daily.', async () => {
    let r: any = await new DailyRepository('dailies').delete(id)
    expect(r).toBe(1)
  })

  test('shoud find update and delete failed.', async () => {
    let id = '5a859eee13bcff5fa41a6dc6'
    let b: any = await new DailyRepository('dailies').find({ _id: id })
    expect(b.length).toBe(0)

    let c: any = await new DailyRepository('dailies').update(id, src)
    expect(c).toBe(0)

    let d: any = await new DailyRepository('dailies').delete(id)
    expect(d).toBe(0)
  })
})
