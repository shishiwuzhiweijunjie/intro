// controllers/chatController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 搜索干员 (模糊匹配用户名)
exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.json([]);

        const users = await prisma.user.findMany({
            where: {
                username: { contains: query } 
            },
            // 【已修复】删除了不存在的 avatar 字段
            select: { id: true, username: true }, 
            take: 10
        });
        res.json(users);
    } catch (error) {
        console.error('[PRTS_ERR] 搜索干员失败:', error);
        res.status(500).json({ error: '数据检索失败' });
    }
};

// 发起私聊或获取已有会话
exports.getOrCreateConversation = async (req, res) => {
    try {
        const { currentUserId, targetUserId } = req.body;
        
        // 【已修复】将字符串 ID 转换为整数 Int
        const cid = parseInt(currentUserId, 10);
        const tid = parseInt(targetUserId, 10);

        const existingConvo = await prisma.conversation.findFirst({
            where: {
                isGroup: false,
                AND: [
                    { users: { some: { id: cid } } },
                    { users: { some: { id: tid } } }
                ]
            },
            include: { users: true }
        });

        if (existingConvo) {
            return res.json(existingConvo);
        }

        const newConvo = await prisma.conversation.create({
            data: {
                isGroup: false,
                users: {
                    connect: [{ id: cid }, { id: tid }]
                }
            },
            include: { users: true }
        });
        res.json(newConvo);
    } catch (error) {
        console.error('[PRTS_ERR] 建立链路失败:', error);
        res.status(500).json({ error: '建立通讯链路失败' });
    }
};

// 拉取历史通讯记录
exports.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await prisma.message.findMany({
            where: { conversationId: conversationId },
            // 【已修复】删除了 sender 里的 avatar 字段
            include: { sender: { select: { username: true } } },
            orderBy: { createdAt: 'asc' }
        });
        res.json(messages);
    } catch (error) {
        console.error('[PRTS_ERR] 获取消息失败:', error);
        res.status(500).json({ error: '拉取情报失败' });
    }
};

exports.getUserConversations = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        
        const convos = await prisma.conversation.findMany({
            where: {
                users: { some: { id: userId } }
            },
            include: {
                users: {
                    select: { id: true, username: true } // 把对方的名字也查出来
                }
            },
            orderBy: { updatedAt: 'desc' } // 按最近活跃时间排序
        });
        
        res.json(convos);
    } catch (error) {
        console.error('[PRTS_ERR] 获取会话列表失败:', error);
        res.status(500).json({ error: '拉取频道列表失败' });
    }
};