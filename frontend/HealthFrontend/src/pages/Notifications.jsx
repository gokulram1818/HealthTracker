import React, { useState, useEffect } from 'react';
import api from '../api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('notifications/');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch notification list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`notifications/${id}/`, { is_read: true });
      setNotifications(prev => 
        prev.map(notif => notif.id === id ? { ...notif, is_read: true } : notif)
      );
    } catch (err) {
      console.error(err);
      setError("Failed to update notification.");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => api.patch(`notifications/${n.id}/`, { is_read: true })));
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
      setError("Failed to update all notifications.");
    }
  };

  return (
    <div className="container py-5 animated-fade flex-grow-1 text-start">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold mb-1">Alerts & Reminders</h1>
          <p className="text-secondary mb-0">Track upcoming dates and clinics flagged by the community reminder engine.</p>
        </div>
        {notifications.filter(n => !n.is_read).length > 0 && (
          <button onClick={handleMarkAllRead} className="btn btn-sm btn-outline-secondary">
            Mark All as Read
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-danger alert-premium mb-4" role="alert">
          <i className="bi bi-exclamation-circle-fill me-2"></i>{error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading alerts...</span>
          </div>
        </div>
      ) : notifications.length > 0 ? (
        <div className="d-flex flex-column gap-3">
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`card p-3 border-0 shadow-sm transition-smooth ${notif.is_read ? 'bg-body bg-opacity-70 opacity-75' : 'bg-white border-start border-warning border-3'}`}
              style={{ borderLeft: !notif.is_read ? '4px solid var(--warning) !important' : 'none' }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-start gap-3">
                  <div className={`p-2 rounded-circle ${notif.is_read ? 'bg-light text-muted' : 'bg-warning bg-opacity-15 text-warning'}`}>
                    <i className={`bi ${notif.is_read ? 'bi-envelope-open' : 'bi-bell-fill'}`}></i>
                  </div>
                  <div>
                    <p className={`mb-1 ${!notif.is_read ? 'fw-semibold text-dark' : 'text-secondary'}`}>
                      {notif.message}
                    </p>
                    <small className="text-muted text-xs">
                      {new Date(notif.created_at).toLocaleString()}
                    </small>
                  </div>
                </div>

                {!notif.is_read && (
                  <button 
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="btn btn-sm btn-light border"
                    title="Mark as read"
                  >
                    <i className="bi bi-check"></i> Mark Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card border-0 p-5 shadow-sm text-center">
          <i className="bi bi-envelope-open text-muted display-4 mb-3"></i>
          <h3 className="h5 fw-bold">All Caught Up!</h3>
          <p className="text-secondary mb-0">You have no new alerts or due dates at this time.</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
