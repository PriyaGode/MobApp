import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'MangoProductDetails'>;

const { width } = Dimensions.get('window');

const relatedProducts = [
  { id: 1, name: 'Kesar Mango', price: '$4.99', image: '🥭' },
  { id: 2, name: 'Mango Pulp', price: '$6.49', image: '🫙' },
  { id: 3, name: 'Mango Juice', price: '$3.99', image: '🧃' },
];

export default function MangoProductDetailsScreen({ navigation, route }: Props) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const productId = route.params?.productId || 1;

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIcon}>
            <Feather name="heart" size={22} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Feather name="share-2" size={22} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image Carousel */}
        <View style={styles.imageCarousel}>
          <View style={styles.imagePlaceholder}>
            <Text style={styles.productEmoji}>🥭</Text>
          </View>
          <View style={styles.carouselDots}>
            {[0, 1, 2].map((index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentImageIndex === index && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productTitle}>Fresh Alphonso Mango</Text>
          <Text style={styles.productSubtitle}>Sweet, Fiberless & Juicy</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.price}>$3.49</Text>
            <Text style={styles.priceUnit}> / lb</Text>
            <View style={styles.stockBadge}>
              <Text style={styles.stockText}>In Stock</Text>
            </View>
          </View>

          <View style={styles.ratingRow}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Feather
                  key={star}
                  name="star"
                  size={16}
                  color="#FFC300"
                  fill={star <= 4 ? '#FFC300' : 'transparent'}
                />
              ))}
            </View>
            <Text style={styles.reviewCount}>(248 reviews)</Text>
          </View>
        </View>

        {/* Accordion Sections */}
        <View style={styles.accordionContainer}>
          {/* Product Description */}
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => toggleSection('description')}
          >
            <Text style={styles.accordionTitle}>Product Description</Text>
            <Feather
              name={expandedSection === 'description' ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#333"
            />
          </TouchableOpacity>
          {expandedSection === 'description' && (
            <View style={styles.accordionContent}>
              <Text style={styles.accordionText}>
                Premium Alphonso mangoes handpicked from the finest orchards. Known for their
                rich, sweet flavor and vibrant golden color. Each mango is carefully selected
                to ensure the highest quality and freshness.
              </Text>
            </View>
          )}

          {/* Nutritional Info */}
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => toggleSection('nutrition')}
          >
            <Text style={styles.accordionTitle}>Nutritional Info</Text>
            <Feather
              name={expandedSection === 'nutrition' ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#333"
            />
          </TouchableOpacity>
          {expandedSection === 'nutrition' && (
            <View style={styles.accordionContent}>
              <Text style={styles.accordionText}>
                Calories: 60 per 100g{'\n'}
                Vitamin C: 36.4mg{'\n'}
                Vitamin A: 54μg{'\n'}
                Fiber: 1.6g{'\n'}
                Sugar: 14g
              </Text>
            </View>
          )}

          {/* Customer Reviews */}
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => toggleSection('reviews')}
          >
            <Text style={styles.accordionTitle}>Customer Reviews</Text>
            <Feather
              name={expandedSection === 'reviews' ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#333"
            />
          </TouchableOpacity>
          {expandedSection === 'reviews' && (
            <View style={styles.accordionContent}>
              <Text style={styles.accordionText}>
                ⭐⭐⭐⭐⭐ "Best mangoes I've ever tasted!"{'\n'}
                - Sarah K.{'\n\n'}
                ⭐⭐⭐⭐ "Very fresh and sweet"{'\n'}
                - Mike R.
              </Text>
            </View>
          )}
        </View>

        {/* You Might Also Like */}
        <View style={styles.relatedSection}>
          <Text style={styles.relatedTitle}>You Might Also Like</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.relatedRow}>
              {relatedProducts.map((product) => (
                <TouchableOpacity key={product.id} style={styles.relatedCard}>
                  <View style={styles.relatedImageContainer}>
                    <Text style={styles.relatedEmoji}>{product.image}</Text>
                  </View>
                  <Text style={styles.relatedName}>{product.name}</Text>
                  <Text style={styles.relatedPrice}>{product.price}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Add to Cart Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.addToCartButton}>
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF6',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerIcon: {
    padding: 4,
  },
  imageCarousel: {
    height: 320,
    backgroundColor: '#FFF4C2',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  productEmoji: {
    fontSize: 120,
  },
  carouselDots: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 16,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    opacity: 0.5,
  },
  dotActive: {
    opacity: 1,
    backgroundColor: '#FFC300',
  },
  productInfo: {
    padding: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  productTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  priceUnit: {
    fontSize: 16,
    color: '#666',
    marginRight: 12,
  },
  stockBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
  },
  accordionContainer: {
    paddingHorizontal: 32,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  accordionContent: {
    paddingVertical: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  accordionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  relatedSection: {
    paddingTop: 32,
  },
  relatedTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  relatedRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
  },
  relatedCard: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  relatedImageContainer: {
    height: 100,
    backgroundColor: '#FFF4C2',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  relatedEmoji: {
    fontSize: 48,
  },
  relatedName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  relatedPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: '#FFFDF6',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  addToCartButton: {
    backgroundColor: '#FFC300',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});
