const {OpenAI} = require('openai')
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config()

const authController = require('./controllers/authController');
const indexController = require('./controllers/indexController');
const gachaController = require('./controllers/gachaController');
const authMiddleware = require('./middleware/auth');
const userModel = require('./models/userModel')

const PORT = process.env.PORT || 3000

const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', indexController.home);
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public/register.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public/login.html')));
// 在路由配置部分添加
app.get('/gacha', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/gacha.html'));
  });
  
app.post('/gacha/pull', authMiddleware, gachaController.draw);


app.post('/register', authController.register);
// 确保登录路由正确配置
app.post('/login', authController.login);
app.get('/gacha/history', authMiddleware, gachaController.getHistory);
// 添加测试路由验证中间件
app.get('/test-auth', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});


app.get('/logout', (req, res) => {
    // 清除 sessionStorage 中的 JWT
    res.clearCookie('token'); // 如果之前使用了 Cookie，也需要清除
    res.send('<script>sessionStorage.removeItem("token"); window.location.href = "/";</script>');
});

// 获取角色列表
app.get('/characters', authMiddleware, async (req, res) => {
    try {
      console.log(`[characters] 接收到角色列表请求，用户ID: ${req.user.id}`);
  
      const characters = await userModel.getUserCharacters(req.user.id);
      console.log(`[characters] 返回的角色列表数据:`, characters);
  
      res.json({ success: true, data: characters });
    } catch (err) {
      console.error(`[characters] 获取角色列表失败:`, err);
      res.status(500).json({ success: false, error: '获取角色列表失败' });
    }
  });
const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY})

app.post('/message', async (req, res) => {
    const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
            {
                role: 'user',
                content: req.body.message
            }
        ]
    })
    res.send({message: response.choices[0].message.content})
})

app.listen(PORT, () => {
    console.log(`PORT listening to ${PORT}`);
})