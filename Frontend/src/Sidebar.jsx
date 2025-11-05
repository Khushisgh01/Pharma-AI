import "./Sidebar.css";

function Sidebar(){
    return(
        <section className="sidebar">
            <button className="button">
                <img src="src/assets/logo.png" alt="Logo" className="logo" />
                <span><i className="fa-solid fa-pen-to-square"></i></span>
            </button>

            {/* Middle Section: History */}
            <ul className="history">
                <li>Thread 1: The Great Pyramid</li>
                <li>Thread 2: CSS Flexbox Explained</li>
                <li>Thread 3: Setting up a new React Project</li>
                <li>Thread 4: A very long history item that needs an ellipsis</li>
            </ul>

            {/* Bottom Section: Sign/Footer */}
            <div className="sign">
                <p>&hearts; Made with Love</p>
            </div>
        </section>
    )
};

export default Sidebar;