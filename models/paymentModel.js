const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const paymentModel = {
  // 创建支付记录
  async createPayment(orderId, amount, method) {
    try {
      const payment = await prisma.payment.create({
        data: {
          orderId,
          amount,
          method,
          status: 'pending'
        }
      });
      return payment;
    } catch (err) {
      console.error('创建支付记录失败:', err);
      throw new Error('创建支付记录失败');
    }
  },

  // 更新支付状态
  async updatePaymentStatus(paymentId, status) {
    try {
      const payment = await prisma.payment.update({
        where: { id: paymentId },
        data: { status }
      });
      return payment;
    } catch (err) {
      console.error('更新支付状态失败:', err);
      throw new Error('更新支付状态失败');
    }
  }
};

module.exports = paymentModel;