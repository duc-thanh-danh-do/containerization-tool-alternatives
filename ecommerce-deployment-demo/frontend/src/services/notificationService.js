import api from "../utils/api";

export const getNotifications = async () => {
  const response = await api.get("/api/notifications");
  return response;
};

export const getUnreadNotifications = async () => {
  const response = await api.get("/api/notifications/unread");
  return response;
};

export const getUnreadCount = async () => {
  const response = await api.get("/api/notifications/unread/count");
  return response;
};

export const markAsRead = async (notificationId) => {
  const response = await api.put(`/api/notifications/${notificationId}/read`, {});
  return response;
};

export const markAllAsRead = async () => {
  const response = await api.put("/api/notifications/read-all", {});
  return response;
};

export const deleteNotification = async (notificationId) => {
  const response = await api.delete(`/api/notifications/${notificationId}`);
  return response;
};
