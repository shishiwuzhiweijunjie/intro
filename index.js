const {OpenAI} = require('openai')
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
require('dotenv').config()
const upload = multer({ storage: multer.memoryStorage() });
const authController = require('./controllers/authController');
const indexController = require('./controllers/indexController');
const gachaController = require('./controllers/gachaController');
const shopController = require('./controllers/shopController');
const contactController = require('./controllers/contactController');
const authMiddleware = require('./middleware/auth');
const paymentController = require('./controllers/paymentController');
const userModel = require('./models/userModel')
const chatController = require('./controllers/chatController');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PORT = process.env.PORT || 3000


const app = express();

// 1. 用 http 模块包装 express app
const server = http.createServer(app); 
// 2. 将 Socket.io 挂载到 server 上
const io = new Server(server, {
    cors: { origin: "*" } // 允许跨域（生产环境建议限制域名）
});

app.post('/shop/webhook',  bodyParser.raw({ type: 'application/json' }), paymentController.handlePaymentSuccess);
app.use(bodyParser.json());
io.on('connection', (socket) => {
    console.log(`[PRTS_SYS] 节点已接入: ${socket.id}`);

    // 监听加入特定通讯频道的指令
    socket.on('join_channel', (conversationId) => {
        socket.join(conversationId);
        console.log(`[PRTS_SYS] 节点 ${socket.id} 加入了频道: ${conversationId}`);
    });

    // 监听发送消息的指令
    socket.on('send_message', async (data) => {
        try {
            // 1. 将情报持久化到数据库
            const newMessage = await prisma.message.create({
                data: {
                    content: data.content,
                    senderId: parseInt(data.senderId, 10), // <--- 【关键修改】强制转换为数字
                    conversationId: data.conversationId
                },
                include: { sender: true } 
            });

            // 2. 将情报在当前频道内进行全息广播 (含发送者自己)
            io.to(data.conversationId).emit('receive_message', newMessage);
        } catch (error) {
            console.error('[PRTS_ERR] 情报入库失败:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log(`[PRTS_SYS] 节点已断开: ${socket.id}`);
    });
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', indexController.home);
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public/register.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public/login.html')));
// 在路由配置部分添加
app.get('/gacha', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/gacha.html'));
  });
  app.get('/shop', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/shop.html'));
  });
  app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/game.html'));
  });
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
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
        model: 'gpt-4o',
        messages: [
            {
                role: 'user',
                content: req.body.message
            }
        ]
    })
    res.send({message: response.choices[0].message.content})
})

app.post('/image', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send({ error: 'No image uploaded' });
    }

    const imageBuffer = req.file.buffer;
    const base64Image = imageBuffer.toString('base64');

    try {
        const response = await openai.images.generate({
            prompt: `Describe the content of this image: ${base64Image}`,
            n: 1,
            size: '256x256',
            response_format: 'url'
        });

        res.send({ description: response.data[0].url });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Error processing image' });
    }
});


app.get('/shop/products', shopController.getProducts);

// 获取商品详情
app.get('/shop/products/:id', shopController.getProduct);

// 创建订单
app.post('/shop/orders', authMiddleware, shopController.createOrder);

// 支付订单
app.post('/shop/orders/:orderId/pay', authMiddleware, shopController.payOrder);

// 获取订单历史
app.get('/shop/orders', authMiddleware, shopController.getOrderHistory);

app.post('/shop/orders/:orderId/create-payment-intent', authMiddleware, paymentController.createPaymentIntent);
app.post('/api/contact', contactController.sendContactEmail);
app.get('/api/chat/users', chatController.searchUsers);
app.post('/api/chat/conversation', chatController.getOrCreateConversation);
app.get('/api/chat/messages/:conversationId', chatController.getMessages);
app.get('/api/chat/conversations/:userId', chatController.getUserConversations);
server.listen(PORT, () => {
    console.log(`[SYSTEM] 终端基站已启动，监听端口: ${PORT}`);
});