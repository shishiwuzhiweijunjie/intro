const {OpenAI} = require('openai')
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config()

const PORT = process.env.PORT || 3000

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // 替换为你的数据库用户名
    password: 'root1234', // 替换为你的数据库密码
    database: 'myapp'
});

db.connect((err) => {
    if (err) {
        console.error('数据库连接失败:', err);
        return;
    }
    console.log('数据库连接成功');
});

// 注册页面路由
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// 注册功能路由
app.post('/register', [
    body('username').isLength({ min: 3 }).withMessage('用户名至少需要3个字符'),
    body('email').isEmail().withMessage('请输入有效的邮箱'),
    body('password').isLength({ min: 6 }).withMessage('密码至少需要6个字符')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(sql, [username, email, hashedPassword], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: '用户名或邮箱已存在' });
            }
            return res.status(500).json({ error: '服务器错误' });
        }
        res.json({ message: '注册成功' });
    });
});

// 登录页面路由
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// 登录功能路由
app.post('/login', [
    body('username').isLength({ min: 3 }).withMessage('用户名至少需要3个字符'),
    body('password').isLength({ min: 6 }).withMessage('密码至少需要6个字符')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], async (err, results) => {
        if (err) {
            return res.status(500).json({ error: '服务器错误' });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: '用户名或密码错误' });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: '用户名或密码错误' });
        }

        // 生成 JWT
        const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: '登录成功', token });
    });
});

// 登出功能路由
app.get('/logout', (req, res) => {
    res.clearCookie('token'); // 清除 JWT
    res.redirect('/');
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