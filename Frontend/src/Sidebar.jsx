import "./Sidebar.css";
import { useContext } from 'react'; // Import useContext
import { MyContext } from "./MyContext.jsx"; // Import MyContext

function Sidebar(){
    
    // Consume context values
    const { isSidebarCollapsed, toggleSidebar } = useContext(MyContext);

    return(
        // Apply 'collapsed' class based on state
        <section className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}> 
            
            {/* Top section with the hamburger menu */}
            <div className="sidebar-header" onClick={toggleSidebar}>
                <i className="fa-solid fa-bars"></i>
            </div>

            {/* Main top buttons area (New Chat and Search Chats) */}
            <div className="top-actions-container">
                {/* New Chat Button */}
                <button className="button new-chat-button">
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

            {/* Bottom Section: Sign/Footer */}
            <div className="sign">
                <button className="button settings-button">
                    <i className="fa-solid fa-gear"></i>
                    {!isSidebarCollapsed && <span>Settings</span>}
                </button>
            </div>
        </section>
    )
};

export default Sidebar;