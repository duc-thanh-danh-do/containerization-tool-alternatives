import api from '../utils/api';

// Create a new review
export const createReview = async (productId, rating, reviewText) => {
  const response = await api.post('/reviews', {
    productId,
    rating,
    reviewText
  });
  return response.data;
};

// Get all reviews for a product
export const getReviewsByProduct = async (productId) => {
  const response = await api.get(`/reviews/product/${productId}`);
  return response.data;
};

// Get average rating for a product
export const getAverageRating = async (productId) => {
  const response = await api.get(`/reviews/product/${productId}/average`);
  return response.data;
};

// Get all reviews by current user
export const getUserReviews = async () => {
  const response = await api.get('/reviews/user');
  return response.data;
};

// Update a review
export const updateReview = async (reviewId, rating, reviewText) => {
  const response = await api.put(`/reviews/${reviewId}`, {
    rating,
    reviewText
  });
  return response.data;
};

// Delete a review
export const deleteReview = async (reviewId) => {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data;
};

// Check if user can review a product
export const checkReviewEligibility = async (productId) => {
  const response = await api.get(`/reviews/product/${productId}/eligibility`);
  return response.data;
};
