// src/components/DoubtBot.js
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import "../styles/DoubtBot.css";

const DoubtBot = () => {
  // Read subjectCode from the URL parameters.
  const { subjectCode } = useParams();
  const navigate = useNavigate();

  // We'll store the subject details fetched from the backend.
  const [subjectName, setSubjectName] = useState("");
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState("checking");
  const chatHistoryRef = useRef(null);

  // Fetch subject details from backend using subjectCode.
  useEffect(() => {
    if (subjectCode) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/api/subjects/${subjectCode}`)
        .then((res) => {
          if (res.data.success && res.data.subject_name) {
            setSubjectName(res.data.subject_name);
          } else {
            console.error("Subject fetch failed:", res.data.error);
            navigate("/invalid-subject"); // Navigate to an error route if needed.
          }
        })
        .catch((err) => {
          console.error("Subject fetch error:", err);
          navigate("/error");
        });
    }
  }, [subjectCode, navigate]);

  // Check Gemini API health
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/health`)
      .then((res) =>
        setAiStatus(res.data.ai === "ready" ? "ready" : "unavailable")
      )
      .catch(() => setAiStatus("unavailable"));
  }, []);

  // Auto-scroll chat history
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || isLoading || aiStatus !== "ready") return;

    setIsLoading(true);
    setChatHistory((prev) => [...prev, { type: "user", content: query }]);
    setQuery("");
    try {
      // Use the fetched subject name (fallback to subjectCode if needed)
      const subjectForPrompt = subjectName || subjectCode;
      // Replace any instance of "this subject" with the subject name.
      const lastMessage = query.replace(/this subject/gi, subjectForPrompt);
      const prompt = `[${subjectForPrompt} Expert] You are an expert in ${subjectForPrompt}. The subject is clearly defined as "${subjectForPrompt}". Do not ask for clarification—simply answer the following query directly: ${lastMessage}`;
      
      const payload = {
        // Send the subject name instead of the subject code
        subject: subjectForPrompt,
        messages: [{ content: query }]
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/ask`,
        payload,
        { timeout: 30000 }
      );
      setChatHistory((prev) => [
        ...prev,
        { type: "bot", content: response.data.response }
      ]);
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      setChatHistory((prev) => [
        ...prev,
        {
          type: "bot",
          content:
            error.response?.data?.solution ||
            "AI service unavailable. Please check your API configuration."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Download functions using subjectName for file names and paths.
  const handleDownloadPYQ = () => {
    const pyqMap = {
      "Introduction to Computer Science": "/pyqs/Introduction_to_Computer_Science.pdf",
      "Advanced Calculus": "/pyqs/Advanced_Calculus.pdf",
      "General Physics": "/pyqs/General_Physics.pdf",
      // Add additional mappings as needed.
    };
    const key = subjectName || subjectCode;
    const fileName = pyqMap[key];
    if (fileName) {
      const link = document.createElement("a");
      link.href = fileName;
      link.download = `${key}_PYQ.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("PYQ not available for this subject");
    }
  };

  const handleDownloadNotes = () => {
    const notesMap = {
      "Introduction to Computer Science": "/notes/Introduction_to_Computer_Science.pdf",
      "Advanced Calculus": "/notes/Advanced_Calculus.pdf",
      "General Physics": "/notes/General_Physics.pdf",
      // Add additional mappings as needed.
    };
    const key = subjectName || subjectCode;
    const fileName = notesMap[key];
    if (fileName) {
      const link = document.createElement("a");
      link.href = fileName;
      link.download = `${key}_Notes.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("Notes not available for this subject");
    }
  };

  return (
    <div className="doubtbot-container">
      <div className="doubtbot-header">
        <h2>{(subjectName || subjectCode) + " Assistant"}</h2>
        <button
          className="doubtbot-home-btn"
          onClick={() => navigate("/student-dashboard")}
          title="Go Home"
        >
          Home
        </button>
        <div className={`doubtbot-status ${aiStatus}`}>
          {aiStatus === "ready" ? "Online" : "Offline"}
        </div>
      </div>

      <div className="doubtbot-search-bar">
        <input type="text" placeholder="Search conversation..." />
      </div>

      <div className="doubtbot-chat-history" ref={chatHistoryRef}>
        {chatHistory.map((msg, index) => (
          <div key={index} className={`doubtbot-message ${msg.type}`}>
            <div className="doubtbot-message-content">
              {msg.type === "bot" ? (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="doubtbot-loading-indicator">
            <div className="doubtbot-loader"></div>
            Generating response...
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="doubtbot-chat-input">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask your question..."
          disabled={isLoading || aiStatus !== "ready"}
          className="doubtbot-input-field"
        />
        <button
          type="submit"
          disabled={isLoading || aiStatus !== "ready"}
          title={aiStatus !== "ready" ? "AI service unavailable" : ""}
          className="doubtbot-submit-btn"
        >
          {isLoading ? "..." : "↑"}
        </button>
      </form>
      {aiStatus !== "ready" && (
        <div className="doubtbot-ai-warning">
          <h3>Setup Required</h3>
          <p>Please ensure that your Gemini API is properly configured.</p>
          <p>Refer to the Gemini API documentation for further details.</p>
        </div>
      )}
    </div>
  );
};

export default DoubtBot;
