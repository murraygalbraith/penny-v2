let isTyping = false;

const sendMessage = async () => {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const message = messageInput.value.trim();
    
    if (!message || isTyping) return;
    
    // Add user message to chat
    addMessageToChat(message, 'user');
    messageInput.value = '';
    
    // Show typing indicator
    isTyping = true;
    sendButton.disabled = true;
    addTypingIndicator();
    
    try {
        // Call Penny's CTAC tactic
        const response = await fetch("https://api.tactics.dev/api/workspace/cb086761-d4e9-42a5-94aa-f07c391a2a1d/run", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                initial_variables: { message: message }, 
                tactic_id: "4efba1f4-0f11-45b3-b0ff-17a47bccc187" 
            })
        });
        
        const data = await response.json();
        
        // Handle the response
        let pennyResponse;
        if (data.result && data.result.contentFormatted) {
            pennyResponse = data.result.contentFormatted.value;
        } else if (data.result && data.result.content) {
            pennyResponse = data.result.content;
        } else {
            pennyResponse = "Sorry, I'm having trouble responding right now. Could you try again?";
        }
        
        // Remove typing indicator and add Penny's response
        removeTypingIndicator();
        addMessageToChat(pennyResponse, 'penny');
        
    } catch (error) {
        console.error('Error:', error);
        removeTypingIndicator();
        addMessageToChat("Sorry, I'm having trouble connecting right now. Could you try again?", 'penny');
    }
    
    isTyping = false;
    sendButton.disabled = false;
};

const addMessageToChat = (message, sender) => {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = sender === 'user' ? 'user-message' : 'penny-message';
    
    if (sender === 'user') {
        messageDiv.innerHTML = `<strong>You:</strong> ${escapeHtml(message)}`;
    } else {
        messageDiv.innerHTML = `<strong>Penny:</strong> ${escapeHtml(message)}`;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

const addTypingIndicator = () => {
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = '<strong>Penny:</strong> Thinking...';
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

const removeTypingIndicator = () => {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
};

const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

// Allow Enter to send message
document.getElementById('messageInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
