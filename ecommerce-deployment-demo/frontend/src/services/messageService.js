import api from "../utils/api";

/**
 * Send a message to another user
 * @param {Object} messageData - Message data including receiverId, content, and optional orderId
 * @returns {Promise} Response with created message
 */
export const sendMessage = async (messageData) => {
  try {
    const response = await api.post("/api/messages", messageData);
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

/**
 * Get all conversations for the authenticated user
 * @returns {Promise} Response with list of conversations
 */
export const getConversations = async () => {
  try {
    const response = await api.get("/api/messages/conversations");
    return response.data;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
};

/**
 * Get messages for a specific conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Promise} Response with conversation and messages
 */
export const getConversationMessages = async (conversationId) => {
  try {
    const response = await api.get(`/api/messages/conversations/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching conversation messages:", error);
    throw error;
  }
};

/**
 * Get unread message count for the authenticated user
 * @returns {Promise} Response with unread count
 */
export const getUnreadCount = async () => {
  try {
    const response = await api.get("/api/messages/unread-count");
    return response.data;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    throw error;
  }
};

/**
 * Get seller info by store ID
 * @param {string} storeId - Store ID
 * @returns {Promise} Response with seller info (sellerId, sellerName, storeName)
 */
export const getSellerByStoreId = async (storeId) => {
  try {
    const response = await api.get(`/api/messages/store/${storeId}/seller`);
    return response.data;
  } catch (error) {
    console.error("Error fetching seller info:", error);
    throw error;
  }
};
