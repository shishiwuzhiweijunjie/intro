const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const gachaController = {
  // 处理抽卡请求
  draw: async (req, res) => {
    try {
      // 鉴权验证
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ 
          success: false,
          error: '未提供访问令牌' 
        });
      }

      // 解码令牌
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;

      // 参数验证
      const times = parseInt(req.body.times) || 1;
      if (![1, 10].includes(times)) {
        return res.status(400).json({
          success: false,
          error: '仅支持单抽(1次)或十连(10次)'
        });
      }

      // 执行抽卡
      const results = await userModel.gachaPull(userId, times);

      // 获取最新保底状态
      const pity = await userModel.getPityCounter(userId);
      
      // 返回标准化响应
      res.json({
        success: true,
        data: {
          results: results || [],
// 修改meta字段名为剩余次数而非剩余保底
meta: {
  fiveStarPity: pity.fiveStarCounter || 0, // 直接返回当前计数值
  fourStarPity: pity.fourStarCounter || 0
}
        }
      });

    } catch (err) {
      console.error('抽卡控制器错误:', err);
      res.status(500).json({
        success: false,
        error: err.message || '服务器内部错误'
      });
    }
  },

  getHistory: async (req, res) => {
    try {
        // 鉴权验证
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ 
                success: false,
                error: '未提供访问令牌' 
            });
        }

        // 解码令牌
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // 查询抽卡记录
        const history = await userModel.getGachaHistory(userId);

        res.json({
            success: true,
            data: history
        });
    } catch (err) {
        console.error('获取抽卡记录失败:', err);
        res.status(500).json({
            success: false,
            error: err.message || '服务器内部错误'
        });
    }
}
};

module.exports = gachaController;