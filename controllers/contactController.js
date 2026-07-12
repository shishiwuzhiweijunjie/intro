// controllers/contactController.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // 【关键修改】必须改成 gmail 的地址，而不是 qq
    port: 465, 
    secure: true,
    auth: {
        user: process.env.EMAIL_USER, // 你的 Gmail 邮箱地址
        pass: process.env.EMAIL_PASS  // 你的 16 位 Gmail 应用专用密码
    }
});

exports.sendContactEmail = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: '通讯协议不完整：缺少必要参数' });
        }

        // 构建邮件内容
        const mailOptions = {
            from: `"[终端节点呼叫] ${name}" <${process.env.EMAIL_USER}>`, // 必须与 auth.user 一致
            to: process.env.EMAIL_USER, // 发给你自己，作为通知接收
            replyTo: email, // 这样你点击回复就能直接回复给发件人
            subject: `[PRTS 终端联络] ${subject}`,
            html: `
                <div style="font-family: Consolas, monospace; background: #f4f6f9; padding: 20px;">
                    <h2 style="color: #00b0ff; border-bottom: 1px solid #d1d5db; padding-bottom: 10px;">// INCOMING TRANSMISSION</h2>
                    <p><strong>IDENTIFIER (发起方):</strong> ${name}</p>
                    <p><strong>COMM_CHANNEL (联系邮箱):</strong> ${email}</p>
                    <p><strong>SUBJECT (通讯主题):</strong> ${subject}</p>
                    <div style="background: #fff; padding: 15px; border-left: 4px solid #121214; margin-top: 20px;">
                        <p style="margin: 0; white-space: pre-wrap;">${message}</p>
                    </div>
                    <p style="color: #6c727f; font-size: 12px; margin-top: 30px;">// 此信件由个人终端系统自动生成并加密传输</p>
                </div>
            `
        };

        // 发送邮件
        await transporter.sendMail(mailOptions);
        
        res.status(200).json({ message: '信号已成功送达目标节点' });
    } catch (error) {
        console.error('邮件发送失败:', error);
        res.status(500).json({ error: '链路故障，信号传输失败' });
    }
};