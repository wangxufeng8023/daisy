import { MongoData } from '../src/domains/mongo-data'
import {} from 'jest'

let id = ''

let src = {
  grade: '2019',
  class: '16',
  teacher: '李玉刚',
  rooms: [
    { garden: '和苑', sex: '男生', roomnumber: '409', leader: '普晓天' },
    { garden: '雅苑', sex: '女生', roomnumber: '506', leader: '刀春丽' }
  ]
}

describe('test mongodata', () => {
  test('should get mongodata object success.', () => {
    let a: any = new MongoData('classes')
    expect(a.collection).toBe('classes')
  })

  test('should create a new class.', async () => {
    let r: any = await new MongoData('classes').create(src)
    console.log(r)
    id = r
    expect(r).toBeDefined()
  })

  test('should find class.', async () => {
    let r: any = await new MongoData('classes').find({ _id: id })
    console.log(r)
    expect(r.length).toBe(1)
  })

  test('should update class.', async () => {
    src.class = '6'
    let r: any = await new MongoData('classes').update(id, src)
    expect(r).toBe(1)
    let rr: any = await new MongoData('classes').find({ _id: id })
    expect(rr[0].class).toBe('6')
  })

  test('should delete class.', async () => {
    let r: any = await new MongoData('classes').delete(id)
    expect(r).toBe(1)
  })

  test('shoud find update and delete failed.', async () => {
    let id = '5a859eee13bcff5fa41a6dc6'
    let b: any = await new MongoData('classes').find({ _id: id })
    expect(b.length).toBe(0)

    let c: any = await new MongoData('classes').update(id, src)
    expect(c).toBe(0)

    let d: any = await new MongoData('classes').delete(id)
    expect(d).toBe(0)
  })
})
