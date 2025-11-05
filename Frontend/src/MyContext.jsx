import { createContext } from "react";

// Updated to include placeholder values for the new context
export const MyContext = createContext({
    isSidebarCollapsed: false,
    toggleSidebar: () => {}
});