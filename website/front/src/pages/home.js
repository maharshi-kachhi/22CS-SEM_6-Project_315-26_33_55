"use client";
import { useState } from "react";
import SidebarAndHeader from "./sideBar";
import MainScreen from "./mainScreen";
import { ThemeProvider } from "../context/theme-context.tsx";
import { useUser } from "@clerk/clerk-react";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [refreshChats, setRefreshChats] = useState(0);
  const { isLoaded, user } = useUser();

  const handleNewChat = () => {
    setMessages([]); // Clear messages
    setCurrentChatId(null); // Reset current chat ID
  };

  const handleChatSelect = (chatId) => {
    setCurrentChatId(chatId);
  };

  return (
    <ThemeProvider>
      <div className={`app-container d-flex ${sidebarOpen && user ? "sidebar-open" : "sidebar-closed"}`}>
        {user && <SidebarAndHeader 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          onNewChat={handleNewChat}
          refreshChats={refreshChats}
          onChatSelect={handleChatSelect}
          currentChatId={currentChatId}
        />}
        <MainScreen 
          messages={messages} 
          setMessages={setMessages} 
          sidebarOpen={sidebarOpen && user}
          currentChatId={currentChatId}
          setCurrentChatId={setCurrentChatId}
          onMessageSent={() => setRefreshChats(prev => prev + 1)}
        />
      </div>
    </ThemeProvider>
  );
}