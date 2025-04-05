const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const orderModel = {
  // 创建订单
  async createOrder(userId, items, totalAmount) {
    try {
      const order = await prisma.order.create({
        data: {
          userId,
          totalAmount,
          status: 'pending',
          items: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price
            }))
          }
        },
        include: {
          items: true
        }
      });
      return order;
    } catch (err) {
      console.error('创建订单失败:', err);
      throw new Error('创建订单失败');
    }
  },

  async getOrderById(orderId) {
    try {
      // 确保orderId是整数
      const orderIdInt = parseInt(orderId);
      if (isNaN(orderIdInt)) {
        throw new Error('无效的订单ID');
      }

      const order = await prisma.order.findUnique({
        where: { id: orderIdInt },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });
      return order;
    } catch (err) {
      console.error('获取订单详情失败:', err);
      throw new Error('获取订单详情失败');
    }
  },

  async updateOrderStatus(orderId, status) {
    try {
      // 确保orderId是整数
      const orderIdInt = parseInt(orderId);
      if (isNaN(orderIdInt)) {
        throw new Error('无效的订单ID');
      }

      await prisma.order.update({
        where: { id: orderIdInt },
        data: { status }
      });
    } catch (err) {
      console.error('更新订单状态失败:', err);
      throw new Error('更新订单状态失败');
    }
  },

  async updateProductStock(productId, quantity) {
    try {
      await prisma.product.update({
        where: { id: parseInt(productId) },
        data: { stock: { decrement: quantity } }
      });
    } catch (err) {
      console.error('更新库存失败:', err);
      throw new Error('更新库存失败');
    }
  },

  // 获取用户订单历史
  async getOrderHistory(userId) {
    try {
      const orders = await prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: true
            }
          },
          payment: true
        },
        orderBy: { createdAt: 'desc' }
      });
      return orders;
    } catch (err) {
      console.error('获取订单历史失败:', err);
      throw new Error('获取订单历史失败');
    }
  }
};

module.exports = orderModel;