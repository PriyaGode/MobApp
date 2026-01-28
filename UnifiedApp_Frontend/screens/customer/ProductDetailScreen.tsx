import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Share,
  Alert,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../App';
import { useCart } from '../../contexts/CartContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

const { width } = Dimensions.get('window');

const reviews = [
  {
    id: 1,
    name: 'Cameron Williamson',
    initials: 'CW',
    rating: 5,
    time: '2 days ago',
    comment: 'Absolutely delicious! The mangoes arrived fresh and perfectly ripe. The sweetness is unmatched. Will definitely order again before the season ends.',
    bgColor: '#DBEAFE',
    textColor: '#2563EB'
  },
  {
    id: 2,
    name: 'Esther Howard',
    initials: 'EH',
    rating: 4.5,
    time: '1 week ago',
    comment: 'Great packaging and timely delivery. The mangoes were mostly good, one was slightly overripe but still tasty. A solid 4.5 stars experience.',
    bgColor: '#FCE7F3',
    textColor: '#DB2777'
  }
];

export default function ProductDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { product } = route.params;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});
  const { addToCart } = useCart();

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  const handleAddToCart = () => {
    addToCart(product, quantity);
    navigation.navigate('Main', { screen: 'Cart' });
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out this amazing ${product.name}! ${product.description} - Only ${product.price}/${product.unit}\n\nDownload our app: https://yourapp.com/download`,
        title: product.name,
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share this product');
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <MaterialIcons key={i} name="star" size={16} color="#F59E0B" />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <MaterialIcons key="half" name="star-half" size={16} color="#F59E0B" />
      );
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <MaterialIcons key={`empty-${i}`} name="star-border" size={16} color="#F59E0B" />
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
          <Feather name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{product.name}</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
          <Feather name="share-2" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image Carousel */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.imageContainer}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(
              event.nativeEvent.contentOffset.x / width
            );
            setCurrentImageIndex(index);
          }}
        >
          {(product.heroImages && product.heroImages.length > 0 ? product.heroImages : [product.cardImage]).map((image, index) => (
            <Image 
              key={index}
              source={
                imageErrors[`${product.id}-${index}`] || !image 
                  ? require('../../assets/ImageNotFound.jpg')
                  : { uri: image }
              }
              style={[styles.productImage, { width }]}
              resizeMode="cover"
              onError={() => {
                setImageErrors(prev => ({ ...prev, [`${product.id}-${index}`]: true }));
              }}
            />
          ))}
        </ScrollView>
        <View style={styles.carouselDots}>
          {(product.heroImages && product.heroImages.length > 0 ? product.heroImages : [product.cardImage]).map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentImageIndex === index && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          {/* Badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>SEASONAL SPECIAL</Text>
          </View>
          
          <Text style={styles.productTitle}>{product.name}</Text>
          <Text style={styles.productLocation}>{product.subtitle}</Text>
          
          {/* Price and Rating Row */}
          <View style={styles.priceRatingRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{product.price}</Text>
              <Text style={styles.priceUnit}>/ {product.unit}</Text>
            </View>
            <View style={styles.ratingContainer}>
              <MaterialIcons name="star" size={20} color="#F59E0B" />
              <Text style={styles.ratingText}>{product.rating}</Text>
              <Text style={styles.reviewCount}>({product.reviewCount} reviews)</Text>
            </View>
          </View>

          {/* Quantity and Add to Cart */}
          <View style={styles.actionRow}>
            <View style={[styles.quantityContainer, product.stock === 0 && styles.quantityContainerDisabled]}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={product.stock === 0 ? undefined : decrementQuantity}
                disabled={product.stock === 0}
              >
                <Text style={[styles.quantityButtonText, product.stock === 0 && styles.quantityButtonTextDisabled]}>-</Text>
              </TouchableOpacity>
              <Text style={[styles.quantityText, product.stock === 0 && styles.quantityTextDisabled]}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={product.stock === 0 ? undefined : incrementQuantity}
                disabled={product.stock === 0}
              >
                <Text style={[styles.quantityButtonText, product.stock === 0 && styles.quantityButtonTextDisabled]}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={[styles.addToCartButton, product.stock === 0 && styles.addToCartButtonDisabled]} 
              onPress={product.stock === 0 ? undefined : handleAddToCart}
              disabled={product.stock === 0}
            >
              <Text style={[styles.addToCartText, product.stock === 0 && styles.addToCartTextDisabled]}>
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>
            {product.description}
          </Text>
        </View>

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsContainer}>
            {product.detailItems?.map((item, index) => (
              <View key={index} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{item.label}:</Text>
                <Text style={styles.detailValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Taste Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Taste Notes</Text>
          <View style={styles.tasteNotesContainer}>
            {product.tasteNotes?.map((note) => (
              <View key={note} style={styles.tasteNote}>
                <Text style={styles.tasteNoteText}>{note}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Customer Reviews */}
        <View style={[styles.section, styles.reviewsSection]}>
          <Text style={styles.sectionTitle}>Customer Reviews</Text>
          
          {reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
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
            </View>
          ))}
          
          <View style={styles.reviewButtonsContainer}>
            <TouchableOpacity 
              style={styles.writeReviewButton}
              onPress={() => navigation.navigate('WriteReview', { product })}
            >
              <Feather name="edit-3" size={16} color="#EA580C" />
              <Text style={styles.writeReviewText}>Write Review</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('CustomerReviews', { product })}
            >
              <Text style={styles.viewAllText}>View All Reviews</Text>
              <Feather name="arrow-right" size={16} color="#65A30D" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 20 }} />
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
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
  imageContainer: {
    height: 320,
    backgroundColor: '#F3F4F6',
  },
  productImage: {
    height: 320,
  },
  carouselDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: -40,
    marginBottom: 24,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
  },
  dotActive: {
    backgroundColor: '#65A30D',
  },
  productInfo: {
    padding: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FED7AA',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EA580C',
    letterSpacing: 0.5,
  },
  productTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  productLocation: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  priceRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#65A30D',
  },
  priceUnit: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  reviewCount: {
    fontSize: 14,
    color: '#6B7280',
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    width: 100,
    justifyContent: 'space-between',
  },
  quantityButton: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#65A30D',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#65A30D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityContainerDisabled: {
    opacity: 0.5,
  },
  quantityButtonTextDisabled: {
    color: '#9CA3AF',
  },
  quantityTextDisabled: {
    color: '#9CA3AF',
  },
  addToCartButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  addToCartTextDisabled: {
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  detailsContainer: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
  },
  detailLabel: {
    width: 112,
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  detailValue: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  tasteNotesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tasteNote: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tasteNoteText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  reviewsSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  reviewCard: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
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
    gap: 2,
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
  reviewButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  writeReviewButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  writeReviewText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EA580C',
  },
  viewAllButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#65A30D',
  },
});