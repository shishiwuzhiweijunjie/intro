const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const productModel = {
  // 获取所有商品
  async getAllProducts() {
    try {
      const products = await prisma.product.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          stock: true,
          imageUrl: true,
          createdAt: true
        }
      });
      return products;
    } catch (err) {
      console.error('获取商品列表失败:', err);
      throw new Error('获取商品列表失败');
    }
  },

  // 获取单个商品详情
  async getProductById(productId) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          stock: true,
          imageUrl: true,
          createdAt: true
        }
      });
      return product;
    } catch (err) {
      console.error('获取商品详情失败:', err);
      throw new Error('获取商品详情失败');
    }
  }
};

module.exports = productModel;