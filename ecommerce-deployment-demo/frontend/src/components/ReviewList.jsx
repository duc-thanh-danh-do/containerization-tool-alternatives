import { useState, useEffect } from 'react';
import { getReviewsByProduct, getAverageRating, deleteReview, updateReview } from '../api/reviews';
import { Star, Trash2, User, MessageSquare, AlertCircle, Pencil, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReviewList({ productId, refreshTrigger }) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  
  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editHoverRating, setEditHoverRating] = useState(0);
  const [editText, setEditText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const currentUserId = localStorage.getItem('userId');
  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  const fetchReviews = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [reviewsData, ratingData] = await Promise.all([
        getReviewsByProduct(productId),
        getAverageRating(productId)
      ]);
      setReviews(reviewsData);
      setAverageRating(ratingData);
    } catch {
      setError('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId, refreshTrigger]);

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }
    setDeletingId(reviewId);
    try {
      await deleteReview(reviewId);
      fetchReviews();
    } catch {
      setError('Failed to delete review');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStartEdit = (review) => {
    setEditingId(review.id);
    setEditRating(review.rating);
    setEditText(review.reviewText);
    setEditHoverRating(0);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditRating(0);
    setEditText('');
    setEditHoverRating(0);
  };

  const handleSaveEdit = async () => {
    if (editRating === 0 || !editText.trim()) {
      setError('Please provide both rating and review text');
      return;
    }
    
    setIsUpdating(true);
    try {
      await updateReview(editingId, editRating, editText);
      setEditingId(null);
      setEditRating(0);
      setEditText('');
      fetchReviews();
    } catch {
      setError('Failed to update review');
    } finally {
      setIsUpdating(false);
    }
  };

  const renderStars = (rating, size = 'sm') => {
    const sizeClass = size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating
                ? 'fill-amber-400 text-amber-400'
                : 'fill-transparent text-zinc-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating - 1]++;
      }
    });
    return distribution;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-transparent" />
      </div>
    );
  }

  const distribution = getRatingDistribution();
  const maxCount = Math.max(...distribution, 1);

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Rating Summary */}
      {averageRating && averageRating.totalReviews > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Average Rating */}
            <div className="text-center sm:text-left">
              <div className="text-5xl font-bold text-foreground">
                {averageRating.averageRating.toFixed(1)}
              </div>
              <div className="mt-2">
                {renderStars(Math.round(averageRating.averageRating), 'lg')}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Based on {averageRating.totalReviews} {averageRating.totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center gap-2">
                  <span className="w-3 text-xs text-muted-foreground">{stars}</span>
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div 
                      className="h-full bg-amber-400 rounded-full transition-all"
                      style={{ width: `${(distribution[stars - 1] / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-xs text-muted-foreground text-right">
                    {distribution[stars - 1]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="rounded-xl border border-border bg-muted/30 p-12 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-1">No Reviews Yet</h3>
          <p className="text-sm text-muted-foreground">
            Be the first to share your experience with this product!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div 
              key={review.id} 
              className={`rounded-xl border bg-card p-5 transition-colors ${
                editingId === review.id ? 'border-primary' : 'border-border hover:bg-card/80'
              }`}
            >
              {editingId === review.id ? (
                /* Edit Mode */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">Edit Your Review</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Edit Rating */}
                  <div>
                    <label className="block text-xs text-muted-foreground mb-2">Rating</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setEditRating(star)}
                          onMouseEnter={() => setEditHoverRating(star)}
                          onMouseLeave={() => setEditHoverRating(0)}
                          className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
                        >
                          <Star
                            className={`h-6 w-6 transition-colors ${
                              star <= (editHoverRating || editRating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-transparent text-zinc-600'
                            }`}
                          />
                        </button>
                      ))}
                      {(editHoverRating || editRating) > 0 && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {ratingLabels[editHoverRating || editRating]}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Edit Text */}
                  <div>
                    <label className="block text-xs text-muted-foreground mb-2">Review</label>
                    <textarea
                      rows={3}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors resize-none"
                    />
                  </div>
                  
                  {/* Edit Actions */}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={isUpdating || editRating === 0 || !editText.trim()}
                    >
                      {isUpdating ? (
                        <>
                          <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-3 w-3" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {review.userName?.charAt(0).toUpperCase() || <User className="h-5 w-5" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground">
                          {review.userName || 'Anonymous'}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </span>
                        {currentUserId === review.userId && (
                          <span className="text-xs text-primary font-medium">(Your review)</span>
                        )}
                      </div>
                      
                      {/* Rating */}
                      <div className="mb-3">
                        {renderStars(review.rating)}
                      </div>
                      
                      {/* Review Text */}
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {review.reviewText}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {currentUserId === review.userId && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => handleStartEdit(review)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                        onClick={() => handleDelete(review.id)}
                        disabled={deletingId === review.id}
                      >
                        {deletingId === review.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
