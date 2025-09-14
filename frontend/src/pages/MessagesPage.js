import React, { useState, useEffect } from 'react';
import { getMessages, createMessage } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import './ListPages.css';

const MessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ receiver: '', message: '' });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMessages();
      setMessages(data);
    } catch (err) {
      setError('Failed to fetch messages. ' + (err.response?.data?.detail || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await createMessage({ receiver: formData.receiver, message: formData.message });
      setFormData({ receiver: '', message: '' });
      fetchMessages();
    } catch (err) {
      setError('Failed to send message. ' + (err.response?.data?.detail || ''));
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="list-page-container">
      <h1>Messages</h1>
      <form onSubmit={handleCreate} className="create-form">
        <h2>Send New Message</h2>
        <div className="form-group">
          <label htmlFor="receiver">Receiver User ID</label>
          <input
            type="number"
            id="receiver"
            name="receiver"
            value={formData.receiver}
            onChange={(e) => setFormData({ ...formData, receiver: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
          />
        </div>
        <button type="submit">Send</button>
      </form>

      <div className="list-container">
        {messages.length > 0 ? (
          messages.map(msg => (
            <div key={msg.id} className="list-item">
              <h3>Message ID: {msg.id}</h3>
              <p><strong>From:</strong> {msg.sender}</p>
              <p><strong>To:</strong> {msg.receiver}</p>
              <p><strong>Content:</strong> {msg.message}</p>
              <p><strong>Sent At:</strong> {new Date(msg.sent_at).toLocaleString()}</p>
            </div>
          ))
        ) : (
          <p>No messages found.</p>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;