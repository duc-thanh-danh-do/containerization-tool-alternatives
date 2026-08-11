import React, { useState } from "react";
import { Dropdown, Badge, ListGroup, Button, Spinner } from "react-bootstrap";
import { FaCheck, FaTrash, FaCheckDouble } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../contexts/NotificationContext";

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  } = useNotifications();
  const [show, setShow] = useState(false);

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "ORDER_PLACED":
      case "NEW_ORDER":
        return "🛒";
      case "ORDER_CONFIRMED":
        return "✅";
      case "ORDER_PROCESSING":
        return "⚙️";
      case "ORDER_SHIPPED":
        return "🚚";
      case "ORDER_DELIVERED":
        return "📦";
      case "ORDER_CANCELLED":
        return "❌";
      default:
        return "🔔";
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    
    if (notification.relatedOrderId) {
      // Check if it's a seller notification (NEW_ORDER type)
      if (notification.type === "NEW_ORDER") {
        navigate(`/seller/orders/${notification.relatedOrderId}`);
      } else {
        navigate(`/orders/${notification.relatedOrderId}`);
      }
    }
    setShow(false);
  };

  const handleToggle = (isOpen) => {
    setShow(isOpen);
    if (isOpen) {
      refreshNotifications();
    }
  };

  return (
    <Dropdown show={show} onToggle={handleToggle} align="end">
      <Dropdown.Toggle
        variant="link"
        id="notification-dropdown"
        className="nav-link d-flex align-items-center gap-2 text-light position-relative p-0 border-0"
        style={{ boxShadow: "none" }}
      >
        <i className="bi bi-bell fs-5"></i>
        {unreadCount > 0 && (
          <Badge
            bg="danger"
            pill
            className="position-absolute"
            style={{
              top: "-8px",
              right: "-8px",
              fontSize: "0.65rem",
              minWidth: "18px",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu
        style={{
          width: "350px",
          maxHeight: "450px",
          overflow: "hidden",
          padding: 0,
        }}
      >
        <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom bg-light">
          <strong>Notifications</strong>
          {unreadCount > 0 && (
            <Button
              variant="link"
              size="sm"
              className="p-0 text-decoration-none"
              onClick={(e) => {
                e.stopPropagation();
                markAllAsRead();
              }}
            >
              <FaCheckDouble className="me-1" />
              Mark all read
            </Button>
          )}
        </div>

        <div style={{ maxHeight: "350px", overflowY: "auto" }}>
          {loading && notifications.length === 0 ? (
            <div className="text-center py-4">
              <Spinner animation="border" size="sm" />
              <p className="mb-0 mt-2 text-muted">Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-4">
              <i className="bi bi-bell fs-1 text-muted d-block mb-2"></i>
              <p className="mb-0 text-muted">No notifications yet</p>
            </div>
          ) : (
            <ListGroup variant="flush">
              {notifications.slice(0, 10).map((notification) => (
                <ListGroup.Item
                  key={notification.id}
                  action
                  onClick={() => handleNotificationClick(notification)}
                  className={`d-flex align-items-start ${
                    !notification.isRead ? "bg-light" : ""
                  }`}
                  style={{ cursor: "pointer" }}
                >
                  <span className="me-2" style={{ fontSize: "1.2rem" }}>
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="grow">
                    <div className="d-flex justify-content-between">
                      <strong
                        className={`${!notification.isRead ? "text-primary" : ""}`}
                        style={{ fontSize: "0.9rem" }}
                      >
                        {notification.title}
                      </strong>
                      <small className="text-muted">
                        {formatTimeAgo(notification.createdAt)}
                      </small>
                    </div>
                    <p
                      className="mb-0 text-muted"
                      style={{ fontSize: "0.85rem" }}
                    >
                      {notification.message}
                    </p>
                  </div>
                  <div className="ms-2 d-flex flex-column">
                    {!notification.isRead && (
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 text-success"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        title="Mark as read"
                      >
                        <FaCheck size={12} />
                      </Button>
                    )}
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 text-danger mt-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      title="Delete"
                    >
                      <FaTrash size={12} />
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </div>

        {notifications.length > 10 && (
          <div className="text-center py-2 border-top">
            <Button
              variant="link"
              size="sm"
              onClick={() => {
                navigate("/notifications");
                setShow(false);
              }}
            >
              View all notifications
            </Button>
          </div>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationDropdown;
