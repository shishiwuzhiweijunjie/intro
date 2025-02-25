document.addEventListener('DOMContentLoaded', function() {
    const progressBar = document.querySelector('.progress-bar-inner');
    const progressText = document.querySelector('.progress-text');
    let currentProgress = 0; // 当前进度
    const increment = 1; // 每次迭代增加的进度 
    const randomTime = Math.floor(Math.random() * 1000) + 2000; // 2-3秒

    const updateProgress = () => {
        currentProgress += increment;
        if (currentProgress >= 100) {
            currentProgress = 100; // 确保不超过100%
            clearInterval(interval); // 停止定时器
            document.getElementById('loadingOverlay').style.display = 'none'; // 隐藏加载层
        }
        progressBar.style.width = currentProgress + '%';
        progressText.textContent = currentProgress + '%';
    };

    const interval = setInterval(updateProgress, randomTime / 100); // 根据总时间调整每次更新的间隔
});

document.addEventListener('DOMContentLoaded', function() {
    // 聊天窗口相关元素
    const chatContainer = document.getElementById('chatContainer');
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    const chatHistory = document.getElementById('chatHistory');
    const openChatButton = document.getElementById('openChat');

    // 定义用户和 AI 的头像路径
    const userAvatar = './image/th.png'; // 请确保路径正确
    const aiAvatar = './image/miyabi.png'; // 请确保路径正确

    // 点击按钮显示聊天窗口
    openChatButton.addEventListener('click', () => {
        chatContainer.style.display = 'block';
    });

    // 发送按钮点击事件
    sendButton.addEventListener('click', () => {
        handleSendMessage();
    });

    // 回车键发送消息
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // 防止表单默认提交行为（如果适用）
            handleSendMessage();
        }
    });

    // 处理消息发送逻辑
    function handleSendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            addMessageToChat('user', message); // 添加用户消息
            chatInput.value = '';
            sendMessageToServer(message); // 发送消息到后端
        }
    }

    // 动态生成消息气泡和头像
    function addMessageToChat(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', sender);

        const avatarElement = document.createElement('div');
        avatarElement.classList.add('chat-avatar');
        avatarElement.style.backgroundImage = `url(${sender === 'user' ? userAvatar : aiAvatar})`;

        const bubbleElement = document.createElement('div');
        bubbleElement.classList.add('chat-bubble', sender);
        bubbleElement.textContent = message;

        if (sender === 'user') {
            messageElement.appendChild(bubbleElement);
            messageElement.appendChild(avatarElement);
        } else {
            messageElement.appendChild(avatarElement);
            messageElement.appendChild(bubbleElement);
        }

        chatHistory.appendChild(messageElement);
        chatHistory.scrollTop = chatHistory.scrollHeight; // 滚动到底部
    }

    // 将消息发送到后端
    function sendMessageToServer(message) {
        fetch('/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message }),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((data) => {
            addMessageToChat('ai', data.message); // 添加 AI 回复
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('发送消息失败，请稍后再试。');
        });
    }
});

// 获取按钮元素
const openChatButton = document.getElementById('openChat');

// 变量来存储鼠标点击时的初始位置
let startX, startY;
let isDragging = false; // 拖拽状态标志

// 鼠标按下事件，记录初始位置
openChatButton.addEventListener('mousedown', (e) => {
    e.preventDefault(); // 阻止默认事件
    startX = e.clientX;
    startY = e.clientY;
    isDragging = true; // 开始拖拽
});

// 鼠标移动事件，移动按钮
document.addEventListener('mousemove', (e) => {
    if (isDragging) { // 检查是否在拖拽状态
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        // 计算新的位置
        const newLeft = openChatButton.offsetLeft + deltaX;
        const newTop = openChatButton.offsetTop + deltaY;

        // 设置新的位置
        openChatButton.style.left = newLeft + 'px';
        openChatButton.style.top = newTop + 'px';

        // 更新起始位置
        startX = e.clientX;
        startY = e.clientY;
    }
});

// 鼠标松开事件，停止拖动
document.addEventListener('mouseup', () => {
    if (isDragging) { // 如果正在拖拽，则重置状态
        isDragging = false;
    }
});

// 阻止拖拽时的点击事件
openChatButton.addEventListener('click', (e) => {
    if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
    }
});

