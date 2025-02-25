// models/userModel.js
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root1234",
    database: process.env.DB_NAME || "myapp",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '+08:00' // 添加时区配置
  });

  const userModel = {
    // 用户注册（改用普通函数）
    registerUser: async function(username, email, password) {
      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
          'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
          [username, email, hashedPassword]
        );
        return result;
      } catch (err) {
        throw err;
      }
    },
  
    // 用户登录（改用普通函数）
    loginUser: async function(username, password) {
      try {
        const [rows] = await pool.query(
          'SELECT * FROM users WHERE username = ?',
          [username]
        );
        
        if (rows.length === 0) return null;
        const user = rows[0];
        
        const isMatch = await bcrypt.compare(password, user.password);
        return isMatch ? user : null;
      } catch (err) {
        console.error('登录查询错误:', err);
        throw err;
      }
    },
  
    // 获取所有有效物品
    getAllValidItems: async function() {
      try {
        const [items] = await pool.query('SELECT * FROM gacha_items');
        return items;
      } catch (err) {
        throw new Error('获取抽卡物品失败');
      }
    },
  
    // 抽卡核心逻辑
gachaPull: async function(userId, times) {
    try {
        const allItems = await this.getAllValidItems();
        let pity = await this.getPityCounter(userId);
        const results = [];

        for (let i = 0; i < times; i++) {
            // 更新计数器
            pity.five_star_counter++;
            pity.four_star_counter++;

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
recordGachaResult: async function(userId, item) {
    try {
        await pool.query(
            'INSERT INTO gacha_history (user_id, item_name, rarity) VALUES (?, ?, ?)',
            [userId, item.name, item.rarity]
        );
    } catch (err) {
        console.error('记录抽卡结果失败:', err);
    }
},
  
    // 稀有度计算（普通函数）
    calculateRarity: function(pity) {
      if (pity.five_star_counter >= 90) return 5;
      if (pity.four_star_counter >= 10) return 4;
      const roll = Math.random();
      return roll < 0.006 ? 5 : roll < 0.057 ? 4 : 3;
    },
  
    // 物品生成（普通函数）
    generateItem: function(allItems, targetRarity, pity) {
      const candidates = allItems.filter(i => i.rarity === targetRarity);
      
      // 保底机制处理
      if (targetRarity === 5) {
        const upItems = candidates.filter(i => i.is_rate_up);
        if (pity.guarantee_status === 'guaranteed' || Math.random() < 0.5) {
          return this.selectItem(upItems);
        }
      }
      return this.selectItem(candidates);
    },
  
    // 权重选择算法（普通函数）
    selectItem: function(items) {
      const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
      let random = Math.random() * totalWeight;
      
      for (const item of items) {
        random -= item.weight;
        if (random <= 0) {
          return {
            name: item.item_name,
            rarity: item.rarity,
            isRateUp: item.is_rate_up
          };
        }
      }
    },
  
    // 更新保底状态（普通函数）
    updatePityAfterPull: function(pity, rarity, item) {
      if (rarity === 5) {
        pity.five_star_counter = 0;
        pity.guarantee_status = item.isRateUp ? 'none' : 'guaranteed';
      }
      if (rarity >= 4) pity.four_star_counter = 0;
    },
  
    // 保底计数器方法（普通函数）
    getPityCounter: async function(userId) {
      try {
        const [rows] = await pool.query(
          'SELECT * FROM gacha_pity WHERE user_id = ?',
          [userId]
        );
        return rows[0] || { 
          five_star_counter: 0, 
          four_star_counter: 0, 
          guarantee_status: 'none' 
        };
      } catch (err) {
        throw new Error('获取保底数据失败');
      }
    },
  
    updatePityCounter: async function(userId, pity) {
      try {
        await pool.query(
          `INSERT INTO gacha_pity 
           (user_id, five_star_counter, four_star_counter, guarantee_status) 
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
           five_star_counter = ?, four_star_counter = ?, guarantee_status = ?`,
          [
            userId,
            pity.five_star_counter, 
            pity.four_star_counter, 
            pity.guarantee_status,
            pity.five_star_counter, 
            pity.four_star_counter, 
            pity.guarantee_status
          ]
        );
      } catch (err) {
        throw new Error('更新保底数据失败');
      }
    }, 

   // 查询抽卡记录
    getGachaHistory: async function(userId) {
    try {
        const [rows] = await pool.query(
            'SELECT item_name, rarity, created_at FROM gacha_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 200',
            [userId]
        );
        return rows;
    } catch (err) {
        throw new Error('查询抽卡记录失败');
        }
    }
  };
  
  module.exports = userModel;