// Frontend/src/Sidebar.jsx
import React, { useContext } from "react";
import "./Sidebar.css";
import { MyContext } from "./MyContext.jsx";

function Sidebar() {
  // Consume context values, including the newChat function and setCurrentView
  const { isSidebarCollapsed, toggleSidebar, newChat, setCurrentView } = useContext(MyContext);

  return (
    // Apply 'collapsed' class based on state
    <section className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
      {/* Top section with the hamburger menu */}
      <div className="sidebar-header" onClick={toggleSidebar}>
        <i className="fa-solid fa-bars"></i>
      </div>

      {/* Main top buttons area (New Chat and Search Chats) */}
      <div className="top-actions-container">
        {/* New Chat Button: onClick calls newChat() */}
        <button className="button new-chat-button" onClick={newChat}>
          <i className="fa-solid fa-pen-to-square"></i>
          {!isSidebarCollapsed && <span>New chat</span>}
        </button>

        {/* Search Chats */}
        <div className="search-chats-text">
          <i className="fa-solid fa-magnifying-glass"></i>
          {!isSidebarCollapsed && <span>Search chats</span>}
        </div>
      </div>

      {/* Middle Section: History */}
      <ul className="history">
        <li>Thread 1: The Great Pyramid</li>
        <li>Thread 2: CSS Flexbox Explained</li>
        <li>Thread 3: Setting up a new React Project</li>
        <li>Thread 4: A very long history item that ...</li>
      </ul>

      {/* Bottom Section: Comparison Dashboard (NEW) + Settings/Sign/Footer */}
      <div className="sign">
        {/* Comparison Dashboard - placed ABOVE Settings as requested */}
        <button
          className="button comparison-button"
          onClick={() => {
            // setCurrentView will switch the main area to the Molecule Comparison page
            if (typeof setCurrentView === "function") {
              setCurrentView("molecule");
            } else {
              // fallback - only for debugging; normally setCurrentView will exist
              console.warn("setCurrentView not available in context");
            }
          }}
        >
          <i className="fa-solid fa-vials" aria-hidden></i>
          {!isSidebarCollapsed && <span>Comparison Dashboard</span>}
        </button>

        {/* Keep your existing settings button below */}
        <button className="button settings-button">
          <i className="fa-solid fa-gear"></i>
          {!isSidebarCollapsed && <span>Settings</span>}
        </button>
      </div>
    </section>
  );
}

export default Sidebar;
