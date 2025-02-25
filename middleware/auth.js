// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // 严格验证Authorization头格式
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未提供有效凭证' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 附加完整用户信息到请求对象
    req.user = {
      id: decoded.userId,
      username: decoded.username
    };

    next();
  } catch (err) {
    // 细化错误类型
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: '登录已过期' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: '无效令牌' });
    }
    res.status(500).json({ error: '身份验证失败' });
  }
};