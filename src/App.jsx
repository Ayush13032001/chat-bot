import { useEffect, useRef, useState } from "react";
import ChatbotIcon from "./components/ChatbotIcon";
import Chatform from "./components/Chatform";
import ChatMessage from "./components/ChatMessage";
import { companyInfo } from "./companyInfo.js";

// Loader component
export const DotLoader = () => (
  <span className="dot-loader">
    <span>.</span>
    <span>.</span>
    <span>.</span>
  </span>
);

const App = () => {
  const [chatHistory, setChatHistory] = useState([
    {
      hideInChat: true,
      role: "model",
      text: companyInfo,
    },
  ]);

  const chatBodyRef = useRef();
  const [showChatbot, setShowChatBot] = useState(false);

  const generateBotResponse = async (history) => {
    // Add loader message
    setChatHistory((prev) => [
      ...prev,
      { role: "model", isLoader: true, hideInChat: false },
    ]);

    // Format history for API
    const formattedHistory = history.map(({ role, text }) => ({
      role,
      parts: [{ text }],
    }));

    try {
      const response = await fetch(import.meta.env.VITE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: formattedHistory }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error?.message || "Something went wrong!");

      const apiText = data.candidates[0].content.parts[0].text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .trim();

      // Replace loader with actual response
      setChatHistory((prev) =>
        prev.map((msg) => (msg.isLoader ? { role: "model", text: apiText } : msg))
      );
    } catch (err) {
      console.error(err.message);
      setChatHistory((prev) =>
        prev.map((msg) =>
          msg.isLoader
            ? { role: "model", text: "Oops! Something went wrong." }
            : msg
        )
      );
    }
  };

  // Auto-scroll
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatHistory]);

  return (
    <div className={`container ${showChatbot ? "show-chatbot" : ""}`}>
      <button onClick={() => setShowChatBot((prev) => !prev)} id="chatbot-toggler">
        <span className="material-symbols-rounded" style={{ fontSize: "29px", fontVariationSettings: "'FILL' 1" }}>
          mode_comment
        </span>
        <span className="material-symbols-rounded">close</span>
      </button>

      <div className="chatbot-popup">
        <div className="chat-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">Chatbot</h2>
          </div>
          <button
            onClick={() => setShowChatBot((prev) => !prev)}
            className="material-symbols-rounded"
          >
            keyboard_arrow_down
          </button>
        </div>

        <div ref={chatBodyRef} className="chat-body">
          {/* Static greeting */}
          <div className="message bot-message">
            <ChatbotIcon />
            <p className="message-text">
              Hey there👋
              <br /> How can I help you today?
            </p>
          </div>

          {/* Dynamic chat messages */}
          {chatHistory.map((chat, i) => (
            <ChatMessage key={i} chat={chat} />
          ))}
        </div>

        <div className="chat-footer">
          <Chatform
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            generateBotResponse={generateBotResponse}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
