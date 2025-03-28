document.addEventListener('DOMContentLoaded', () => {
    // 聊天窗口相关元素
    const chatContainer = document.getElementById('chatContainer');
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    const chatHistory = document.getElementById('chatHistory');
    const openChatButton = document.getElementById('openChat');
    const closeChatButton = document.querySelector('.chat-header button'); // 关闭按钮

    // 定义用户和 AI 的头像路径
    const userAvatar = './image/th.png'; // 请确保路径正确
    const aiAvatar = './image/miyabi.png'; // 请确保路径正确

    // 点击按钮显示聊天窗口
    openChatButton.addEventListener('click', () => {
        chatContainer.style.display = 'block';
        chatContainer.classList.add('animate__animated', 'animate__fadeIn');
        setTimeout(() => {
            chatContainer.classList.remove('animate__animated', 'animate__fadeIn');
        }, 1000);
    });

    // 发送按钮点击事件
    sendButton.addEventListener('click', () => {
        handleSendMessage();
        sendButton.classList.add('animate__animated', 'animate__rubberBand');
        setTimeout(() => {
            sendButton.classList.remove('animate__animated', 'animate__rubberBand');
        }, 1000);
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
            addLoadingIndicator(); // 添加加载动画
            // 这里调用实际的 AI 回复逻辑
            sendMessageToServer(message);
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

        // 添加动画效果
        if (sender === 'user') {
            messageElement.classList.add('animate__animated', 'animate__backInRight');
        } else {
            messageElement.classList.add('animate__animated', 'animate__backInLeft');
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
        })
        .finally(() => {
            removeLoadingIndicator();
        });
    }

    // 添加加载指示器
    function addLoadingIndicator() {
        const loadingMsg = document.createElement('div');
        loadingMsg.classList.add('chat-message', 'ai');
        loadingMsg.innerHTML = `
            <div class="chat-bubble ai">
                <span class="loading-dots"></span>
            </div>
        `;
        chatHistory.appendChild(loadingMsg);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    // 移除加载指示器
    function removeLoadingIndicator() {
        const loadingElements = document.querySelectorAll('.loading-dots');
        loadingElements.forEach(el => el.parentElement.remove());
    }

    // 关闭聊天窗口
    function closeChat() {
        chatContainer.classList.add('animate__animated', 'animate__fadeOut');
        setTimeout(() => {
            chatContainer.style.display = 'none';
            chatContainer.classList.remove('animate__animated', 'animate__fadeOut');
        }, 1000);
    }

    // 为关闭按钮添加事件监听
    if (closeChatButton) {
        closeChatButton.addEventListener('click', closeChat);
    }

 // 添加 emoji 支持
 function addEmojiSupport() {
    const emojiButton = document.createElement('button');
    emojiButton.classList.add('emoji-btn');
    emojiButton.innerHTML = '<i class="fas fa-smile"></i>';
    const chatInputGroup = document.querySelector('.chat-input-group');
    chatInputGroup.insertBefore(emojiButton, sendButton);

    // 创建表情包选择器
    const emojiPicker = document.createElement('div');
    emojiPicker.classList.add('emoji-picker');
    emojiPicker.style.display = 'none';
    emojiPicker.style.position = 'absolute';
    emojiPicker.style.bottom = '100%';
    emojiPicker.style.right = '0';
    emojiPicker.style.background = 'white';
    emojiPicker.style.borderRadius = '10px';
    emojiPicker.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
    emojiPicker.style.padding = '10px';
    emojiPicker.style.zIndex = '1000';

    // 定义常用表情包
    const emojis = [
        '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', 
        '😋', '😎', '😍', '😘', '🥰', '😗', '😙', '😚', '🙂', '🤗', 
        '🤩', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', 
        '😮', '🤐', '😯', '😪', '😫', '😴', '😌', '😛', '😜', '😝', 
        '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '☹️', '😖', 
        '😞', '😟', '😤', '😢', '😭', '😦', '😧', '😨', '😩', '🤯', 
        '😬', '😰', '😱', '😳', '🤪', '😵', '💫', '😎', '🥵', '🥶', 
        '🥴', '😵💫', '😶🌫️', '洩', '🙏', '✍️', '👍', '👎', '👊', 
        '✊', '✌️', '✌️️', '✋', '✋️', '👌', '🤏', '✌️', '🤞', 
        '🤟', '🤘', '🤙', '💪', '🦏', '🦵', '🦶', '👀', '👁️', 
        '👁️🗨️', '👤', '👥', '👤️', '👥️'
    ];

    // 创建表情包按钮
    emojis.forEach(emoji => {
        const emojiBtn = document.createElement('button');
        emojiBtn.classList.add('single-emoji');
        emojiBtn.textContent = emoji;
        emojiBtn.style.padding = '5px 10px';
        emojiBtn.style.margin = '2px';
        emojiBtn.style.border = 'none';
        emojiBtn.style.borderRadius = '5px';
        emojiBtn.style.background = 'transparent';
        emojiBtn.style.cursor = 'pointer';
        emojiBtn.style.transition = 'background 0.3s ease';

        emojiBtn.addEventListener('mouseover', function() {
            this.style.background = '#f0f0f0';
        });

        emojiBtn.addEventListener('mouseout', function() {
            this.style.background = 'transparent';
        });

        emojiBtn.addEventListener('click', () => {
            chatInput.focus();
            const start = chatInput.selectionStart;
            const end = chatInput.selectionEnd;
            chatInput.value = chatInput.value.substring(0, start) + emoji + chatInput.value.substring(end);
            chatInput.selectionStart = start + emoji.length;
            chatInput.selectionEnd = chatInput.selectionStart;
            emojiPicker.style.display = 'none';
        });

        emojiPicker.appendChild(emojiBtn);
    });
 }
    addEmojiSupport();

    // 添加图片上传支持
    function addImageSupport() {
        const imageButton = document.createElement('button');
        imageButton.classList.add('image-btn');
        imageButton.innerHTML = '<i class="fas fa-image"></i>';
        const chatInputGroup = document.querySelector('.chat-input-group');
        chatInputGroup.insertBefore(imageButton, sendButton);

        imageButton.addEventListener('click', () => {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';

            fileInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const imageUrl = e.target.result;
                        addMessageToChat('user', '', 'image', imageUrl);
                        addLoadingIndicator();
                        setTimeout(() => {
                            removeLoadingIndicator();
                            addMessageToChat('ai', '这是一张图片，我已经收到。', 'text');
                        }, 1500);
                    };
                    reader.readAsDataURL(file);
                }
            });

            fileInput.click();
        });
    }
    addImageSupport();

    // 初始化聊天窗口位置
    chatContainer.style.left = 'calc(100% - 400px - 20px)';
    chatContainer.style.bottom = '20px';
});