import { Feather } from '@expo/vector-icons';
import {
    Alert,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useCart } from '../../contexts/CartContext';
import { productCatalog } from '../productData';
import { colors, typography } from '../themeTokens';
import { API_BASE } from '../../services/apiBase';
import { API } from '../../config/apiConfig';

export default function FavoritesScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { favorites, loading, removeFavorite } = useFavorites();
  const { addToCart, items: cartItems, adjustQuantity } = useCart();
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API.GET_PRODUCTS}?t=${Date.now()}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleRemoveFavorite = async (productId: number) => {
    try {
      await removeFavorite(productId);
      Alert.alert('Success', 'Removed from favorites');
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      Alert.alert('Error', 'Failed to remove from favorites');
    }
  };

  const handleProductPress = (favoriteProduct: any) => {
    // Try to find the full product from the catalog
    const fullProduct = productCatalog.find(p => p.id === String(favoriteProduct.id));
    
    if (fullProduct) {
      // Navigate with the full product details
      navigation.navigate('ProductDetail', { product: fullProduct });
    } else {
      // If not in catalog, create a basic product object with available data
      const basicProduct = {
        id: String(favoriteProduct.id),
        name: favoriteProduct.name,
        subtitle: favoriteProduct.variety || '',
        price: `$${favoriteProduct.price.toFixed(2)}`,
        priceValue: favoriteProduct.price,
        unit: favoriteProduct.weight || 'Unit',
        cardImage: favoriteProduct.cardImage,
        heroImages: [favoriteProduct.cardImage],
        description: `Premium quality ${favoriteProduct.name}`,
        detailItems: [
          { label: 'Product', value: favoriteProduct.name },
          ...(favoriteProduct.variety ? [{ label: 'Variety', value: favoriteProduct.variety }] : []),
          ...(favoriteProduct.weight ? [{ label: 'Weight', value: favoriteProduct.weight }] : []),
        ],
        tasteNotes: [],
        rating: favoriteProduct.rating || 0,
        reviewCount: 0,
        reviews: [],
        varietyCategory: favoriteProduct.variety || 'Other',
        weightCategory: favoriteProduct.weight || 'Other',
        isOrganic: false,
      };
      navigation.navigate('ProductDetail', { product: basicProduct });
    }
  };

  const renderFavoriteItem = ({ item }: { item: any }) => {
    // Skip items with null products
    if (!item.product) {
      return null;
    }
    
    // Use API image path instead of placeholder URLs
    const imageUrl = `${API_BASE}/images/products/${item.product.id}/product-${item.product.id}-main.jpg`;
    
    console.log('Favorite item:', item.product.name, 'Image URL:', imageUrl);
    
    const getCartQuantity = (productId: string): number => {
      const cartItem = cartItems.find(cartItem => cartItem.id === productId);
      return cartItem ? cartItem.quantity : 0;
    };

    const handleAddToCart = () => {
      const productForCart = productCatalog.find(p => p.id === String(item.product.id)) || {
        id: String(item.product.id),
        name: item.product.name,
        price: `$${item.product.price.toFixed(2)}`,
        priceValue: item.product.price,
        unit: 'kg',
        cardImage: imageUrl,
        heroImages: [imageUrl],
        description: `Premium quality ${item.product.name}`,
        detailItems: [],
        tasteNotes: [],
        rating: item.product.rating || 0,
        reviewCount: 0,
        reviews: [],
        varietyCategory: item.product.variety || 'Other',
        weightCategory: '1kg',
        isOrganic: false,
        subtitle: item.product.variety || ''
      };
      addToCart(productForCart, 1);
    };

    const handleIncreaseQuantity = () => {
      const currentQty = getCartQuantity(String(item.product.id));
      if (currentQty === 0) {
        handleAddToCart();
      } else {
        adjustQuantity(String(item.product.id), 1);
      }
    };

    const handleDecreaseQuantity = () => {
      adjustQuantity(String(item.product.id), -1);
    };
    
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleProductPress(item.product)}
      >
        <Image 
          source={
            imageErrors[item.product.id] || !imageUrl 
              ? require('../../assets/ImageNotFound.jpg')
              : { uri: imageUrl }
          }
          style={styles.image}
          resizeMode="cover"
          onError={() => {
            console.log('Favorite image load error:', item.product.name, imageUrl);
            setImageErrors(prev => ({ ...prev, [item.product.id]: true }));
          }}
        />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {item.product.name}
        </Text>
        {item.product.variety && (
          <Text style={styles.variety}>{item.product.variety}</Text>
        )}
        {item.product.weight && (
          <Text style={styles.weight}>{item.product.weight}</Text>
        )}
        {item.product.rating && (
          <View style={styles.ratingContainer}>
            <Feather name="star" size={14} color="#FFB800" />
            <Text style={styles.rating}>{item.product.rating.toFixed(1)}</Text>
          </View>
        )}
        <Text style={styles.price}>${item.product.price.toFixed(2)}</Text>
        {(() => {
          const currentProduct = products.find(p => p.id === item.product.id);
          const stock = currentProduct?.stock ?? 1;
          return stock === 0 ? (
            <View style={[styles.moveToCartButton, styles.outOfStockButton]}>
              <Text style={[styles.moveToCartText, styles.outOfStockText]}>Out of Stock</Text>
            </View>
          ) : (
          <TouchableOpacity
            style={styles.moveToCartButton}
            onPress={() => {
              handleAddToCart();
              handleRemoveFavorite(item.productId);
            }}
          >
            <Feather name="shopping-cart" size={16} color="#fff" />
            <Text style={styles.moveToCartText}>Move to Cart</Text>
          </TouchableOpacity>
          );
        })()}
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => {
          Alert.alert(
            'Remove Favorite',
            'Are you sure you want to remove this item from favorites?',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Remove', 
                onPress: () => handleRemoveFavorite(item.productId), 
                style: 'destructive' 
              },
            ]
          );
        }}
      >
        <Feather name="heart" size={24} color="#FF6B6B" fill="#FF6B6B" />
      </TouchableOpacity>
    </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <Text>Loading favorites...</Text>
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={[styles.emptyContainer, { paddingTop: insets.top }]}>
        <Feather name="heart" size={80} color="#ccc" />
        <Text style={styles.emptyTitle}>No Favorites Yet</Text>
        <Text style={styles.emptyText}>
          Start adding items to your favorites by tapping the heart icon on products
        </Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.browseButtonText}>Browse Products</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.list, 
          { paddingTop: 20, paddingBottom: insets.bottom + 24 }
        ]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  browseButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  variety: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  weight: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  removeButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moveToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 6,
    gap: 4,
    alignSelf: 'flex-start',
  },
  moveToCartText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  outOfStockButton: {
    backgroundColor: '#ccc',
  },
  outOfStockText: {
    color: '#666',
  },
});
