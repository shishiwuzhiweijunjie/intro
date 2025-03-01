// models/userModel.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

const userModel = {
  // 用户注册
  async registerUser(username, email, password) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
        },
      });
      return user;
    } catch (err) {
      throw err;
    }
  },

  // 用户登录
  async loginUser(username, password) {
    try {
      const user = await prisma.user.findUnique({
        where: { username },
      });

      if (!user) return null;

      const isMatch = await bcrypt.compare(password, user.password);
      return isMatch ? user : null;
    } catch (err) {
      console.error('登录查询错误:', err);
      throw err;
    }
  },

  // 获取所有有效物品
  async getAllValidItems() {
    try {
      const items = await prisma.gachaItems.findMany();
      return items;
    } catch (err) {
      throw new Error('获取抽卡物品失败');
    }
  },

  // 抽卡核心逻辑
  async gachaPull(userId, times) {
    try {
      const allItems = await this.getAllValidItems();
      let pity = await this.getPityCounter(userId);
      const results = [];

      for (let i = 0; i < times; i++) {
        // 更新计数器
        pity.fiveStarCounter++;
        pity.fourStarCounter++;

        // 计算稀有度
        const targetRarity = this.calculateRarity(pity);

        // 生成物品
        const item = this.generateItem(allItems, targetRarity, pity);

        // 更新保底状态
        this.updatePityAfterPull(pity, targetRarity, item);

        // 记录抽卡结果
        await this.recordGachaResult(userId, item);

        results.push(item);
      }

      await this.updatePityCounter(userId, pity);
      return results;
    } catch (err) {
      throw new Error('抽卡失败: ' + err.message);
    }
  },

  // 记录抽卡结果
  async recordGachaResult(userId, item) {
    try {
      await prisma.gachaHistory.create({
        data: {
          userId,
          itemName: item.name,
          rarity: item.rarity,
        },
      });
    } catch (err) {
      console.error('记录抽卡结果失败:', err);
    }
  },

  // 稀有度计算
  calculateRarity(pity) {
    if (pity.fiveStarCounter >= 90) return 5;
    if (pity.fourStarCounter >= 10) return 4;
    const roll = Math.random();
    return roll < 0.006 ? 5 : roll < 0.057 ? 4 : 3;
  },

  // 物品生成
  generateItem(allItems, targetRarity, pity) {
    const candidates = allItems.filter((i) => i.rarity === targetRarity);

    // 保底机制处理
    if (targetRarity === 5) {
      const upItems = candidates.filter((i) => i.isRateUp);
      if (pity.guaranteeStatus === 'guaranteed' || Math.random() < 0.5) {
        return this.selectItem(upItems);
      }
    }
    return this.selectItem(candidates);
  },

  // 权重选择算法
  selectItem(items) {
    const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of items) {
      random -= item.weight;
      if (random <= 0) {
        return {
          name: item.itemName,
          rarity: item.rarity,
          isRateUp: item.isRateUp,
        };
      }
    }
  },

  // 更新保底状态
  updatePityAfterPull(pity, rarity, item) {
    if (rarity === 5) {
      pity.fiveStarCounter = 0;
      pity.guaranteeStatus = item.isRateUp ? 'none' : 'guaranteed';
    }
    if (rarity >= 4) pity.fourStarCounter = 0;
  },

  // 保底计数器方法
  async getPityCounter(userId) {
    try {
      const pity = await prisma.gachaPity.findUnique({
        where: { userId },
      });
      return pity || {
        userId,
        fiveStarCounter: 0,
        fourStarCounter: 0,
        guaranteeStatus: 'none',
      };
    } catch (err) {
      console.error('获取保底数据失败:', err);
      throw new Error('获取保底数据失败');
    }
  },

  // 更新保底计数器
  async updatePityCounter(userId, pity) {
    try {
      await prisma.gachaPity.upsert({
        where: { userId },
        create: {
          userId,
          fiveStarCounter: pity.fiveStarCounter,
          fourStarCounter: pity.fourStarCounter,
          guaranteeStatus: pity.guaranteeStatus,
        },
        update: {
          fiveStarCounter: pity.fiveStarCounter,
          fourStarCounter: pity.fourStarCounter,
          guaranteeStatus: pity.guaranteeStatus,
        },
      });
    } catch (err) {
      console.error('更新保底计数器失败:', err);
      throw new Error('更新保底数据失败');
    }
  },

  // 查询抽卡记录
  async getGachaHistory(userId) {
    try {
      const history = await prisma.gachaHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 200,
        select: { itemName: true, rarity: true, createdAt: true },
      });
      return history;
    } catch (err) {
      throw new Error('查询抽卡记录失败');
    }
  },
};

module.exports = userModel;