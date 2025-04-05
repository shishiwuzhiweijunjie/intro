const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// 示例商品数据
const products = [
  {
    name: '智能手机',
    description: '高性能智能手机，支持5G网络，6.7英寸屏幕，8GB内存，256GB存储',
    price: 4999.00,
    stock: 100,
    imageUrl: 'https://example.com/images/smartphone.jpg'
  },
  {
    name: '无线耳机',
    description: '高音质无线蓝牙耳机，主动降噪，续航时间20小时',
    price: 899.00,
    stock: 200,
    imageUrl: 'https://example.com/images/headphones.jpg'
  },
  {
    name: '笔记本电脑',
    description: '轻薄笔记本电脑，14英寸屏幕，i7处理器，16GB内存，512GB SSD',
    price: 6999.00,
    stock: 50,
    imageUrl: 'https://example.com/images/laptop.jpg'
  },
  {
    name: '智能手表',
    description: '多功能智能手表，支持心率监测、血氧检测、睡眠分析',
    price: 1299.00,
    stock: 150,
    imageUrl: 'https://example.com/images/smartwatch.jpg'
  },
  {
    name: '平板电脑',
    description: '10.9英寸平板电脑，A14芯片，8GB内存，256GB存储，支持Apple Pencil',
    price: 3999.00,
    stock: 80,
    imageUrl: 'https://example.com/images/tablet.jpg'
  },
  {
    name: '游戏手柄',
    description: '无线游戏手柄，支持多平台，可充电，低延迟',
    price: 399.00,
    stock: 250,
    imageUrl: 'https://example.com/images/controller.jpg'
  },
  {
    name: '智能音箱',
    description: '智能音箱，支持语音助手，360°环绕音效，支持多房间音频同步',
    price: 499.00,
    stock: 120,
    imageUrl: './image/castorice.jpg'
  },
  {
    name: '机械键盘',
    description: 'RGB背光机械键盘，青轴，人体工学设计，支持宏编程',
    price: 599.00,
    stock: 90,
    imageUrl: 'https://example.com/images/keyboard.jpg'
  },
  {
    name: '电竞显示器',
    description: '27英寸电竞显示器，240Hz刷新率，1ms响应时间，支持G-Sync',
    price: 2399.00,
    stock: 40,
    imageUrl: 'https://example.com/images/monitor.jpg'
  },
  {
    name: '无线充电器',
    description: '15W无线充电器，支持多设备同时充电，快速充电，过热保护',
    price: 199.00,
    stock: 300,
    imageUrl: 'https://example.com/images/charger.jpg'
  }
];

// 插入商品数据
async function seedProducts() {
  try {
    // 清空现有商品表
    await prisma.product.deleteMany();

    // 插入新数据
    for (const product of products) {
      await prisma.product.create({
        data: product
      });
      console.log(`商品 "${product.name}" 已插入`);
    }

    console.log('所有商品数据已成功插入');
  } catch (err) {
    console.error('插入商品数据失败:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seedProducts();