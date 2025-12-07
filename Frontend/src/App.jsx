// Frontend/src/App.jsx

import React, { useState } from "react";
import "./App.css";

import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import ProfilePage from "./ProfilePage.jsx";
import MoleculeComparison from "./MoleculeComparison.jsx";
import CollaborationWorkspace from "./CollaborationWorkspace.jsx";

import { MyContext } from "./MyContext.jsx";

function App() {
  /* --------------------------------------------
     SIDEBAR STATE
  --------------------------------------------- */
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  /* --------------------------------------------
     PAGE VIEW STATE (chat | profile | molecule)
  --------------------------------------------- */
  const [currentView, setCurrentView] = useState("chat");

  /* --------------------------------------------
     CHAT STATE (Fix for your error)
     These MUST be provided to context
  --------------------------------------------- */
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]); // <== Important fix

  /* --------------------------------------------
     NEW CHAT HANDLER
  --------------------------------------------- */
  const newChat = () => {
    setMessages([]);   // Reset chat messages
    setPrompt("");     // Clear user input
    setCurrentView("chat"); // <--- FIX: Ensure we switch back to the chat view
    console.log("New chat session started");
  };

  /* --------------------------------------------
     CONTEXT OBJECT (All values exposed to children)
  --------------------------------------------- */
  const providerValues = {
    // Sidebar state
    isSidebarCollapsed,
    toggleSidebar,

    // Chat values (Fix)
    prompt,
    setPrompt,
    messages,
    setMessages,

    // Page navigation
    currentView,
    setCurrentView,

    // New chat callback
    newChat,
  };

  /* --------------------------------------------
     RENDER
  --------------------------------------------- */
  return (
    <div className={`app ${isSidebarCollapsed ? "collapsed" : ""}`}>
      <MyContext.Provider value={providerValues}>
        <Sidebar />

        {/* Main content container */}
        <div style={{ padding: 12, flex: 1 }}>
          {currentView === "chat" && <ChatWindow />}
          {currentView === "profile" && <ProfilePage />}
          {currentView === "molecule" && <MoleculeComparison />}
          {currentView === "collaboration" && <CollaborationWorkspace />}
        </div>
      </MyContext.Provider>
    </div>
  );
}

export default App;