const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function insertGachaItems() {
  try {
    // 模拟《明日方舟》近期热门卡池：五周年“我即万物”/ 包含最新幻神与强力基石
    const items = [
      // ================= 👑 高级资深干员 (后端 rarity: 5，前端显示 6★) =================
      
      // 【当期 UP】限定与核心强力干员
      { itemName: '维什戴尔', rarity: 5, isRateUp: true, weight: 50, isCharacter: true }, // 最新幻神
      { itemName: '逻各斯', rarity: 5, isRateUp: true, weight: 50, isCharacter: true },   // 术师天花板

      // 【常驻】高级资深干员 (涵盖幻神、基石与近期热门)
      { itemName: '玛恩纳', rarity: 5, isRateUp: false, weight: 30, isCharacter: true },
      { itemName: '锏', rarity: 5, isRateUp: false, weight: 30, isCharacter: true },
      { itemName: '黍', rarity: 5, isRateUp: false, weight: 30, isCharacter: true },
      { itemName: '提丰', rarity: 5, isRateUp: false, weight: 30, isCharacter: true },
      { itemName: '伊内丝', rarity: 5, isRateUp: false, weight: 30, isCharacter: true },
      { itemName: '焰影苇草', rarity: 5, isRateUp: false, weight: 30, isCharacter: true },
      { itemName: '史尔特尔', rarity: 5, isRateUp: false, weight: 30, isCharacter: true },
      { itemName: '澄闪', rarity: 5, isRateUp: false, weight: 30, isCharacter: true },
      { itemName: '百炼嘉维尔', rarity: 5, isRateUp: false, weight: 30, isCharacter: true },
      { itemName: '缄默德克萨斯', rarity: 5, isRateUp: false, weight: 30, isCharacter: true },
      { itemName: '麒麟R夜刀', rarity: 5, isRateUp: false, weight: 30, isCharacter: true },
      { itemName: '塞雷娅', rarity: 5, isRateUp: false, weight: 30, isCharacter: true },
      { itemName: '银灰', rarity: 5, isRateUp: false, weight: 30, isCharacter: true },
      { itemName: '艾雅法拉', rarity: 5, isRateUp: false, weight: 30, isCharacter: true },

      // ================= 🌟 资深干员 (后端 rarity: 4，前端显示 5★) =================
      
      // 【当期 UP】资深干员
      { itemName: '锡人', rarity: 4, isRateUp: true, weight: 100, isCharacter: true },
      { itemName: '烈夏', rarity: 4, isRateUp: true, weight: 100, isCharacter: true },

      // 【常驻】资深干员 (高泛用性五星)
      { itemName: '白面鸮', rarity: 4, isRateUp: false, weight: 60, isCharacter: true },
      { itemName: '拉普兰德', rarity: 4, isRateUp: false, weight: 60, isCharacter: true },
      { itemName: '极境', rarity: 4, isRateUp: false, weight: 60, isCharacter: true },
      { itemName: '巫恋', rarity: 4, isRateUp: false, weight: 60, isCharacter: true },
      { itemName: '华法琳', rarity: 4, isRateUp: false, weight: 60, isCharacter: true },
      { itemName: '幽灵鲨', rarity: 4, isRateUp: false, weight: 60, isCharacter: true },
      { itemName: '德克萨斯', rarity: 4, isRateUp: false, weight: 60, isCharacter: true },
      { itemName: '赫默', rarity: 4, isRateUp: false, weight: 60, isCharacter: true },
      { itemName: '羽毛笔', rarity: 4, isRateUp: false, weight: 60, isCharacter: true },
      { itemName: '桑葚', rarity: 4, isRateUp: false, weight: 60, isCharacter: true },

      // ================= 🔰 基础干员 / 战备物资 (后端 rarity: 3，前端显示 3★) =================
      
      // 三星战神 (低星干员)
      { itemName: '玫兰莎', rarity: 3, isRateUp: false, weight: 300, isCharacter: true },
      { itemName: '克洛丝', rarity: 3, isRateUp: false, weight: 300, isCharacter: true },
      { itemName: '斑点', rarity: 3, isRateUp: false, weight: 300, isCharacter: true },
      { itemName: '安赛尔', rarity: 3, isRateUp: false, weight: 300, isCharacter: true },
      { itemName: '芬', rarity: 3, isRateUp: false, weight: 300, isCharacter: true },
      { itemName: '炎熔', rarity: 3, isRateUp: false, weight: 300, isCharacter: true },
      { itemName: '月见夜', rarity: 3, isRateUp: false, weight: 300, isCharacter: true },
      { itemName: '空爆', rarity: 3, isRateUp: false, weight: 300, isCharacter: true },

      // 寻访副产物 (非角色物资)
      { itemName: '龙门币 × 2000', rarity: 3, isRateUp: false, weight: 400, isCharacter: false },
      { itemName: '基础作战记录 × 3', rarity: 3, isRateUp: false, weight: 400, isCharacter: false },
      { itemName: '技巧概要·卷1 × 3', rarity: 3, isRateUp: false, weight: 300, isCharacter: false },
      { itemName: '初级聚酸酯 × 1', rarity: 3, isRateUp: false, weight: 200, isCharacter: false },
      { itemName: '初级源岩 × 2', rarity: 3, isRateUp: false, weight: 200, isCharacter: false },
    ];

    console.log('// SYS.INIT: 正在初始化 PRTS 寻访核心数据库...');


    // 使用 createMany 批量插入方舟干员数据[cite: 3]
    await prisma.gachaItems.createMany({
      data: items,
    });

    console.log('// SYS.SUCCESS: 罗德岛干员寻访档案已成功写入数据库。当前名册总计：' + items.length + ' 项。');
  } catch (err) {
    console.error('// SYS.ERR: 档案写入引发异常:', err);
  } finally {
    // 操作完成后断开数据库连接[cite: 3]
    await prisma.$disconnect(); 
  }
}

// 唤醒初始化进程[cite: 3]
insertGachaItems();