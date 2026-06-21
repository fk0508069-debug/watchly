'use client';
import { useState, useRef, useEffect, useCallback } from 'react';

// Helper function to generate unique IDs
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [chatMode, setChatMode] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const isSendingRef = useRef(false);

  // Initialize messages when component mounts
  useEffect(() => {
    if (messages.length === 0) {
      const initialMessage = {
        id: generateId(), // Use string ID
        text: 'Hello! How can I help you today?',
        sender: 'bot'
      };
      setMessages([initialMessage]);
    }
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleModeSelect = (mode) => {
    setChatMode(mode);
    setIsOpen(true);
    setShowOptions(false);
    
    const welcomeMsg = mode === 'agent'
      ? 'You are now chatting with our AI agent. How can I assist you?'
      : 'You are now connected to a company employee. Please describe your issue.';
    
    const newMessage = {
      id: generateId(),
      text: welcomeMsg,
      sender: 'bot'
    };
    setMessages([newMessage]);
    isSendingRef.current = false;
  };

  const handleSendMessage = useCallback(async () => {
    if (isSendingRef.current || isLoading) {
      console.log('⚠️ Request already in progress, skipping...');
      return;
    }

    const trimmedMessage = inputValue.trim();
    if (!trimmedMessage) return;

    isSendingRef.current = true;

    // Create user message with unique string ID
    const userMessage = {
      id: generateId(), // Always unique
      text: trimmedMessage,
      sender: 'user'
    };
    
    setInputValue('');
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      console.log('📤 Sending message:', trimmedMessage);
      
      const res = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmedMessage })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || `Server error: ${res.status}`);
      }

      if (data.response) {
        const botMessage = {
          id: generateId(), // Always unique
          text: data.response,
          sender: 'bot'
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('❌ Chat error:', error);
      const errorMessage = {
        id: generateId(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      isSendingRef.current = false;
    }
  }, [inputValue, isLoading]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating button with click options */}
      <div className="fixed bottom-4 right-4 z-50">
        <button 
          onClick={() => setShowOptions(!showOptions)} 
          className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition duration-300 hover:bg-blue-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Chat
        </button>

        {showOptions && (
          <div className="absolute bottom-full right-0 mb-2 w-48 bg-yellow-400 rounded-xl shadow-xl border border-slate-200 overflow-hidden transition duration-300">
            <button
              onClick={() => handleModeSelect('agent')}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-yellow-500 flex items-center gap-2 transition-colors duration-200"
            >
              <span className="text-blue-500">🤖</span> Chat with Agent
            </button>
            <button
              onClick={() => handleModeSelect('employee')}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-yellow-500 flex items-center gap-2 border-t border-yellow-500/30 transition-colors duration-200"
            >
              <span className="text-green-600">👥</span> Chat with Company Employee
            </button>
          </div>
        )}
      </div>

      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Chat panel */}
      <div
        className={`fixed bottom-0 right-0 left-0 mx-auto mb-4 w-full max-w-md z-50 transform rounded-3xl bg-white shadow-2xl transition-all duration-500 ${
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              {chatMode === 'agent' ? 'AI Agent' : 'Live Support'}
            </p>
            <h2 className="text-lg font-semibold text-slate-900">
              {chatMode === 'agent' ? 'Chat with Agent' : 'Chat with Employee'}
            </h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-900">
            ✕
          </button>
        </div>

        <div className="flex flex-col h-96">
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                  msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-900'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-slate-200 px-5 py-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading || !chatMode}
                placeholder={chatMode ? "Type your message..." : "Select a chat mode first..."}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !chatMode}
                className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}