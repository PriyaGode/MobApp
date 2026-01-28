import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../App';
import { API } from '../../config/apiConfig';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerReviews'>;

const filterOptions = ['Most Recent', 'Highest Rating', 'Lowest Rating', 'With Photos'];

const staticReviews = [
  {
    id: 1,
    name: 'Cameron Williamson',
    initials: 'CW',
    rating: 5,
    time: '2 days ago',
    comment: 'Absolutely delicious! The mangoes arrived fresh and perfectly ripe. The sweetness is unmatched. Will definitely order again before the season ends.',
    bgColor: '#DBEAFE',
    textColor: '#2563EB',
    hasPhoto: false,
  },
  {
    id: 2,
    name: 'Esther Howard',
    initials: 'EH',
    rating: 4.5,
    time: '1 week ago',
    comment: 'Great packaging and timely delivery. The mangoes were mostly good, one was slightly overripe but still tasty. A solid 4.5 stars experience.',
    bgColor: '#FCE7F3',
    textColor: '#DB2777',
    hasPhoto: true,
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDeadKnuAHOtLzECJ3LKZ_xdkN4KwJOgSZ2nLz7zi-m0LuqJYvtyAhhuCNTkMRbZAe-IHjLNapMPQCGISB-rLqZIw1iVWPqfmPfVHZzUPJWbNNaUITxXxvFkkEw9IoS6PeupqS4ZBU85_vJxE7nMtpxgMg04iLnD4P5fcpBZ327Nl8q-E2X0i2Wty8scvcP5uUFXWJvaIHdshDkMMrp0t4Ou-yhZ5k19bnIYhNsoo6fJqn0sVq0NDjHbrX131nP-nGdCCKdXsml9XnZ',
  },
  {
    id: 3,
    name: 'Jenny Wilson',
    initials: 'JW',
    rating: 5,
    time: '2 weeks ago',
    comment: 'Simply the best. Worth every penny. My kids love them!',
    bgColor: '#F3E8FF',
    textColor: '#7C3AED',
    hasPhoto: false,
  },
  {
    id: 4,
    name: 'Robert Fox',
    initials: 'RF',
    rating: 3,
    time: '1 month ago',
    comment: 'Good quality but the price is a bit steep compared to the local market.',
    bgColor: '#FED7AA',
    textColor: '#EA580C',
    hasPhoto: false,
  },
  {
    id: 5,
    name: 'Kristin Watson',
    initials: 'KW',
    rating: 5,
    time: '2 months ago',
    comment: 'Fresh and juicy! Packaging was secure.',
    bgColor: '#CCFBF1',
    textColor: '#0D9488',
    hasPhoto: false,
  },
];

const ratingDistribution = [
  { stars: 5, percentage: 85 },
  { stars: 4, percentage: 10 },
  { stars: 3, percentage: 3 },
  { stars: 2, percentage: 1 },
  { stars: 1, percentage: 1 },
];

export default function CustomerReviewsScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { product } = route.params || {};
  const [selectedFilter, setSelectedFilter] = useState('Most Recent');
  const [dynamicReviews, setDynamicReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const allReviews = [...dynamicReviews, ...staticReviews];

  const getFilteredReviews = () => {
    let filtered = [...allReviews];
    
    switch (selectedFilter) {
      case 'Most Recent':
        return filtered.sort((a, b) => {
          const timeA = parseTimeToMinutes(a.time);
          const timeB = parseTimeToMinutes(b.time);
          return timeA - timeB;
        });
      case 'Highest Rating':
        return filtered.sort((a, b) => b.rating - a.rating);
      case 'Lowest Rating':
        return filtered.sort((a, b) => a.rating - b.rating);
      case 'With Photos':
        return filtered.filter(review => review.hasPhoto);
      default:
        return filtered;
    }
  };

  const parseTimeToMinutes = (timeStr: string) => {
    if (timeStr.includes('day')) {
      const days = parseInt(timeStr.match(/\d+/)?.[0] || '0');
      return days * 24 * 60;
    }
    if (timeStr.includes('week')) {
      const weeks = parseInt(timeStr.match(/\d+/)?.[0] || '0');
      return weeks * 7 * 24 * 60;
    }
    if (timeStr.includes('month')) {
      const months = parseInt(timeStr.match(/\d+/)?.[0] || '0');
      return months * 30 * 24 * 60;
    }
    return 0;
  };

  const filteredReviews = getFilteredReviews();

  useEffect(() => {
    if (product?.id) {
      fetchReviews();
    }
  }, [product?.id]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(API.GET_PRODUCT_REVIEWS(product.id));
      if (response.ok) {
        const data = await response.json();
        const formattedReviews = data.map((review: any, index: number) => ({
          id: `dynamic-${review.id || index}`,
          name: review.userName || 'Anonymous User',
          initials: (review.userName || 'AU').split(' ').map((n: string) => n[0]).join('').toUpperCase(),
          rating: review.rating,
          time: formatTime(review.createdAt),
          comment: review.comment,
          bgColor: getRandomColor(index),
          textColor: getRandomTextColor(index),
          hasPhoto: false,
        }));
        setDynamicReviews(formattedReviews);
      }
    } catch (error) {
      console.log('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} week${Math.ceil(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.ceil(diffDays / 30)} month${Math.ceil(diffDays / 30) > 1 ? 's' : ''} ago`;
  };

  const getRandomColor = (index: number) => {
    const colors = ['#DBEAFE', '#FCE7F3', '#F3E8FF', '#FED7AA', '#CCFBF1', '#FEF3C7', '#E0E7FF'];
    return colors[index % colors.length];
  };

  const getRandomTextColor = (index: number) => {
    const colors = ['#2563EB', '#DB2777', '#7C3AED', '#EA580C', '#0D9488', '#D97706', '#4F46E5'];
    return colors[index % colors.length];
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <MaterialIcons key={i} name="star" size={14} color="#F59E0B" />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <MaterialIcons key="half" name="star-half" size={14} color="#F59E0B" />
      );
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <MaterialIcons key={`empty-${i}`} name="star-border" size={14} color="#9CA3AF" />
      );
    }
    
    return stars;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customer Reviews</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Rating Summary */}
        <View style={styles.ratingSummary}>
          <View style={styles.overallRating}>
            <Text style={styles.ratingNumber}>4.8</Text>
            <View style={styles.overallStars}>
              <MaterialIcons name="star" size={20} color="#F59E0B" />
              <MaterialIcons name="star" size={20} color="#F59E0B" />
              <MaterialIcons name="star" size={20} color="#F59E0B" />
              <MaterialIcons name="star" size={20} color="#F59E0B" />
              <MaterialIcons name="star-half" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.reviewCountText}>{allReviews.length} reviews</Text>
          </View>
          
          <View style={styles.ratingBars}>
            {ratingDistribution.map((item) => (
              <View key={item.stars} style={styles.ratingBarRow}>
                <Text style={styles.starNumber}>{item.stars}</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[styles.progressFill, { width: `${item.percentage}%` }]} 
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Filter Buttons */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedFilter === filter && styles.filterButtonTextActive
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Reviews List */}
        <View style={styles.reviewsList}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#65A30D" />
              <Text style={styles.loadingText}>Loading reviews...</Text>
            </View>
          )}
          {filteredReviews.map((review, index) => (
            <View 
              key={review.id} 
              style={[
                styles.reviewCard,
                index < filteredReviews.length - 1 && styles.reviewCardBorder
              ]}
            >
              <View style={styles.reviewHeader}>
                <View style={styles.reviewUserInfo}>
                  <View style={[styles.avatar, { backgroundColor: review.bgColor }]}>
                    <Text style={[styles.avatarText, { color: review.textColor }]}>
                      {review.initials}
                    </Text>
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{review.name}</Text>
                    <View style={styles.starsContainer}>
                      {renderStars(review.rating)}
                    </View>
                  </View>
                </View>
                <Text style={styles.reviewTime}>{review.time}</Text>
              </View>
              
              <Text style={styles.reviewComment}>{review.comment}</Text>
              
              {review.hasPhoto && review.photoUrl && (
                <View style={styles.photoContainer}>
                  <Image 
                    source={{ uri: review.photoUrl }}
                    style={styles.reviewPhoto}
                    resizeMode="cover"
                  />
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginBottom: 32,
  },
  overallRating: {
    alignItems: 'center',
    minWidth: 100,
  },
  ratingNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1F2937',
    letterSpacing: -1,
  },
  overallStars: {
    flexDirection: 'row',
    gap: 2,
    marginVertical: 6,
  },
  reviewCountText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  ratingBars: {
    flex: 1,
    gap: 8,
  },
  ratingBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starNumber: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F2937',
    width: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
  filterContainer: {
    marginBottom: 24,
  },
  filterContent: {
    paddingHorizontal: 4,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  filterButtonActive: {
    backgroundColor: '#65A30D',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  reviewsList: {
    gap: 16,
  },
  reviewCard: {
    paddingBottom: 16,
  },
  reviewCardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  userDetails: {
    gap: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 1,
  },
  reviewTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  reviewComment: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  photoContainer: {
    marginTop: 12,
  },
  reviewPhoto: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
});