// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const authController = {
    register: async (req, res) => {
        try {
            const { username, email, password } = req.body;
            await userModel.registerUser(username, email, password);
            res.json({ message: '注册成功' });
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(400).json({ error: '用户名或邮箱已存在' });
            } else {
                res.status(500).json({ error: '服务器错误' });
            }
        }
    },
   // controllers/authController.js 登录方法优化
login: async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // 空值检查
      if (!username || !password) {
        return res.status(400).json({ error: '用户名和密码必填' });
      }
  
      const user = await userModel.loginUser(username, password);
      
      if (!user) {
        return res.status(401).json({ error: '用户名或密码错误' }); // 401更合适
      }
  
      // 生成带过期时间的token
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '2h' } // 明确过期时间
      );
  
      res.json({ 
        message: '登录成功',
        token,
        user: { id: user.id, username: user.username } // 返回必要用户信息
      });
  
    } catch (err) {
      console.error('登录错误:', err);
      res.status(500).json({ error: '服务器错误' });
    }
  }
};

module.exports = authController;