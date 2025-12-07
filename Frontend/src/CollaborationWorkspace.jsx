// Frontend/src/CollaborationWorkspace.jsx
import React, { useContext } from "react";
import "./CollaborationWorkspace.css";
import { MyContext } from "./MyContext.jsx";
import { FiArrowLeft } from "react-icons/fi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FaPaperPlane } from "react-icons/fa"; // For the send icon

// Mock data for the dashboard sections (simplified)
const recentActivity = [
  { id: 1, text: "Miscellaneous Analgesic and Antipyretic inhibits prostaglandin synthesis mainly in the Central Nervous System (CNS). The exact full mechanism is not completely understood.", time: "5 hours ago", color: "#82ca9d" },
  { id: 2, text: "Hepatotoxicity (Severe liver damage). Overdose can be fatal and often requires a specific antidote (N-acetylcysteine).", time: "4 hours ago", color: "#d095d9" },
  { id: 3, text: "Primary Metabolism Site: Liver (Metabolized) and Kidneys (Excreted).", time: "4 hours ago", color: "#ffc658" },
];

const taskProgressData = [
    { name: 'Mon', uv: 40 },
    { name: 'Tue', uv: 65 },
    { name: 'Wed', uv: 80 },
    { name: 'Thu', uv: 55 },
    { name: 'Fri', uv: 90 },
];

const pendingApprovals = [
    { team: "A&M", updates: 11, initials: "A&M" },
    { team: "PG", updates: 8, initials: "PG" },
    { team: "Legal", updates: 10, initials: "SM" },
];

const discussionMessages = [
    { id: 1, text: "Great research done on the comparative analysis of Empagliflozin vs Semaglutide. Let's collaborate on my next research work!", time: "3:00 AM", align: "right" },
    { id: 2, text: "Glad to hear! Yes, let's collaborate. Can you tell more about your research work?", time: "3:05 AM", align: "left" },
];

function CollaborationWorkspace() {
    const { setCurrentView } = useContext(MyContext);

    return (
        <div className="workspace-page-container">
            
            {/* 1. Main Header */}
            <div className="workspace-header">
                <div className="header-left">
                    <button className="back-button icon-button" onClick={() => setCurrentView('chat')}>
                        <FiArrowLeft size={24} />
                    </button>
                    <h1>Collaboration Workspace</h1>
                </div>
                <div className="header-right">
                    <button className="search-teams-button">Search teams</button>
                    <div className="userIconDiv" onClick={() => setCurrentView("profile")}>
                        <span className="userIcon">
                            <i className="fa-solid fa-user"></i>
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. Tabs */}
            <nav className="workspace-tabs">
                <span className="active">Overview</span>
                <span>Document</span>
                <span>Task</span>
                <span>Discussions</span>
            </nav>

            {/* 3. Main Content Grid */}
            <div className="workspace-content-grid">
                
                {/* Dashboard Cards */}
                <div className="dashboard-cards">
                    {/* Recent Activity */}
                    <div className="card activity-card">
                        <h2>Recent Activity</h2>
                        <div className="activity-list">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="activity-item">
                                    <div className="activity-line" style={{ '--dot-color': activity.color }}></div>
                                    <div className="activity-dot" style={{ backgroundColor: activity.color }}></div>
                                    <div className="activity-text">
                                        <p>{activity.text}</p>
                                        <small>{activity.time}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Task Progress (Top Right) */}
                    <div className="card progress-card">
                        <h2>Task Progress</h2>
                        <ResponsiveContainer width="100%" height={150}>
                            <BarChart data={taskProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis dataKey="name" stroke="#ccc" />
                                <YAxis stroke="#ccc" domain={[0, 100]} />
                                <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #444' }} />
                                <Bar dataKey="uv" fill="#ffc658" name="Progress Score" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    
                    {/* Pending Approvals (Middle Right) */}
                    <div className="card approvals-card">
                        <h2>Pending Approvals</h2>
                        <div className="approvals-list">
                            {pendingApprovals.map((approval, index) => (
                                <div key={index} className="approval-item">
                                    <div className="team-icon">{approval.initials}</div>
                                    <div>
                                        <p><strong>{approval.team}</strong></p>
                                        <small>{approval.updates} team updates</small>
                                    </div>
                                    <i className="fa-solid fa-chevron-right"></i>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Document Repository (Bottom Right) */}
                    <div className="card repo-card">
                        <h2>Document Repository</h2>
                        <div className="repo-folders">
                            <div className="folder">
                                <i className="fa-solid fa-folder-open"></i>
                                <span>Legal</span>
                            </div>
                            <div className="folder">
                                <i className="fa-solid fa-folder-open"></i>
                                <span>Research Team</span>
                            </div>
                            <div className="folder">
                                <i className="fa-solid fa-folder-open"></i>
                                <span>Analysis</span>
                                <span className="count">98</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Discussions Thread (Right Sidebar) */}
                <div className="discussions-thread-container">
                    <div className="thread-header">
                        <h2>Discussions Thread</h2>
                        <i className="fa-solid fa-ellipsis-vertical"></i>
                    </div>
                    <div className="thread-content">
                        {discussionMessages.map((message) => (
                            <div key={message.id} className={`message-wrapper ${message.align}`}>
                                {message.align === "left" && <div className="avatar"></div>}
                                <div className={`message-bubble ${message.align}`}>
                                    <p>{message.text}</p>
                                    <small>{message.time}</small>
                                </div>
                                {message.align === "right" && <div className="avatar"></div>}
                            </div>
                        ))}
                    </div>
                    <form className="thread-input-form">
                        <input type="text" placeholder="Type a message..." />
                        <button type="submit" className="send-button">
                             <FaPaperPlane size={18} style={{ color: 'white' }} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CollaborationWorkspace;