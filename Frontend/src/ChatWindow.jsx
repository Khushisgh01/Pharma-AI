import { useContext, useState } from "react"; // Import useState
import "./ChatWindow.css";
import { MyContext } from "./MyContext.jsx";
import Chat from "./Chat.jsx"; 
// Import icons from react-icons
import { FiPlus, FiImage } from "react-icons/fi"; 
import { TfiCommentAlt } from "react-icons/tfi";
import { FaPaperPlane } from "react-icons/fa"; // Import paper plane for send

// Helper function to simulate network delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function ChatWindow() {
  // Consume context values for chat
  const { 
    prompt, 
    setPrompt, 
    messages,
    setMessages,
    setCurrentView 
  } = useContext(MyContext); 
  
  // State to manage if a response is actively streaming
  const [isLoading, setIsLoading] = useState(false);

  // --- MOCK STREAMING FUNCTION ---
  async function streamMockAgentResponse(userPrompt, aiMessageId) {
    const dummyResponse = `Processing: "${userPrompt}". I found 3 relevant studies and can summarize them for you. Here is the summary: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor.`;
    
    // Split the response into chunks (words)
    const chunks = dummyResponse.split(' ');

    // Loop through chunks and append them with a delay
    for (const chunk of chunks) {
        await sleep(100); // Simulate 100ms delay per chunk
        
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, text: msg.text + chunk + " " } // Append chunk with a space
              : msg
          )
        );
    }
  }

  // Function to handle the submission of the chat prompt
  const handleSend = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    
    const userPrompt = prompt.trim();
    if (userPrompt === "" || isLoading) {
      return; // Do nothing if prompt is empty or already loading
    }

    setIsLoading(true);

    const userMessageId = Date.now();
    const aiMessageId = userMessageId + 1; // ID for the AI's response

    // 1. Add user message to history
    setMessages(prevMessages => [...prevMessages, { id: userMessageId, role: "user", text: userPrompt }]);

    // 2. Clear the input
    setPrompt(""); 
    
    // 3. Add AI message placeholder with "..."
    setMessages(prevMessages => [...prevMessages, { id: aiMessageId, role: "ai", text: "..." }]);

    // 4. "THINKING" PAUSE
    await sleep(1000); // Pause for 1 second while "..." is visible

    // 5. Replace "..." with an empty string to prepare for streaming
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === aiMessageId 
          ? { ...msg, text: "" } // Set text to empty
          : msg
      )
    );
    
    // 6. USE THE MOCK STREAM (this will append to the now-empty bubble)
    try {
      await streamMockAgentResponse(userPrompt, aiMessageId);
    } catch (error) {
      console.error("Mock stream error:", error);
    } finally {
      setIsLoading(false); // Re-enable the input
    }


    /*
    // --- REAL FETCH LOGIC (Commented out) ---
    // The "..." bubble and 1-second pause will also apply to this logic
    try {
      // (The code from step 5 above already prepared the bubble)
      const resp = await fetch('/agent/stream/', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userPrompt })
      });
      
      // ... (rest of the real fetch logic) ...

    } catch (error) {
      console.error("Fetch stream error:", error);
      // Set a generic error message in the AI placeholder
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, text: "Sorry, an error occurred while connecting to the agent." } 
            : msg
        )
      );
    } finally {
      setIsLoading(false); // Re-enable the input
    }
    */
  };


  return (
    <div className="chat-container">
      <div className="navbar">
        <span>Pharma AI</span>
        <div className="userIconDiv" onClick={() => setCurrentView('profile')}>
          <span className="userIcon"><i className="fa-solid fa-user"></i></span>
        </div>
      </div>

      <div className="chat-content">
        {messages.length === 0 ? (
            <>
                <div className="heading">Welcome to Pharma AI</div>
                <div className="subheading">Transforming Pharmaceutical Research Through Agentic Intelligence</div>
            </>
        ) : (
             <div className="message-history">
                {messages.map((msg) => (
                    <Chat key={msg.id} role={msg.role} text={msg.text} />
                ))}
             </div>
        )}
      </div>
      
      {/* Input Area: Wrapped in a form for easy submission on Enter */}
      <div className="chat-input-area">
        <form onSubmit={handleSend} className="chat-bar"> 
           <input
            type="text"
            className="chat-input"
            placeholder="How can I help you today?"
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)} 
            disabled={isLoading} // Disable input while loading
          />
          <div className="left-icons">
            <button type="button" className="icon-button" disabled={isLoading}> 
              <FiPlus size={20} />
            </button>
            <button type="button" className="icon-button" disabled={isLoading}>
              <FiImage size={20} />
            </button>
            <button type="button" className="icon-button" disabled={isLoading}>
              <TfiCommentAlt size={20} />
            </button>
             <button type="submit" className="icon-button file-upload-button" disabled={isLoading}> 
              {/* Use FaPaperPlane icon */}
              <FaPaperPlane size={18} style={{ opacity: isLoading ? 0.5 : 1 }} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChatWindow;