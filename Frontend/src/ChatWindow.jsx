import "./ChatWindow.css";
// Import icons from react-icons
import { FiPlus, FiImage, FiUpload } from "react-icons/fi";
import { TfiCommentAlt } from "react-icons/tfi";

function ChatWindow() {
  return (
    <>
    <div className="navbar">
      <span>Pharma AI</span>
      <div className="userIconDiv">
        <span className="userIcon"><i class="fa-solid fa-user"></i></span>
      </div>
    </div>
    <div className="heading">Welcome to Pharma AI</div>
    <div className="subheading">Transforming Pharmaceutical Research Through Agentic Intelligence</div>
    <div>
      <div className="chat-bar">
         <input
          type="text"
          className="chat-input"
          placeholder="How can I help you today?"
        />
        <div className="left-icons">
          <button className="icon-button">
            <FiPlus size={20} />
          </button>
          <button className="icon-button">
            <FiImage size={20} />
          </button>
          <button className="icon-button">
            <TfiCommentAlt size={20} />
          </button>
           <button className="icon-button file-upload-button">
          {/* <FiUpload size={20} /> */}
          <i class="fa-solid fa-paper-plane"></i>
        </button>
        </div>
        </div>
    </div>
    </>
  );
}

export default ChatWindow;