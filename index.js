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

const PORT = process.env.PORT || 3000

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', indexController.home);
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public/register.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public/login.html')));

app.post('/register', authController.register);
app.post('/login', authController.login);

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