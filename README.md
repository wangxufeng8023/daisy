# 雏菊

雏菊是一个学校内务检查管理系统。

开发代号：daisy 

给我的她！


代码开源仅用于学习交流分享，商业使用请联系作者。

## TODO
- 文档模板的标题、路径写在配置文件里
- docx-template 是基础类，pdf-template 继承它



## 特性

- 快速录入内务检查数据。
- 按学期查询。
- 存储班级宿舍数据，导出数据文档。
- 存储内务检查数据，导出检查情况表和通报表。
- 备份数据为文本文件。



## 系统要求

- Windows 7 或以上 64 位操作系统。
- Office 2010（可选。通过 VBS 调用转换 `docx` 文件为 `pdf` 文件）。
- Nodejs 8.4.0 或以上。
- MongoDB 3.4.5 或以上。

**注意：** Linux 和 macOS 也可以运行，可生成 `docx` 文件，但不支持将 `docx` 文件转换为 `pdf` 文件。

## 部署

1. 压项目文件到本地硬盘，进入前端 `f` 和后端 `b` 文件夹运行 `npm install` 安装依赖。
2. 进入前端 `f` 文件夹，运行 `cp-to-b.bat` 构建前端并复制文件到后端 `b` 文件夹。
3. 安装 MongoDB 数据库 64 位版本，程序目录加入环境变量。
4. 修改启动脚本 `start-daisy.bat` 中数据库文件的地址为实际地址。
5. 运行 `start-daisy.bat` 启动程序。
6. 浏览器打开 `127.0.0.1:3000` 开始使用。
7. 退出时运行 `stop-daisy.bat`。


## 使用

### 初始化数据库

### 设置参数

```json
{
    "url_prefix": "/api/v2",
    "dburl": "mongodb://localhost:27017",
    "dbname": "sanitation",
    "daterange": {
        "from": "2017-08-27",
        "to": "2018-03-01"
    },
    "schoolterm": "高三上学期"
}
```

### 添加班级宿舍数据

### 添加内务检查数据

## 设计



### 前端 Vue.js 页面



#### 组件

- `App.vue` 主框架页面
- `frame.vue` 页面框架页面
- `class.vue` 班级组件页面
- `daily.vue` 内务检查组件页面
    - `overview.vue` 概览页面
    - `oneweek.vue` 一周详情页面
    - `newdaily.vue` 新增检查页面
- `setting.vue` 设置页面
- `about.vue` 关于页面



### 后端 RESTful API



#### 测试数据库连通

- `GET /api/v2/connection`
- 响应状态码：200


#### 重置数据库集合

- `GET /api/v2/db?collection=<collection>`
- 响应状态码：200



#### 获取班级宿舍

- `GET /classes` 
- 响应状态码：200
- 响应体：
```json
[
    {
        "_id": "595f8683cf8cc8d1b368030f",
        "grade": "2018",
        "class": "7",
        "teacher": "吴用",
        "rooms": [
            {
                "garden": "和苑",
                "sex": "男生",
                "roomnumber": "308",
                "leader": "高逑"
            },
            {
                "garden": "和苑",
                "sex": "男生",
                "roomnumber": "310",
                "leader": "宋江"
            },
            {
                "garden": "和苑",
                "sex": "男生",
                "roomnumber": "311",
                "leader": "阮小七"
            }
        ]
    },
    {
        "_id": "595f8683cf8cc8d1b368030d",
        "grade": "2018",
        "class": "5",
        "teacher": "鲁智深",
        "rooms": [
            {
                "garden": "和苑",
                "sex": "男生",
                "roomnumber": "406",
                "leader": "杨志"
            },
            {
                "garden": "和苑",
                "sex": "男生",
                "roomnumber": "407",
                "leader": "花荣"
            }
        ]
    }
]
```

#### 获取单个班级
- `GET /classes/:id` 
- 响应状态码：200
- 响应体：
```json
{
  "grade": "2018",
  "class": "2",
  "teacher": "宋江",
  "rooms": [{
    "garden": "雅苑",
    "sex": "女生",
    "roomnumber": "206",
    "leader": "潘金莲"
  }, {
    "garden": "和苑",
    "sex": "男生",
    "roomnumber": "608",
    "leader": "林冲"
  }]
}
```

#### 新增班级

- `POST /classes` 
- 响应状态码：201
- 响应体：
```json
{
  "class_id": "57ea257b3670ca3f44c5beb6"
}
```

#### 更新班级

- `PUT /classes/:id` 
- 响应状态码：204
- 响应体：
```json
{
  "count": 1
}
```

#### 删除班级

- `DELETE /classes/:id` 
- 响应状态码：200
- 响应体：
```json
{
  "count": 1
}
```


#### 获取内务检查数据

- `GET /dailies` 
- 响应状态码：200
- 响应体：
```json
[
    {
        "_id": "5a0ee8b63ae7c90ce06b355a",
        "date": "2017-11-13T00:00:00.000Z",
        "week": "12",
        "garden": "雅苑",
        "roomnumber": "505",
        "leader": "贾玲",
        "sex": "女生",
        "desc": "5床床单皱",
        "class": "6",
        "grade": "2018",
        "teacher": "李隆基"
    },
    {
        "_id": "5a0ee8c33ae7c90ce06b355b",
        "date": "2017-11-13T00:00:00.000Z",
        "week": "12",
        "garden": "雅苑",
        "roomnumber": "503",
        "leader": "赵飞燕",
        "sex": "女生",
        "desc": "1床下脏",
        "class": "7",
        "grade": "2018",
        "teacher": "杨玉环"
    }
]
```

#### 获取单个内务检查
- `GET /dailies/:id` 
- 响应状态码：200
- 响应体：
```json
{
    "_id": "5a0ee8c33ae7c90ce06b355b",
    "date": "2017-11-13T00:00:00.000Z",
    "week": "12",
    "garden": "雅苑",
    "roomnumber": "503",
    "leader": "赵飞燕",
    "sex": "女生",
    "desc": "1床下脏",
    "class": "7",
    "grade": "2018",
    "teacher": "杨玉环"
}

```

#### 新增内务检查

- `POST /dailies` 
- 响应状态码：201
- 响应体：
```json
{
  "daily_id": "57ea257b3670ca3f44c5beb6"
}
```

#### 删除内务检查

- `DELETE /dailies/:id` 
- 响应状态码：200
- 响应体：
```json
{
  "count": 1
}
```

#### 获取宿舍

- `GET /dormitories?grade=2019` 
- 响应状态码：200
- 响应体：
```json
[
    {
        "_id": {
            "garden": "雅苑"
        },
        "rooms": [
            {
                "garden": "雅苑",
                "roomnumber": "609",
                "sex": "女生",
                "grade": "2018",
                "class": "4",
                "teacher": "关羽",
                "leader": "孙权"
            },
            {
                "garden": "雅苑",
                "roomnumber": "602",
                "sex": "女生",
                "grade": "2018",
                "class": "1",
                "teacher": "张飞",
                "leader": "刘备"
            }
        ]
    },
    {
        "_id": {
            "garden": "和苑"
        },
        "rooms": [
            {
                "garden": "和苑",
                "roomnumber": "302",
                "sex": "男生",
                "grade": "2018",
                "class": "10",
                "teacher": "刘姥",
                "leader": "探春"
            },
            {
                "garden": "和苑",
                "roomnumber": "308",
                "sex": "男生",
                "grade": "2018",
                "class": "7",
                "teacher": "惜春",
                "leader": "宝玉"
            },
            {
                "garden": "和苑",
                "roomnumber": "311",
                "sex": "男生",
                "grade": "2018",
                "class": "7",
                "teacher": "元春",
                "leader": "宝钗"
            }
        ]
    }
]
```



#### 获取配置

- `GET /config` 获取配置信息
- 响应状态码：200
- 响应体：
```json
{
    "url_prefix": "/api/v2/",
    "dburl": "mongodb://localhost:27017",
    "dbname": "sanitation",
    "daterange": {
        "from": "2017-08-27",
        "to": "2018-03-01"
    },
    "schoolterm": "高三上学期"
}
```

- `POST /config` 保存配置信息
- 响应状态码：201


#### 备份数据

- `GET /backupdata` 
- 响应状态码：200

#### 获取建议

- `GET /suggestions` 
- 响应状态码：200
- 响应体：
```json
{
    "_id": 0,
    "desc": [
        "1床床单皱",
        "柜子上有灰尘",
        "阳台不干净",
        "3床下有垃圾",
        "5床被子不规范",
        "8床被子摆放不规范",
        "3床床单皱",
        "垃圾未倒"
    ]
}
```

#### 过滤信息


- `?week=18` 查询的周次是 18 周
- `?sex=男生` 查询男生
- `?grade=2018` 查询的年级
- `?garden=雅苑` 查询某个院子
- `?offset=10` 偏移量
- `?page=1&per_page=20` 分页
- `?class=2` 查询某个班级


#### 内务卫生检查情况表

- `GET /documents?type=report&format=docx&grade=2018&week=18&sex=女生` 
- 响应状态码：200
- 响应体：
```json
{
    "file_path": "文件下载链接"
}
```

#### 内务卫生通报表

- `GET /documents?type=notice&format=docx&grade=2018&week=18` 
- 响应状态码：200
- 响应体：
```json
{
    "file_path": "文件下载链接"
}
```

#### 班级宿舍表

- `GET /documents?type=classes&format=docx&grade=2018` 
- 响应状态码：200
- 响应体：
```json
{
    "file_path": "文件下载链接"
}
```
- `/daily/report?grade=2019&week=20&garden=雅苑&sex=女生` 导出内务卫生检查情况表
- `/daily/notice?grade=2019&week=20` 导出内务卫生通报表
- `/daily/notice?grade=2019@week=0` `week` 为零时，导出班级宿舍情况表
- `/classes/details?grade=2019` 导出班级宿舍详情


### 数据库

MongoDB

- db: sanitation （卫生情况数据库）
- collection:
    - classes （班级宿舍集合）
    - dailies （内务检查集合）


dburl: `mongodb://localhost:27017/sanitation`


#### 数据导出和导入

导出数据库中的集合数据：

```
mongoexport -d sanitation -c classes -o <backupfile>.json
```

导入备份文件的数据：

```
mongoimport -d sanitation -c classes <backupfile>.json
```