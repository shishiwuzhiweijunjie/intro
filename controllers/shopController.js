const jwt = require('jsonwebtoken');
const productModel = require('../models/productModel');
const orderModel = require('../models/orderModel');
const paymentModel = require('../models/paymentModel');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const shopController = {
  // 获取商品列表
  getProducts: async (req, res) => {
    try {
      const products = await productModel.getAllProducts();
      res.json({ success: true, data: products });
    } catch (err) {
      console.error('获取商品列表失败:', err);
      res.status(500).json({ success: false, error: '获取商品列表失败' });
    }
  },

  // 获取商品详情
  getProduct: async (req, res) => {
    try {
      const product = await productModel.getProductById(parseInt(req.params.id));
      if (!product) {
        return res.status(404).json({ success: false, error: '商品不存在' });
      }
      res.json({ success: true, data: product });
    } catch (err) {
      console.error('获取商品详情失败:', err);
      res.status(500).json({ success: false, error: '获取商品详情失败' });
    }
  },

  // 创建订单
  createOrder: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ success: false, error: '未提供访问令牌' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;

      const { items, totalAmount } = req.body;

      // 验证库存
      for (const item of items) {
        const product = await productModel.getProductById(item.productId);
        if (product.stock < item.quantity) {
          return res.status(400).json({ 
            success: false, 
            error: `商品 ${product.name} 库存不足` 
          });
        }
      }

      // 创建订单
      const order = await orderModel.createOrder(userId, items, totalAmount);
      res.json({ success: true, data: order });
    } catch (err) {
      console.error('创建订单失败:', err);
      res.status(500).json({ success: false, error: '创建订单失败' });
    }
  },

  // 支付订单
  payOrder: async (req, res) => {
    try {
      const { orderId, amount, method } = req.body;

      // 创建支付记录
      const payment = await paymentModel.createPayment(orderId, amount, method);

      // 更新订单状态
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'paid' }
      });

      // 更新库存
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true }
      });

      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      res.json({ success: true, data: payment });
    } catch (err) {
      console.error('支付订单失败:', err);
      res.status(500).json({ success: false, error: '支付订单失败' });
    }
  },

  // 获取订单历史
  getOrderHistory: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ success: false, error: '未提供访问令牌' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;

      const orders = await orderModel.getOrderHistory(userId);
      res.json({ success: true, data: orders });
    } catch (err) {
      console.error('获取订单历史失败:', err);
      res.status(500).json({ success: false, error: '获取订单历史失败' });
    }
  }
};

module.exports = shopController;