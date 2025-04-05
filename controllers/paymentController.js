const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const orderModel = require('../models/orderModel');

const paymentController = {
  // 创建支付意图
  createPaymentIntent: async (req, res) => {
    try {
        console.log('[BE1] 收到创建支付意图请求，参数:', req.body);
        const { orderId, amount } = req.body;

        // 验证订单ID是否为整数
        const orderIdInt = parseInt(orderId);
        if (isNaN(orderIdInt)) {
            console.error('[BE2] 无效的订单ID:', orderId);
            return res.status(400).json({ success: false, error: '无效的订单ID' });
        }

        // 查询订单是否存在
        console.log('[BE3] 查询订单是否存在，订单ID:', orderIdInt);
        const order = await orderModel.getOrderById(orderIdInt);
        if (!order) {
            console.error('[BE4] 订单不存在，订单ID:', orderIdInt);
            return res.status(404).json({ success: false, error: '订单不存在' });
        }

        // 创建支付意图
        console.log('[BE5] 创建Stripe支付意图，金额:', amount);
// paymentController.js (createPaymentIntent 方法)
const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
    metadata: { 
      orderId: orderId.toString() // 明确转为字符串
    }
  });
        console.log('[BE6] 支付意图创建成功:', paymentIntent.id);

        res.json({ 
            success: true, 
            clientSecret: paymentIntent.client_secret 
        });
    } catch (err) {
        console.error('[BE7] 创建支付意图失败:', err);
        res.status(500).json({ success: false, error: '创建支付意图失败' });
    }
  },

  // 处理支付成功Webhook
  handlePaymentSuccess: async (req, res) => {
    try {
        const signature = req.headers['stripe-signature'];
        const rawBody = req.body; // 已经是 Buffer，无需操作
  
        // 验证签名
        const webhookEvent = stripe.webhooks.constructEvent(
          rawBody, // 传递原始 Buffer
          signature,
          process.env.STRIPE_WEBHOOK_SECRET
        );

      // 处理支付成功事件
      if (webhookEvent.type === 'payment_intent.succeeded') {
        const paymentIntent = webhookEvent.data.object;
        const orderId = paymentIntent.metadata.orderId;
        console.log('[BE4] 元数据中的订单ID:', orderId);

        // 更新订单状态
        console.log('[BE5] 更新订单状态为 paid，订单ID:', orderId);
        await orderModel.updateOrderStatus(orderId, 'paid');

        // 更新库存
        console.log('[BE6] 开始更新库存');
        const order = await orderModel.getOrderById(orderId);
        for (const item of order.items) {
          console.log('[BE7] 扣减库存，商品ID:', item.productId, '数量:', item.quantity);
          await orderModel.updateProductStock(item.productId, item.quantity);
        }
      }

      // 返回成功响应
      res.status(200).json({ received: true });
    } catch (err) {
      console.error('[BE8] Webhook 处理失败:', err);
      res.status(400).json({ received: true });
    }
  }
};

module.exports = paymentController;