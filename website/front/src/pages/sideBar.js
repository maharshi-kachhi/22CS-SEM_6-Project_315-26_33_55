"use client";
import { useRef, useEffect, useState } from "react";
import { Plus, ChevronsRight, ChevronsLeft, Sun, Moon, MoreHorizontal, Trash2, Edit2, X } from 'lucide-react';
import "bootstrap/dist/css/bootstrap.min.css";
import { useTheme } from "../context/theme-context.tsx";
import { useUser } from "@clerk/clerk-react";

export default function SidebarAndHeader({ sidebarOpen, setSidebarOpen, onNewChat, refreshChats, onChatSelect, currentChatId }) {
  const dropdownRef = useRef(null);
  const { theme, toggleTheme } = useTheme();
  const { user } = useUser();
  const [userChats, setUserChats] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameChatId, setRenameChatId] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const renameInputRef = useRef(null);

  // Add click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch user's chat list
  useEffect(() => {
    const fetchUserChats = async () => {
      if (!user || !user.id) return;

      try {
        const response = await fetch(`http://localhost:8080/api/user-chats/${user.id}`);
        const data = await response.json();
        
        if (data.userChats && data.userChats.chats) {
          setUserChats(data.userChats.chats);
        }
      } catch (error) {
        console.error("Error fetching user chats:", error);
      }
    };

    fetchUserChats();
  }, [user, refreshChats]);

  const handleNewChat = () => {
    onNewChat();
  };

  const handleChatSelect = (chatId) => {
    onChatSelect(chatId);
  };

  const handleDropdownClick = (e, chatId) => {
    e.stopPropagation();
    if (activeDropdown !== chatId) {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left
      });
    }
    setActiveDropdown(activeDropdown === chatId ? null : chatId);
  };

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    try {
      // Remove the chat from userchats collection (this will also delete from chat collection)
      const response = await fetch(`http://localhost:8080/api/user-chats/${user.id}/remove-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete chat');
      }

      // Update the UI
      setUserChats(prevChats => prevChats.filter(chat => chat._id !== chatId));
      
      // If the deleted chat was selected, clear the selection
      if (currentChatId === chatId) {
        onChatSelect(null);
      }

      // Close the dropdown
      setActiveDropdown(null);

      // Trigger a refresh of the chat list
      onNewChat(); // This will trigger a refresh of the chat list
    } catch (error) {
      console.error("Error deleting chat:", error);
      alert(error.message || "Failed to delete chat. Please try again.");
    }
  };

  const handleRenameChat = async (e, chatId, currentTitle) => {
    e.stopPropagation();
    setRenameChatId(chatId);
    setNewTitle(currentTitle || '');
    setShowRenameModal(true);
  };

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    const trimmedTitle = newTitle?.trim() || '';
    if (!trimmedTitle || !renameChatId) return;

    try {
      const response = await fetch(`http://localhost:8080/api/user-chats/${user.id}/update-chat-title`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId: renameChatId, newTitle: trimmedTitle }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update chat title');
      }

      // Update the chat list with the new title
      setUserChats(prevChats =>
        prevChats.map(chat =>
          chat._id === renameChatId ? { ...chat, title: trimmedTitle } : chat
        )
      );

      // Close the modal
      setShowRenameModal(false);
      setRenameChatId(null);
      setNewTitle("");
    } catch (error) {
      console.error("Error renaming chat:", error);
      alert(error.message || "Failed to rename chat. Please try again.");
    }
  };

  // Add this useEffect to focus the input when modal opens
  useEffect(() => {
    if (showRenameModal && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select(); // Select all text
    }
  }, [showRenameModal]);

  return (
    <>
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "" : "closed"} d-none d-md-flex flex-column`}>
        <div className="d-flex justify-content-between align-items-center p-2">
          <button className="btn btn-link" onClick={handleNewChat}>
            <Plus size={20} color="var(--icon-color)" />
          </button>
          <div className="d-flex">
            <button 
              className="btn btn-link theme-toggle me-2" 
              onClick={toggleTheme} 
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? 
                <Sun size={20} color="var(--icon-color)" /> : 
                <Moon size={20} color="var(--icon-color)" />
              }
            </button>
            <button className="btn btn-link" onClick={() => setSidebarOpen(false)}>
              <ChevronsLeft size={20} color="var(--icon-color)" />
            </button>
          </div>
        </div>

        <div className="p-2 d-flex align-items-center justify-content-center w-100 app-title" style={{ fontSize: "22px" }}>
          <span>Hate Speech Detection</span>
        </div>

        <div className="conversation-list">
          <div className="px-3 py-2">
            <small className="conversation-date">Chats</small>
            {userChats.map((chat, index) => (
              <div 
                key={chat._id} 
                className={`conversation-item ${currentChatId === chat._id ? 'active' : ''}`}
                onClick={() => handleChatSelect(chat._id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex justify-content-between align-items-center w-100">
                  <span className="text-truncate me-2">{chat.title}</span>
                  <div className="position-relative">
                    <button 
                      className="btn btn-link p-0"
                      onClick={(e) => handleDropdownClick(e, chat._id)}
                    >
                      <MoreHorizontal size={16} color="var(--icon-color)" />
                    </button>
                    {activeDropdown === chat._id && (
                      <div 
                        ref={dropdownRef}
                        className="dropdown-menu show" 
                        style={{ 
                          position: 'fixed',
                          top: `${dropdownPosition.top}px`,
                          left: `${dropdownPosition.left}px`,
                          zIndex: 9999,
                          minWidth: '150px',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                          backgroundColor: 'var(--bg-primary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '4px',
                          marginTop: '4px'
                        }}
                      >
                        <button 
                          className="dropdown-item d-flex align-items-center"
                          onClick={(e) => handleRenameChat(e, chat._id)}
                          style={{ color: 'var(--text-primary)' }}
                        >
                          <Edit2 size={16} className="me-2" />
                          Rename
                        </button>
                        <button 
                          className="dropdown-item d-flex align-items-center text-danger"
                          onClick={(e) => handleDeleteChat(e, chat._id)}
                        >
                          <Trash2 size={16} className="me-2" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Open Sidebar Button */}
      {!sidebarOpen && (
        <button className="open-sidebar-btn" onClick={() => setSidebarOpen(true)}>
          <ChevronsRight size={24} color="var(--icon-color)" />
        </button>
      )}

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h5>Rename Chat</h5>
              <button 
                className="btn btn-link p-0" 
                onClick={() => {
                  setShowRenameModal(false);
                  setRenameChatId(null);
                  setNewTitle("");
                }}
              >
                <X size={20} color="var(--icon-color)" />
              </button>
            </div>
            <form onSubmit={handleRenameSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <input
                    ref={renameInputRef}
                    type="text"
                    className="form-control"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Enter new chat title"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowRenameModal(false);
                    setRenameChatId(null);
                    setNewTitle("");
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={!newTitle.trim()}
                >
                  Rename
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}