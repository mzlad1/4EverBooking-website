import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next"; // Import useTranslation
import "./ChatOverlay.css";

const ChatOverlay = () => {
  const [isOpen, setIsOpen] = useState(false); // To toggle chat window
  const [messages, setMessages] = useState([]); // To store messages
  const [input, setInput] = useState(""); // To store user input
  const [isTyping, setIsTyping] = useState(false); // To track typing status
  const { t } = useTranslation(); // Initialize translation hook

  // Function to toggle chat window
  const toggleChat = () => setIsOpen(!isOpen);

  // Function to send a message
  const sendMessage = async () => {
    if (input.trim() === "") return; // Ignore empty input

    // Add user message to chat
    const userMessage = { role: "user", content: input, timestamp: Date.now() };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput(""); // Clear input field
    setIsTyping(true); // Set typing state

    try {
      // Send user input to the backend
      const userId = localStorage.getItem("userId"); // Replace this with the actual session ID or generate it dynamically.

      const response = await fetch(
        `http://localhost:8080/chatbot/query?userId=${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: input }), // Backend expects "query"
        }
      );

      const data = await response.json();

      // Add response from API to chat
      if (data && data.response) {
        const botMessage = {
          role: "assistant",
          content: data.response,
          timestamp: Date.now(),
        };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } else {
        const errorMessage = {
          role: "assistant",
          content: "Error: No response received.",
          timestamp: Date.now(),
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        role: "assistant",
        content: "Error: Unable to connect to the server.",
        timestamp: Date.now(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsTyping(false); // Reset typing state
    }
  };

  // Clear chat after 1 hour
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        setMessages([]); // Clear all messages
        console.log("Chat cleared after 1 hour");
      }, 3600000); // 1 hour in milliseconds (3600 * 1000)

      // Cleanup timer when component unmounts or messages change
      return () => clearTimeout(timer);
    }
  }, [messages]);

  return (
    <>
      {/* Chat icon */}
      <div
        className={`chat-icon ${isOpen ? "hidden" : ""}`}
        onClick={toggleChat}
      >
        💬
      </div>

      {/* Chat window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>{t("Assistant")}</h3>
            <button onClick={toggleChat}>✖</button>
          </div>
          <div className="chat-body">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-message-wrapper ${
                  msg.role === "user" ? "user" : "assistant"
                }`}
              >
                {msg.role === "assistant" && (
                  <img
                    src="https://res.cloudinary.com/dykzph9bu/image/upload/v1735149876/bot_f9kdya.png"
                    alt="Chatbot"
                    className="profile-icon"
                  />
                )}
                <div
                  className={`chat-message ${
                    msg.role === "user" ? "user" : "assistant"
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <img
                    src={
                      localStorage.getItem("profileImage") ||
                      "https://res.cloudinary.com/dykzph9bu/image/upload/v1735149875/user_uh8dv7.png"
                    }
                    alt="User"
                    className="profile-icon"
                  />
                )}
              </div>
            ))}
            {isTyping && (
              <div className="chat-message typing-indicator assistant">
                {t("typing")}...
              </div>
            )}
          </div>
          <div className="chat-footer">
            <input
              type="text"
              placeholder={t("type_message")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>
              {t("send")}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatOverlay;
