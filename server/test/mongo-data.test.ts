

import { MongoData } from "../src/domains/mongo-data"
import {} from "jest"


describe('测试 MongoData', () => {
  test('测试 MongoData', async () => {
    let a: any = await new MongoData('classes')
    expect(a.collection).toBe('classes')
  })

  let src = {
    "grade": "2019",
    "class": "16",
    "teacher": "李玉刚",
    "rooms": [
      {
        "garden": "和苑",
        "sex": "男生",
        "roomnumber": "409",
        "leader": "普晓天"
      },
      {
        "garden": "雅苑",
        "sex": "女生",
        "roomnumber": "506",
        "leader": "刀春丽"
      }
    ]
  }
  
  test('测试classes增删改查', async () => {
    let a: any = await new MongoData('classes').create(src)
    console.log(a)
    expect(a).toBeDefined()
    
    let id = a
    let b: any = await new MongoData('classes').find({ _id: id })
    expect(b.length).toBe(1)
    
    src.class = '6'
    let c: any = await new MongoData('classes').update(id, src)
    expect(c).toBe(1)
    
    let d: any = await new MongoData('classes').delete(id)
    expect(d).toBe(1)
    
  })

  test('测试classes查不到、改不了和未删除', async () => {
   
    let id = '5a859eee13bcff5fa41a6dc6'
    let b: any = await new MongoData('classes').find({ _id: id })
    expect(b.length).toBe(0)

    let c: any = await new MongoData('classes').update(id, src)
    expect(c).toBe(0)

    let d: any = await new MongoData('classes').delete(id)
    expect(d).toBe(0)

  })
})