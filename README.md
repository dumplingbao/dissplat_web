# 前端（iview）+后端（nodejs+koa2+sequelize）分离框架搭建



[![](https://img.shields.io/travis/iview/iview-admin.svg?style=flat-square)](https://travis-ci.org/iview/iview-admin)[![vue](https://img.shields.io/badge/vue-2.5.17-brightgreen.svg?style=flat-square)](https://github.com/vuejs/vue)[![iview ui](https://img.shields.io/badge/iview-3.2.2-brightgreen.svg?style=flat-square)](https://github.com/iview/iview)

后端源码：https://github.com/dumplingbao/dissplat

前端源码：https://github.com/dumplingbao/dissplat_web

## 概述

[iview](https://www.iviewui.com/)：一套基于 Vue.js 的高质量UI 组件库，主流vue前端框架，比较适合前后端分离框架的搭建，当然你也可以选择其他的

koa2：基于nodejs平台的下一代web开发框架，这里我们不选早期的目前用的最多的Express，也不选阿里开源的框架egg，我们选择则目前比较新的koa2，写起来简单，也易于学习

sequelize：这个是个nodejs的ORM框架，用的比较多，关于这个框架的介绍，可以看一下我的另一篇博客，node之ORM框架。

搭建这个前后端分离的框架纯属娱乐加学习，写此博客就是把搭建过程介绍一下，也作为自己的一点心得吧。

## 后端-koa

先找个轮子，这里用狼叔的koa-generator来生成项目架构

```bash
npm install koa-generator -g
koa2 dissplat //项目名称
```

生成文档结构

```
.
├── bin
├── public
├── routes
├── view
├── package.json
└── app.js
```

既然是轮子，直接就可以运行了

```bash
npm install
npm run dev
```

系统自动创建users表

```
(node:15140) [SEQUELIZE0002] DeprecationWarning: The logging-option should be either a function or false. Default: console.log
Executing (default): CREATE TABLE IF NOT EXISTS `users` (`id` INTEGER auto_increment , `nickname` VARCHAR(255), `email` VARCHAR(128) UNIQUE, `password` VARCHAR(255), `created_at` DATETIME, `updated_at` DATETIME NOT NULL, `deleted_at` DATETIME, PRIMARY KEY (`id`)) ENGINE=InnoDB;
Executing (default): SHOW INDEX FROM `users`
```



## sequelize持久化ORM框架

我们先按这个结构走，因为我们搭建前后端分离的框架，所以，public下面的图片、样式文件夹用不到，我们就把sequelize的model、dao、service、配置文件等放到public下面，删除public下面之前已有的文件

### config

public下面新建一个config文件夹，里面创建config.js，放数据库的配置信息

```
module.exports = {
​    database: {
​        dbName: 'boblog',
​        host: 'localhost',
​        port: 3306,
​        user: 'root',
​        password: 'root'
​    }
}
```

### db.js

新建一个utils文件夹，创建一个db.js，我们简单封装，创建一个连接数据库的工具类

```
const Sequelize = require('sequelize')
const {
​    dbName,
​    host,
​    port,
​    user,
​    password
} = require('../config/config').database
const sequelize = new Sequelize(dbName, user, password, {
​    dialect: 'mysql',
​    host,
​    port,
​    logging: true,
​    timezone: '+08:00',
​    define: {
​        // create_time && update_time
​        timestamps: true,
​        // delete_time
​        paranoid: true,
​        createdAt: 'created_at',
​        updatedAt: 'updated_at',
​        deletedAt: 'deleted_at',
​        // 把驼峰命名转换为下划线
​        underscored: true,
​        scopes: {
​            bh: {
​                attributes: {
​                    exclude: ['password', 'updated_at', 'deleted_at', 'created_at']
​                }
​            },
​            iv: {
​                attributes: {
​                    exclude: ['content', 'password', 'updated_at', 'deleted_at']
​                }
​            }
​        }
​    }
})
// 创建模型
sequelize.sync({
​    force: false
})
module.exports = {
​    sequelize
}
```

### model

接下来新建一个model文件夹，创建一个user.js，创建一个user的model

```
const moment = require('moment');
const bcrypt = require('bcryptjs')
const {Sequelize, Model} = require('sequelize')
const {db} = require('../utils/db')

class User extends Model {}
User.init({
    // attributes
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // 昵称
    nickname: Sequelize.STRING,
    // 邮箱
    email: {
        type: Sequelize.STRING(128),
        unique: true
    },
    // 密码
    password: {
        type: Sequelize.STRING,
        set(val) {
            // 加密
            const salt = bcrypt.genSaltSync(10);
            // 生成加密密码
            const psw = bcrypt.hashSync(val, salt);
            this.setDataValue("password", psw);
        }
    },
    created_at: {
        type: Sequelize.DATE,
        get() {
            return moment(this.getDataValue('created_at')).format('YYYY-MM-DD');
        }
    }
}, {
    db,
    modelName: 'users'
    // options
});
```

### dao

接下来新建一个dao文件夹，创建一个user.js，创建一个user的dao，负责CRUD

```
const {User} = require('../model/user')
const bcrypt = require('bcryptjs')
class UserDao {
​    // 创建用户
​    static async createUser(v) {
​        const hasUser = await User.findOne({
​            where: {
​                email: v.email,
​                deleted_at: null
​            }
​        });
​        
​        if (hasUser) {
​            throw new global.errs.Existing('用户已存在');

​        }
​        const user = new User();
​        user.email = v.email;
​        user.password = v.password;
​        user.nickname = v.nickname;
​        return user.save();
​    }
​    // 验证密码
​    static async verifyEmailPassword(email, plainPassword) {
​        // 查询用户是否存在
​        const user = await User.findOne({
​            where: {
​                email
​            }
​        })
​        if (!user) {
​            throw new global.errs.AuthFailed('账号不存在')
​        }
​        // 验证密码是否正确
​        const correct = bcrypt.compareSync(plainPassword, user.password);
​        if (!correct) {
​            throw new global.errs.AuthFailed('密码不正确')
​        }
​        return user
​    }
​    // 删除用户
​    static async destroyUser(id) {
​        const user = await User.findOne({
​            where: {
​                id,
​                deleted_at: null
​            }
​        });
​        if (!user) {
​            throw new global.errs.NotFound('没有找到此用户');
​        }
​        user.destroy()
​    }
​    // 获取用户详情
​    static async getUserInfo(id) {
​        const user = await User.findOne({
​            where: {
​                id
​            }
​        });
​        if (!user) {
​            throw new global.errs.NotFound('没有找到用户信息');
​        }
​        return user
​    }
​    // 更新用户
​    static async updateUser(id, v) {
​        const user = await User.findByPk(id);
​        if (!user) {
​            throw new global.errs.NotFound('没有找到用户信息');
​        }
​        user.email = v.get('query.email');
​        user.password = v.get('query.password2');
​        user.nickname = v.get('query.nickname');
​        user.save();
​    }

​    static async getUserList(page = 1) {
​        const pageSize = 10;
​        const user = await User.findAndCountAll({
​            limit: pageSize,//每页10条
​            offset: (page - 1) * pageSize,
​            where: {
​                deleted_at: null
​            },
​            order: [
​                ['created_at', 'DESC']
​            ]
​        })
​        return {
​            data: user.rows,
​            meta: {
​                current_page: parseInt(page),
​                per_page: 10,
​                count: user.count,
​                total: user.count,
​                total_pages: Math.ceil(user.count / 10),
​            }
​        };
​    }
}
module.exports = {
​    UserDao
}
```



## 前端iview

直接下载[iview-admin](https://github.com/iview/iview-admin)项目DEMO

```
# clone the project
git clone https://github.com/iview/iview-admin.git

// install dependencies
npm install

// develop
npm run dev
```

```
.
├── config  开发相关配置
├── public  打包所需静态资源
└── src
├── api  AJAX请求
└── assets  项目静态资源
├── icons  自定义图标资源
└── images  图片资源
├── components  业务组件
├── config  项目运行配置
├── directive  自定义指令
├── libs  封装工具函数
├── locale  多语言文件
├── mock  mock模拟数据
├── router  路由配置
├── store  Vuex配置
├── view  页面文件
└── tests  测试相关
```

效果图

![iview-login](https://ossbao.oss-cn-qingdao.aliyuncs.com/dissplat/iview-login.jpg)

### 菜单修改

默认菜单读取routers.js，可以根据权限组控制，也可以根据权限读取菜单进行加载，菜单里面meta的配置说明如下，因为有些是路由，不显示在菜单里面，比如表单的CRUD操作。

```
/**
 * iview-admin中meta除了原生参数外可配置的参数:
 * meta: {
 *  title: { String|Number|Function }
 *         显示在侧边栏、面包屑和标签栏的文字
 *         使用'{{ 多语言字段 }}'形式结合多语言使用，例子看多语言的路由配置;
 *         可以传入一个回调函数，参数是当前路由对象，例子看动态路由和带参路由
 *  hideInBread: (false) 设为true后此级路由将不会出现在面包屑中，示例看QQ群路由配置
 *  hideInMenu: (false) 设为true后在左侧菜单不会显示该页面选项
 *  notCache: (false) 设为true后页面在切换标签后不会缓存，如果需要缓存，无需设置这个字段，而且需要设置页面组件name属性和路由配置的name一致
 *  access: (null) 可访问该页面的权限数组，当前路由设置的权限会影响子路由
 *  icon: (-) 该页面在左侧菜单、面包屑和标签导航处显示的图标，如果是自定义图标，需要在图标名称前加下划线'_'
 *  beforeCloseName: (-) 设置该字段，则在关闭当前tab页时会去'@/router/before-close.js'里寻找该字段名对应的方法，作为关闭前的钩子函数
 * }
 */
```

![iview-home](https://ossbao.oss-cn-qingdao.aliyuncs.com/dissplat/iview-home.jpg)

## 简单构建

### 登录

将main.js里面的mock注释掉，mock拦截并模拟后台数据

```
// 实际打包时应该不引入mock
/* eslint-disable */
// if (process.env.NODE_ENV !== 'production') require('@/mock')
```

config.js配置baseUrl

```
/**
   \* @description api请求基础路径
   */
  baseUrl: {
​    dev: 'http://localhost:8888/',
​    pro: 'http://localhost:8888/'
  },
```

### jwt获取token

后端创建util.js 创建token

```
const jwt = require('jsonwebtoken')
const {security} = require('../config/config')
// 颁布令牌
const generateToken = function (uid, scope) {
​    const secretKey = security.secretKey;
​    const expiresIn = security.expiresIn;
​    const token = jwt.sign({
​        uid,
​        scope
​    }, secretKey, {
​        expiresIn: expiresIn
​    })
​    return token
}
module.exports = {
​    generateToken,
}
```

前端请求过滤，请求加token验证，axios.js修改

```
if (!config.url.includes('/login')) {
​        // const base64 = Base64.encode(token + ':');
​        config.headers['Authorization'] = 'Basic ' + Base64.encode(Cookies.get(TOKEN_KEY) + ':')
​      }
```

后端采用basic-auth登录认证，见auth.js

### 跨域问题

iview前端axios配置，找到axios.js配置文件

```
 getInsideConfig () {
​    const config = {
​      baseURL: this.baseUrl,
​      changeOrigin: true,
​      headers: {
​        'Content-Type': 'application/json; charset=utf-8',
​        'Access-Control-Allow-Origin': '*'
​      }
​    }
​    return config
  }
```

后端设置CORS来解决跨域问题，配置app.js，需要安装npm对应的包

```
const cors = require('@koa/cors');

app.use(cors({
  origin: function (ctx) {
​      // if (ctx.url === '/api') {
​      //     return "*"; // 允许来自所有域名请求
​      // }
​      // return 'http://localhost:8080';
​      return "*"; // 允许来自所有域名请求
  },
  exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
  maxAge: 5,
  credentials: true,
  allowMethods: ['OPTIONS','GET', 'PUT','POST', 'DELETE'], //设置允许的HTTP请求类型
  allowHeaders: ['Origin', 'Content-Type', 'Accept', 'Access-Control-Allow-Origin', 'Authorization', 'X-Requested-With'],
}));
```

## 简单封装

后端-util文件下

auth.js：访问认证

error.js：异常错误封装

help.js：请求封装

util.js：jwt获取token