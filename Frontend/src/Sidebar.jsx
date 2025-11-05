// import "./Sidebar.css";

// function Sidebar(){
//     return(
//         <section className="sidebar">
//             {/* new chat button */}
//             <button>
//                 <img src="src/assets/logo.png" alt="Logo" className="logo"></img>
//                 <span><i className="fa-solid fa-pen-to-square"></i></span>
//             </button>

//             {/* history */}
//             <ul className="history">
//                 <li>history1</li>
//                 <li>history2</li>
//                 <li>history3</li>
//                 <li>history4</li>
//             </ul>

//             {/* sign */}
//             <div className="sign">
//                 <p>&hearts;</p>
//             </div>
//         </section>
//     )
// };

// export default Sidebar;

import "./Sidebar.css";

function Sidebar(){
    return(
        <section className="sidebar">
            {/* Top Section: New Chat Button */}
            <button className="button"> {/* 🎯 CRITICAL CORRECTION: Added className="button" */}
                {/* NOTE: Image tags in JSX are self-closing and don't take a closing tag like </img>.
                  Also, in a typical React setup, your image path might need to be resolved 
                  differently (e.g., imported) or placed in the public folder. 'src/assets/logo.png' 
                  is used here to keep it consistent with your original path.
                */}
                <img src="src/assets/logo.png" alt="Logo" className="logo" /> 
                {/* The span wraps the icon from Font Awesome */}
                <span><i className="fa-solid fa-pen-to-square"></i></span>
            </button>

            {/* Middle Section: History */}
            <ul className="history">
                <li>History 1: The Great Pyramid</li>
                <li>History 2: CSS Flexbox Explained</li>
                <li>History 3: Setting up a new React Project</li>
                <li>History 4: A very long history item that needs an ellipsis</li>
            </ul>

            {/* Bottom Section: Sign/Footer */}
            <div className="sign">
                <p>&hearts;</p>
            </div>
        </section>
    )
};

export default Sidebar;