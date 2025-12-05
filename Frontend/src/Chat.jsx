// NEW
import "./Chat.css";

// This component will render a single chat message
function Chat({ role, text }) {
    const isUser = role === "user"; 
    
    // Check if this is the loading message
    const isLoading = role === "ai" && text === "...";
    
    return (
        <div className={`chat-message-wrapper ${isUser ? 'user-align' : 'ai-align'}`}>
            <div className={`chat-message ${isUser ? 'user' : 'ai'}`}>
                <div className="message-text">
                    {isLoading ? (
                        <div className="loading-placeholder">
                            <div className="loading-triangle"></div>
                        </div>
                    ) : (
                        text
                    )}
                </div>
            </div>
        </div>
    )
};

export default Chat;