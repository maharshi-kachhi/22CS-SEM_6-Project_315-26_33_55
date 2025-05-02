"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Copy, ThumbsUp, ThumbsDown, User } from 'lucide-react';
import "bootstrap/dist/css/bootstrap.min.css";
import { useUser } from "@clerk/clerk-react";
import '.././styles.css';
import { useClerk } from "@clerk/clerk-react";
import { useTheme } from "../context/theme-context.tsx";
import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/clerk-react";

export default function MainScreen({ messages, setMessages, sidebarOpen, currentChatId, setCurrentChatId, onMessageSent }) {
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const [likedMessages, setLikedMessages] = useState({});
  const [dislikedMessages, setDislikedMessages] = useState({});
  const [copiedMessages, setCopiedMessages] = useState({});
  const { isLoaded, user } = useUser();
  const [dummyResponseCounter, setDummyResponseCounter] = useState(1);
  const { openSignIn } = useClerk();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [inputPlaceholder, setInputPlaceholder] = useState("Type Here");

  // Add useEffect to fetch chat history when currentChatId changes
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!user || !user.id || !currentChatId) {
        setMessages([]); // Clear messages if no chat is selected
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/api/chats/${user.id}/${currentChatId}`);
        const data = await response.json();
        
        if (data.chat && data.chat.history) {
          const formattedMessages = data.chat.history.map(msg => ({
            type: msg.role === "user" ? "user" : "assistant",
            text: msg.parts[0].text
          }));
          setMessages(formattedMessages);
          
          // Set the dummy response counter based on the number of model messages
          const modelMessages = data.chat.history.filter(msg => msg.role === "model").length;
          setDummyResponseCounter(modelMessages + 1);
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };

    fetchChatHistory();
  }, [user, setMessages, currentChatId]);

  // Update input placeholder based on loading state
  useEffect(() => {
    setInputPlaceholder(isLoading ? "AI is thinking..." : "Type Here");
  }, [isLoading]);

  const toggleLike = (index) => {
    setLikedMessages((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
    setDislikedMessages((prev) => ({
      ...prev,
      [index]: false,
    }));
  };

  const toggleDislike = (index) => {
    setDislikedMessages((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
    setLikedMessages((prev) => ({
      ...prev,
      [index]: false,
    }));
  };

  const handleCopy = (index, text) => {
    navigator.clipboard.writeText(text);
    setCopiedMessages((prev) => ({
      ...prev,
      [index]: true,
    }));
    setTimeout(() => {
      setCopiedMessages((prev) => ({
        ...prev,
        [index]: false,
      }));
    }, 1000);
  };

  // Auto-scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = inputRef.current.value.trim();
    if (!text) return;
  
    if (!user || !user.id) {
      console.warn("User not logged in, proceeding as guest.");
      // For guest users, just update UI without saving to DB
      setMessages(prev => [
        ...prev,
        { type: "user", text },
        { type: "assistant", text: `Dummy response ${dummyResponseCounter}` }
      ]);
      setDummyResponseCounter(prev => prev + 1);
      inputRef.current.value = "";
      return;
    }
  
    const userId = user.id; // Clerk user ID
  
    try {
      setIsLoading(true); // Start loading
      
      // Save user message
      const response = await fetch("http://localhost:8080/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          userId, 
          text,
          chatId: currentChatId // Include currentChatId if it exists
        }),
      });

      const data = await response.json();
      
      // Set the current chat ID if this is a new chat
      if (!currentChatId && data.chat._id) {
        setCurrentChatId(data.chat._id);
      }
      
      // Add user message to UI with animation
      setMessages(prev => [...prev, { 
        type: "user", 
        text,
        animation: "fade-in"
      }]);

      // Add loading message with typing animation
      setMessages(prev => [...prev, { 
        type: "assistant", 
        text: "Thinking", 
        isLoading: true,
        animation: "fade-in"
      }]);

      
      const geminiResponse = await fetch(process.env.Model_key, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Classify the following text as one of the three categories: 'No Hate Speech', 'Offensive Language', or 'Hate Speech'. Just answer in one word, no explanation.\n\nText: ${text}`
            }]
          }]
        })
      });

      const geminiData = await geminiResponse.json();
      const classification = geminiData.candidates[0].content.parts[0].text.trim().toLowerCase();

      // Remove loading message
      setMessages(prev => prev.filter(msg => !msg.isLoading));

      // Save model response to database
      await fetch("http://localhost:8080/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          userId, 
          text: classification,
          role: "model",
          chatId: currentChatId || data.chat._id // Use current chat ID or the new one
        }),
      });

      // Add model response to UI as assistant type with animation
      setMessages(prev => [...prev, { 
        type: "assistant", 
        text: classification,
        animation: "fade-in"
      }]);
      
      // Trigger sidebar refresh
      onMessageSent();
      
      inputRef.current.value = "";
    } catch (error) {
      console.error("Error in chat:", error);
      // Remove loading message if it exists
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      // Show error message to user with animation
      setMessages(prev => [...prev, { 
        type: "assistant", 
        text: "I apologize, but I encountered an error processing Please try again.",
        animation: "fade-in"
      }]);
    } finally {
      setIsLoading(false); // End loading regardless of success or failure
    }
  };
  
  return (
    <div className={`main-content ${sidebarOpen ? "" : "without-sidebar"} d-flex flex-column`}>
      {/* Profile Icon (Top Right) */}
      <div className="profile-container position-absolute top-0 end-0 m-3">
        <header>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: "30px", height: "30px", padding: 0, border: "none", background: "var(--profile-btn-bg)" }}>
                <User size={20} color="var(--icon-color)" />
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton />
          </SignedIn>
        </header>
      </div>

      {/* Display Username at the Top */}
      <div className="p-3 text-center">
        {isLoaded && user && (
          <h5>
            Welcome, <strong>{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}</strong>!
          </h5>
        )}
      </div>

      {/* Chat Area */}
      <div className="chat-area flex-grow-1">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`message ${message.type} ${message.animation || ''}`} 
            style={{ alignSelf: message.type === "user" ? "flex-end" : "flex-start" }}
          >
            <div className="message-content">
              <p>
                {message.isLoading ? (
                  <span className="d-flex align-items-center">
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <span className="typing-animation">{message.text}</span>
                  </span>
                ) : (
                  message.text
                )}
              </p>

              {message.type === "user" && !message.isLoading && (
                <div className="message-actions">
                  <button 
                    className="btn btn-link" 
                    onClick={() => handleCopy(index, message.text)}
                    title="Copy message"
                  >
                    <Copy size={16} color={copiedMessages[index] ? "var(--text-primary)" : "var(--icon-color)"} fill={copiedMessages[index] ? "var(--text-primary)" : "none"} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Auto-scroll anchor */}
        <div ref={chatEndRef}></div>
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="d-flex align-items-center">
        <div className={`input-area ${sidebarOpen ? "" : "full-width"}`}>
          <div className="input-container mb-3">
            <input 
              ref={inputRef} 
              type="text" 
              name="text" 
              placeholder={inputPlaceholder}
              className="form-control" 
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="btn btn-link"
              disabled={isLoading}
              title={isLoading ? "Please wait..." : "Send message"}
            >
              <Send size={16} color={isLoading ? "var(--text-muted)" : "var(--icon-color)"} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}