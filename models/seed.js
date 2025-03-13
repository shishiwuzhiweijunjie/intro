const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function insertGachaItems() {
  try {
    const items = [
      { itemName: '遐蝶', rarity: 5, isRateUp: true, weight: 50, isCharacter: true },
      { itemName: '姬子', rarity: 5, isRateUp: false, weight: 50, isCharacter: true },
      { itemName: '布洛妮娅', rarity: 5, isRateUp: false, weight: 50, isCharacter: true },
      { itemName: '克拉拉', rarity: 5, isRateUp: false, weight: 50, isCharacter: true },
      { itemName: '杰帕德', rarity: 5, isRateUp: false, weight: 50, isCharacter: true },
      { itemName: '白露', rarity: 5, isRateUp: false, weight: 50, isCharacter: true },
      { itemName: '瓦尔特', rarity: 5, isRateUp: false, weight: 50, isCharacter: true },
      { itemName: '彦卿', rarity: 5, isRateUp: false, weight: 50, isCharacter: true },
      { itemName: '三月七', rarity: 4, isRateUp: true, weight: 100, isCharacter: true },
      { itemName: '丹恒', rarity: 4, isRateUp: true, weight: 100, isCharacter: true },
      { itemName: '停云', rarity: 4, isRateUp: true, weight: 100, isCharacter: true },
      { itemName: '信用点', rarity: 3, isRateUp: false, weight: 1000, isCharacter: false },
    ];

    // 使用 createMany 插入数据
    await prisma.gachaItems.createMany({
      data: items,
    });

    console.log('数据插入成功！');
  } catch (err) {
    console.error('插入数据失败:', err);
  } finally {
    await prisma.$disconnect(); // 断开数据库连接
  }
}

// 调用函数插入数据
insertGachaItems();