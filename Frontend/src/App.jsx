// import './App.css'
// import Sidebar from './Sidebar.jsx';
// import ChatWindow from './ChatWindow.jsx';
// import {MyContext} from "./MyContext.jsx";
// import { useState } from 'react';
// function App() {
//   // const [prompt,setPrompt]=useState("");
//   // const [reply,setReply]=useState(null);
//   // const providerValues={}={
//   //   prompt,setPrompt,
//   //   reply,setReply,
//   // }//passing values
//   return (
//     <div className='app'>
//       {/* <MyContext.Provider values={providerValues}> */}
//         <Sidebar></Sidebar>
//         <ChatWindow></ChatWindow>
//       {/* </MyContext.Provider> */}
      
//     </div >
//   )
// }

// export default App
import './App.css'
import Sidebar from './Sidebar.jsx';
import ChatWindow from './ChatWindow.jsx';
import {MyContext} from "./MyContext.jsx";
import { useState } from 'react'; // Import useState

function App() {

  // State to manage sidebar collapse status
  const [isCollapsed, setIsCollapsed] = useState(false); 

  // Function to toggle the sidebar state
  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev);
  };

  const providerValues={ 
    isSidebarCollapsed: isCollapsed, // Pass state
    toggleSidebar: toggleSidebar     // Pass function
  };
  
  return (
    // Apply a class name to the app wrapper based on the collapsed state
    <div className={`app ${isCollapsed ? 'collapsed' : ''}`}> 
      <MyContext.Provider value={providerValues}> {/* Changed 'values' to 'value' */}
        <Sidebar></Sidebar>
        <ChatWindow></ChatWindow>
      </MyContext.Provider>
      
    </div >
  )
}

export default App