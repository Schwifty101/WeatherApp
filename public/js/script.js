document.addEventListener('DOMContentLoaded', () => {
    const toggleChatButton = document.getElementById('toggleChat');
    const chatWidget = document.getElementById('chatWidget');
    const chatbox = document.getElementById('chatbox');
    const userQuery = document.getElementById('userQuery');
    const h2 = document.getElementById('header');
    const sendChat = document.getElementById('sendChat');

    let isChatOpen = true;

    toggleChatButton.addEventListener('click', () => {
        if (isChatOpen) {
            chatWidget.classList.add('minimized');
            chatbox.style.display = 'none';
            userQuery.style.display = 'none';
            h2.style.display = 'none';
            sendChat.style.display = 'none';
            toggleChatButton.textContent = String.fromCharCode(43); // '+'
            toggleChatButton.style.color = 'white';
        } else {
            chatWidget.classList.remove('minimized');
            chatbox.style.display = 'block';
            userQuery.style.display = 'block';
            h2.style.display = 'block';
            sendChat.style.display = 'block';
            toggleChatButton.textContent = String.fromCharCode(45); // '-'
            toggleChatButton.style.color = 'blue';
        }
        isChatOpen = !isChatOpen;
    });
});

// GEMINI INTEGRATION
const chatbox = document.getElementById('chatbox');
const userQuery = document.getElementById('userQuery');
const sendChatButton = document.getElementById('sendChat');

sendChatButton.addEventListener('click', handleSendChat);
userQuery.addEventListener('keydown', handleSendChat);

// Send Chat to app.js
async function handleSendChat(event) {
    if (event.type === 'click' || (event.type === 'keydown' && event.key === 'Enter')) {
        const userMessage = userQuery.value.trim();
        if (!userMessage) return; 

        addMessageToChatbox('You', userMessage); 
        userQuery.value = ''; 
        addMessageToChatbox('Bot', 'Typing...'); 

        try {
            // Send message to server
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage }),
            });

            const data = await response.json();
            const botMessage = data.message || "No response";

            chatbox.lastChild.remove(); // Remove 'Typing...' message
            addMessageToChatbox('Bot', botMessage);

        } catch (error) {
            console.error("Error during chat interaction:", error.message);
            alert("There was an error. Please try again later.");
        }
    }
}

// Add messages to the chatbox
function addMessageToChatbox(sender, message) {
    const messageElem = document.createElement('div');
    messageElem.classList.add('p-2', 'rounded', 'mb-2', sender === 'You' ? 'bg-light' : 'bg-primary', 'text-black');
    messageElem.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatbox.appendChild(messageElem);
    chatbox.scrollTop = chatbox.scrollHeight;
}