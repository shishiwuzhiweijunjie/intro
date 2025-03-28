// controllers/indexController.js
const path = require('path');
const indexController = {
    home: (req, res) => {
        res.sendFile(path.join(__dirname, '../public/index.html'));
    }
};

module.exports = indexController;