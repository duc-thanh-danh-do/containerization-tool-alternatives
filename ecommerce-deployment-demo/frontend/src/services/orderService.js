import api from "../utils/api";

/**
 * Create a new order
 * @param {Object} orderData - Order data including items, shipping address, payment method
 * @returns {Promise} Response with created order
 */
export const createOrder = async (orderData) => {
  try {
    const response = await api.post("/api/orders", orderData);
    return response;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

/**
 * Get all orders for the authenticated user
 * @returns {Promise} Response with list of orders
 */
export const getOrders = async () => {
  try {
    const response = await api.get("/api/orders/user");
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

/**
 * Get a specific order by ID
 * @param {string} orderId - Order ID
 * @returns {Promise} Response with order details
 */
export const getOrderById = async (orderId) => {
  try {
    if (!orderId) {
      throw new Error("Order ID is required");
    }

    const response = await api.get(`/api/orders/${orderId}`);
    return response;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
};

/**
 * Get all orders for the authenticated seller
 * @returns {Promise} Response with list of seller's orders
 */
export const getSellerOrders = async () => {
  try {
    const response = await api.get("/api/orders/seller");
    return response.data;
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    throw error;
  }
};

/**
 * Update order status (seller only)
 * @param {string} orderId - Order ID
 * @param {string} status - New order status
 * @returns {Promise} Response with updated order
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await api.put(`/api/orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

/**
 * Cancel an order (customer only)
 * @param {string} orderId - Order ID
 * @returns {Promise} Response with cancelled order
 */
export const cancelOrder = async (orderId) => {
  try {
    const response = await api.put(`/api/orders/${orderId}/cancel`);
    return response.data;
  } catch (error) {
    console.error("Error cancelling order:", error);
    throw error;
  }
};
