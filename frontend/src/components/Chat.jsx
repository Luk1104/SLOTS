import { useState, useEffect, useRef } from 'react';
import './styles/Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [matchHeight, setMatchHeight] = useState(null); // match prize table height

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  // Sync chat height to prize table (desktop widths)
  useEffect(() => {
    let ro;
    const update = () => {
      if (window.innerWidth <= 680) {
        setMatchHeight(null);
        return;
      }
      const prize = document.querySelector('.prize-table');
      if (prize) {
        const h = Math.ceil(prize.getBoundingClientRect().height);
        setMatchHeight(h);
      }
    };
    update();

    const prize = document.querySelector('.prize-table');
    if (prize && 'ResizeObserver' in window) {
      ro = new ResizeObserver(update);
      ro.observe(prize);
    }
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      if (ro) ro.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/read');
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to send messages');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/write', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: newMessage.trim() })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setNewMessage('');
      } else if (response.status === 402) {
        alert('Token expired, please refresh the site to login.');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div
      className="chat-container"
      style={{ height: matchHeight ? `${matchHeight}px` : undefined }}
    >
      <div className="chat-header">
        <h3>Live Chat</h3>
      </div>
      
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">No messages yet. Be the first to chat!</div>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={index} 
              className={`message ${msg.isWin ? 'win-message' : ''} ${msg.email === 'system' ? 'system-message' : ''}`}
            >
              <div className="message-header">
                <span className="message-sender">
                  {msg.isWin ? '🎉 ' : ''}
                  {msg.email === 'system' ? 'System' : msg.email}
                </span>
                <span className="message-time">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              <div className="message-content">{msg.message}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="message-input-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="message-input"
          maxLength={200}
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={isLoading || !newMessage.trim()}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default Chat;
