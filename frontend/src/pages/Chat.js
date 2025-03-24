import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Componets/CSS/MessagePage.css';

const MessagePage = () => {
  const location = useLocation();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [roomId, setRoomId] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    if (location.state && location.state.roomId) {
      setRoomId(location.state.roomId);
    }
  }, [location]);

  useEffect(() => {
    if (roomId) {
      fetchChatHistory();
    }
  }, [roomId]);

  const fetchChatHistory = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      setError('Authentication token is missing.');
      return;
    }
    try {
      const response = await axios.get(`http://localhost:8070/room/chatHistory?roomId=${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChatHistory(response.data.length > 0 ? response.data[0].chatHistory || [] : []);
    } catch (err) {
      console.error("Error fetching chat history:", err);
      setError("An error occurred while fetching chat history.");
    }
  };

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const sendMessage = async () => {
    if (!roomId || !message) {
      setError("Room ID and message are required.");
      return;
    }

    const token = sessionStorage.getItem('token');
    if (!token) {
      setError('Authentication token is missing.');
      return;
    }

    try {
      await axios.post('http://localhost:8070/room/sendmessage', { roomId, message }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMessage("Message sent successfully!");
      setError('');
      setMessage('');
      fetchChatHistory();
    } catch (err) {
      setError("An error occurred while sending the message.");
      setSuccessMessage('');
    }
  };

  return (
    <div className="container-fluid message-page h-100">
      <div className="row h-100">
        <div className="col-12 col-md-10 col-lg-8 mx-auto d-flex flex-column h-100">
          {/* Header */}
          <div className="message-header p-3 shadow-sm">
            <h4 className="mb-0">Chat Room {roomId}</h4>
          </div>

          {/* Alerts */}
          {error && <div className="alert alert-danger mt-3">{error}</div>}
          {successMessage && <div className="alert alert-success mt-3">{successMessage}</div>}

          {/* Chat History */}
          <div className="chat-container flex-grow-1 p-3">
            {chatHistory.length > 0 ? (
              chatHistory.map((msg, index) => (
                <div key={index} className="message-bubble mb-3">
                  <div className="message-content p-3">
                    <p className="mb-1">{msg.message}</p>
                    <small className="text-muted">
                      {new Date(msg.createdAt).toLocaleString()}
                    </small>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted py-5">
                <p>No messages yet. Start the conversation!</p>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="message-input p-3 border-top">
            <div className="input-group">
              <textarea
                className="form-control"
                rows="2"
                value={message}
                onChange={handleMessageChange}
                placeholder="Type your message..."
              />
              <button 
                className="btn btn-primary ms-2" 
                onClick={sendMessage}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagePage; 