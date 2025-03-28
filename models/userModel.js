/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-catch */
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
      const pity = await this.getPityCounter(userId);
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

// 在记录抽卡结果后添加
await this.recordGachaResult(userId, item);

console.log(`[gachaPull] 抽卡结果:`, item);

// 新增角色处理逻辑
if (item.isCharacter) { // 判断是否为角色
  console.log(`[gachaPull] 抽到角色: ${item.name}，开始处理角色数据`);
  const characterItem = await prisma.gachaItems.findFirst({
    where: { itemName: item.name }
  });

  if (characterItem) {
    await this.addOrUpdateCharacter(userId, characterItem.id);
  } else {
    console.log(`[gachaPull] 抽到的角色 ${item.name} 不存在于 GachaItems 表中，跳过处理`);
  }
} else {
  console.log(`[gachaPull] 抽到的不是角色，跳过处理`);
}

results.push(item);
      }
      await this.updatePityCounter(userId, pity);
      return results;
    } catch (err) {
      throw new Error(`抽卡失败: ${  err.message}`);
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
          isCharacter: item.isCharacter
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

  async getGachaHistory(userId) {
    try {
      const history = await prisma.gachaHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 200,
        select: {
          id: true,
          userId: true,
          itemName: true,
          rarity: true,
          createdAt: true
        },
      });
      return history;
    } catch (err) {
      throw new Error('查询抽卡记录失败');
    }
  },

  async getUserCharacters(userId) {
    try {
      console.log(`[getUserCharacters] 获取用户 ${userId} 的角色列表`);
  
      const characters = await prisma.userCharacters.findMany({
        where: {
          userId,
          character: {
            isCharacter: true // ✅ 这里正确筛选角色
          }
        },
        include: { // ✅ 使用 `include` 而不是 `select`
          character: {
            select: {
              id: true,
              itemName: true,
              rarity: true,
              isRateUp: true,
              weight: true,
              isCharacter: true
            }
          }
        }
      });
  
      console.log(`[getUserCharacters] 查询到的角色列表:`, characters);
      return characters;
    } catch (err) {
      console.error(`[getUserCharacters] 获取角色列表失败:`, err);
      throw new Error('获取角色列表失败');
    }
  },  
  
// 添加或更新角色
async addOrUpdateCharacter(userId, characterId) {
  try {
    console.log(`[addOrUpdateCharacter] 开始处理角色添加或更新，用户ID: ${userId}，角色ID: ${characterId}`);

    const character = await prisma.userCharacters.findFirst({
      where: { userId, characterId }
    });

    if (character) {
      console.log(`[addOrUpdateCharacter] 角色已存在，更新属性`);

      const updatedCharacter = await prisma.userCharacters.update({
        where: { id: character.id },
        data: {
          health: character.health * 1.1,
          attack: character.attack * 1.1,
          defense: character.defense * 1.1,
          critRate: character.critRate + 5,
          critDamage: character.critDamage + 5
        }
      });

      console.log(`[addOrUpdateCharacter] 角色更新成功:`, updatedCharacter);
      return updatedCharacter;
    } else {
      console.log(`[addOrUpdateCharacter] 角色不存在，创建新角色`);

      const baseCharacter = await prisma.gachaItems.findUnique({
        where: { id: characterId }
      });

      console.log(`[addOrUpdateCharacter] 基础角色数据:`, baseCharacter);

      // 根据物品稀有度设置基础属性
      let health, attack, defense, critRate, critDamage;
      switch(baseCharacter.rarity) {
        case 5:
          health = 2000;
          attack = 200;
          defense = 150;
          critRate = 10;
          critDamage = 50;
          break;
        case 4:
          health = 1500;
          attack = 150;
          defense = 100;
          critRate = 8;
          critDamage = 45;
          break;
        case 3:
          health = 1000;
          attack = 100;
          defense = 70;
          critRate = 5;
          critDamage = 40;
          break;
        default:
          health = 500;
          attack = 50;
          defense = 30;
          critRate = 3;
          critDamage = 35;
      }

      const newCharacter = await prisma.userCharacters.create({
        data: {
          userId,
          characterId,
          health,
          attack,
          defense,
          critRate,
          critDamage
        }
      });

      console.log(`[addOrUpdateCharacter] 角色创建成功:`, newCharacter);
      return newCharacter;
    }
  } catch (err) {
    console.error(`[addOrUpdateCharacter] 角色操作失败:`, err);
    throw new Error('角色操作失败');
  }
}
};

module.exports = userModel;