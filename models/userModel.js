// models/userModel.js
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // 替换为你的数据库用户名
    password: 'root1234', // 替换为你的数据库密码
    database: 'myapp'
});

db.connect((err) => {
    if (err) {
        console.error('数据库连接失败:', err);
        return;
    }
    console.log('数据库连接成功');
});

const userModel = {
    registerUser: async (username, email, password) => {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        return new Promise((resolve, reject) => {
            db.query(sql, [username, email, hashedPassword], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    },
    loginUser: async (username, password) => {
        const sql = 'SELECT * FROM users WHERE username = ?';
        return new Promise((resolve, reject) => {
            db.query(sql, [username], async (err, results) => {
                if (err) return reject(err);
                if (results.length === 0) return resolve(null);
                const user = results[0];
                const isMatch = await bcrypt.compare(password, user.password);
                resolve(isMatch ? user : null);
            });
        });
    }
};

module.exports = userModel;