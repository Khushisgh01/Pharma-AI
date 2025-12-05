import { useContext, useState, useEffect, useRef } from "react";
import "./ChatWindow.css";
import { MyContext } from "./MyContext.jsx";
import Chat from "./Chat.jsx";
import { FiPlus, FiImage, FiDownload } from "react-icons/fi";
import { TfiCommentAlt } from "react-icons/tfi";
import { FaPaperPlane } from "react-icons/fa";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Enhanced helper function with debugging
function extractReportPaths(text) {
  console.log("🔍 SCANNING TEXT FOR REPORTS:");
  console.log("Full text:", text);

  const paths = [];

  // More flexible regex patterns
  const pdfMatch = text.match(/reports\/[\w\-_.]+\.pdf/gi);
  const excelMatch = text.match(/reports\/[\w\-_.]+\.xlsx/gi);

  console.log("📄 PDF matches:", pdfMatch);
  console.log("📊 Excel matches:", excelMatch);

  if (pdfMatch) paths.push(...pdfMatch);
  if (excelMatch) paths.push(...excelMatch);

  console.log("✅ FINAL PATHS:", paths);

  return paths;
}

function ChatWindow() {
  const { prompt, setPrompt, messages, setMessages, setCurrentView } =
    useContext(MyContext);

  // Session ID for memory (persist in localStorage)
  const [sessionId, setSessionId] = useState(() => {
    try {
      return localStorage.getItem("pharmaai_session_id") || null;
    } catch (e) {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const chatContentRef = useRef(null);

  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [messages]);

  // Helper: save sessionId locally
  function saveSessionId(id) {
    try {
      if (id) {
        localStorage.setItem("pharmaai_session_id", id);
      } else {
        localStorage.removeItem("pharmaai_session_id");
      }
    } catch (e) {
      console.warn("Could not access localStorage:", e);
    }
    setSessionId(id);
  }

  // Clear session memory on the backend (and locally)
  async function clearSession() {
    if (!sessionId) {
      // nothing to clear
      saveSessionId(null);
      setMessages([]); // reset chat in UI
      return;
    }

    try {
      const resp = await fetch("http://127.0.0.1:8000/agent/clear/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ session_id: sessionId }),
      });

      if (!resp.ok) {
        console.warn("Failed to clear session on server:", resp.status);
      } else {
        console.log("Server cleared session:", sessionId);
      }
    } catch (err) {
      console.warn("Error clearing session:", err);
    }

    // Clear locally anyway
    saveSessionId(null);
    setMessages([]);
  }

  async function streamAgentResponse(userPrompt, aiMessageId) {
    try {
      // include session_id if we have one
      const bodyPayload = sessionId
        ? { query: userPrompt, session_id: sessionId }
        : { query: userPrompt };

      const response = await fetch("http://127.0.0.1:8000/agent/stream/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyPayload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let partialChunk = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        partialChunk += chunk;

        // SSE messages separated by double newline '\n\n'
        const lines = partialChunk.split("\n\n");
        partialChunk = lines.pop(); // keep last partial

        for (let line of lines) {
          if (line.startsWith("data:")) {
            const jsonStr = line.slice(5).trim();
            try {
              const json = JSON.parse(jsonStr);

              // NEW: handle session_id emitted as first SSE message
              if (json.session_id) {
                console.log("🧠 Received session_id from backend:", json.session_id);
                // store it locally for future requests
                saveSessionId(json.session_id);
                continue; // do not append this to message text
              }

              // streaming chunk text
              if (json.chunk) {
                setMessages((prevMessages) =>
                  prevMessages.map((msg) =>
                    msg.id === aiMessageId
                      ? { ...msg, text: msg.text + json.chunk, isStreaming: true }
                      : msg
                  )
                );
              } else if (json.error) {
                setMessages((prevMessages) =>
                  prevMessages.map((msg) =>
                    msg.id === aiMessageId
                      ? { ...msg, text: `⚠️ Error: ${json.error}`, isStreaming: false }
                      : msg
                  )
                );
              } else if (json.done) {
                setMessages((prevMessages) =>
                  prevMessages.map((msg) =>
                    msg.id === aiMessageId
                      ? { ...msg, isStreaming: false }
                      : msg
                  )
                );
              } else {
                // unknown SSE payload — log for debugging
                console.log("ℹ️ Unhandled SSE payload:", json);
              }
            } catch (err) {
              // ignore partial JSONs (we are receiving stream chunks)
            }
          }
        }
      }
    } catch (error) {
      console.error("Error streaming from backend:", error);
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === aiMessageId
            ? {
              ...msg,
              text:
                "⚠️ Sorry, I couldn't connect to the AI agent backend. Please ensure the server is running.",
              isStreaming: false
            }
            : msg
        )
      );
    }
  }

  const handleSend = async (e) => {
    e.preventDefault();
    const userPrompt = prompt.trim();
    if (userPrompt === "" || isLoading) return;

    setIsLoading(true);
    const userMessageId = Date.now();
    const aiMessageId = userMessageId + 1;

    setMessages((prev) => [
      ...prev,
      { id: userMessageId, role: "user", text: userPrompt },
    ]);

    setPrompt("");

    setMessages((prev) => [...prev, { id: aiMessageId, role: "ai", text: "...", isStreaming: true }]);

    await sleep(800);

    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === aiMessageId ? { ...msg, text: "", isStreaming: true } : msg
      )
    );

    // send the user's prompt to backend with session id (if present)
    await streamAgentResponse(userPrompt, aiMessageId);
    setIsLoading(false);
  };

  // Render message with download buttons - FIXED CLASS NAMES
  const renderMessageWithDownloads = (msg) => {
    const reportPaths = extractReportPaths(msg.text);

    if (reportPaths.length === 0) {
      return <Chat key={msg.id} role={msg.role} text={msg.text} isStreaming={msg.isStreaming} />;
    }

    // Clean the text by removing file paths and markers
    let displayText = msg.text;
    reportPaths.forEach(path => {
      displayText = displayText.replace(path, '');
    });
    // Remove the report file marker
    displayText = displayText.replace(/\*\*📊 Report File:\*\*/g, '').trim();

    return (
      <div key={msg.id} style={{ width: '100%' }}>
        <Chat role={msg.role} text={displayText} isStreaming={msg.isStreaming} />
        <div className="download-buttons-wrapper">
          {reportPaths.map((path, idx) => {
            const fileName = path.split('/').pop();
            const isPDF = path.endsWith('.pdf');
            const downloadUrl = `http://127.0.0.1:8000/media/${fileName}`;

            console.log(`🔗 Creating download button ${idx}:`, {
              path,
              fileName,
              downloadUrl,
              isPDF
            });

            return (
              <a
                key={idx}
                href={downloadUrl}
                download={fileName}
                className="download-link-button"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => console.log("🖱️ Download clicked:", downloadUrl)}
              >
                <FiDownload size={18} />
                <span>{isPDF ? '📊 Download PDF Report' : '📈 Download Excel Data'}</span>
              </a>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="chat-container">
      <div className="navbar">
        <span>Pharos</span>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Session indicator (short) */}
          <div style={{ display: "none" }}>
            {sessionId ? (
              <div className="session-badge" title={`Session ID: ${sessionId}`}>
                Session: {sessionId.slice(0, 8)}
              </div>
            ) : (
              <div className="session-badge">No Session</div>
            )}

            <button
              className="clear-session-button"
              onClick={() => clearSession()}
              disabled={isLoading}
              title="Clear session memory and start a new chat"
            >
              New Session
            </button>
          </div>

          <div className="userIconDiv" onClick={() => setCurrentView("profile")}>
            <span className="userIcon">
              <i className="fa-solid fa-user"></i>
            </span>
          </div>
        </div>
      </div>

      <div className={`chat-content ${messages.length > 0 ? 'has-messages' : ''}`} ref={chatContentRef}>
        {messages.length === 0 ? (
          <>
            <div className="heading">Welcome to Pharos</div>
            <div className="subheading">
              Transforming Pharmaceutical Research Through Agentic Intelligence
            </div>
          </>
        ) : (
          <div className="message-history">
            {messages.map((msg) => renderMessageWithDownloads(msg))}
          </div>
        )}
      </div>

      <div className="chat-input-area">
        <form onSubmit={handleSend} className="chat-bar">
          <input
            type="text"
            className="chat-input"
            placeholder="How can I help you today?"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
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
            <button
              type="submit"
              className="icon-button file-upload-button"
              disabled={isLoading}
            >
              <FaPaperPlane
                size={18}
                style={{ opacity: isLoading ? 0.5 : 1 }}
              />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChatWindow;
