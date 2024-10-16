document.addEventListener('DOMContentLoaded', () => {
    const toggleChatButton = document.getElementById('toggleChat');
    const chatWidget = document.getElementById('chatWidget');
    const chatbox = document.getElementById('chatbox');
    const userQuery = document.getElementById('userQuery');
    const h2 = document.getElementById('header');
    const sendChat = document.getElementById('sendChat');

    // Variable to track the toggle state
    let isChatOpen = true; // Chat is initially open

    // Function to toggle the chat widget
    toggleChatButton.addEventListener('click', () => {
        if (isChatOpen) {
            // Minimize chat
            chatWidget.classList.add('minimized'); // Add minimized class

            // Hide all internal elements
            chatbox.style.display = 'none';
            userQuery.style.display = 'none';
            h2.style.display = 'none';
            sendChat.style.display = 'none';

            toggleChatButton.textContent = String.fromCharCode(43); // ASCII code for '+'
            toggleChatButton.style.color = 'white';
        } else {
            chatWidget.classList.remove('minimized'); // Remove minimized class

            // Show all internal elements
            chatbox.style.display = 'block';
            userQuery.style.display = 'block';
            h2.style.display = 'block';
            sendChat.style.display = 'block';

            toggleChatButton.textContent = String.fromCharCode(45); // ASCII code for '-'
            toggleChatButton.style.color = 'blue';
        }
        isChatOpen = !isChatOpen; // Toggle state
    });
});


// GEMINI INTEGRATION
const chatbox = document.getElementById('chatbox');
const userQuery = document.getElementById('userQuery');
const sendChatButton = document.getElementById('sendChat');

// Event listener for sending chat
sendChatButton.addEventListener('click', handleSendChat);
userQuery.addEventListener('keydown', handleSendChat); 

// Function to handle sending a message to the server
async function handleSendChat(event) {
    if (event.type === 'click' || (event.type === 'keydown' && event.key === 'Enter')) {
        const userMessage = userQuery.value.trim();
        if (!userMessage) {
            return; // Exit if input is empty
        }

        // Display user's message in the chatbox
        addMessageToChatbox('You', userMessage);
        userQuery.value = ''; // Clear the input

        // Add loading state for bot
        addMessageToChatbox('Bot', 'Typing...');

        try {
            // Send the message to the server
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Set content type
                },
                body: JSON.stringify({ message: userMessage }),
            });

            const data = await response.json();
            const botMessage = data.message || "No response";

            // Clear the loading message and display the actual bot's reply
            chatbox.lastChild.remove(); // Remove 'Typing...' message
            addMessageToChatbox('Bot', botMessage);

            console.log(data); // Log the bot response
        } catch (error) {
            console.error("Error during chat interaction:", error.message);
            alert("There was an error. Please try again later."); // Improved error handling
        }
    }
}

// Function to add messages to the chatbox
function addMessageToChatbox(sender, message) {
    const messageElem = document.createElement('div');
    messageElem.classList.add('p-2', 'rounded', 'mb-2', sender === 'You' ? 'bg-light' : 'bg-primary', 'text-black');
    messageElem.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatbox.appendChild(messageElem);
    chatbox.scrollTop = chatbox.scrollHeight; // Scroll to the bottom
}