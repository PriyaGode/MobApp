import { Feather, MaterialIcons } from "@expo/vector-icons";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useResponsiveLayout } from '../../hooks/useResponsive';
import { usePlatformResponsive } from '../../hooks/usePlatformResponsive';
import { ResponsiveContainer, ResponsiveGrid } from '../../components/ResponsiveWrapper';
import type { MainTabParamList, RootStackParamList } from "../../App";
import { API } from "../../config/apiConfig";
import { API_BASE } from "../../services/apiBase";
import { AuthContext, LoadingContext } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useFavorites } from "../../contexts/FavoritesContext";
import { productCatalog, type ProductInfo } from "../productData";
import { colors, typography } from "../themeTokens";
import { getProductImages, type ProductImage } from "../../services/productImageService";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Home">,
  NativeStackScreenProps<RootStackParamList>
>;

interface FilterParams {
  sort?: string;
  categories?: string[];
  brands?: string[];
  rating?: string;
  priceRange?: { min: number; max: number };
}

const getChipFilters = (weightSort: string, pricingSort: string, ratingSort: string) => [
  { id: "filters", label: "More Filters", icon: "sliders" as const },
  { 
    id: "weight", 
    label: weightSort === 'none' ? "Weight" : 
           weightSort === 'low' ? "Weight: Low → High" : "Weight: High → Low", 
    icon: "chevron-down" as const 
  },
  { 
    id: "pricing", 
    label: pricingSort === 'none' ? "Sort by Price" : 
           pricingSort === 'low' ? "Price: Low → High" : "Price: High → Low", 
    icon: "chevron-down" as const 
  },
  { 
    id: "rating", 
    label: ratingSort === 'none' ? "Rating" : 
           ratingSort === 'high' ? "Rating: High → Low" : "Rating: Low → High", 
    icon: "star" as const 
  },
] as const;

type ChipId = typeof chipFilters[number]["id"];
type PanelFocus = "all" | "variety" | "weight" | "organic" | "rating" | "pricing";

const weightChipOptions = ["All Weights", "Weight: Low to High", "Weight: High to Low"];
const pricingOptions = ["Default", "Price: Low to High", "Price: High to Low"];
const ratingChipOptions = ["All Ratings", "Rating: High to Low", "Rating: Low to High"];

const mangoProducts = productCatalog.filter(p => 
  p.varietyCategory !== "Pantry & Staples" && 
  p.varietyCategory !== "Beverages"
);

const uniqueVarieties = Array.from(
  new Set(mangoProducts.map((product) => product.varietyCategory)),
);
const uniqueWeights = Array.from(
  new Set(mangoProducts.map((product) => product.weightCategory)),
);

const mangoOrganicTypes = Array.from(
  new Set(mangoProducts.map((product) => product.isOrganic))
);
const organicOptions = ["All Products", ...(mangoOrganicTypes.includes(true) ? ["Organic Only"] : []), ...(mangoOrganicTypes.includes(false) ? ["Non-Organic Only"] : [])];

const varietyOptions = ["All Varieties", ...uniqueVarieties];
const weightOptions = ["All Weights", ...uniqueWeights];

const heroCard = {
  title: "Freshly Harvested",
  subtitle: "Straight from the farm to your table.",
  cta: "Shop Now",
  image: require('../../assets/images/Ban01.jpg'),
};

const chunkProducts = (items: ProductInfo[], columns: number) => {
  if (!items || !Array.isArray(items)) {
    return [];
  }
  const chunks: ProductInfo[][] = [];
  for (let i = 0; i < items.length; i += columns) {
    chunks.push(items.slice(i, i + columns));
  }
  return chunks;
};

export default function Home({ navigation, route }: Props) {
  const { setUserToken } = useContext(AuthContext);
  const { setLoading } = useContext(LoadingContext);
  const { addToCart, items: cartItems, adjustQuantity } = useCart();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const responsive = useResponsiveLayout();
  const platformResponsive = usePlatformResponsive();
  const [searchText, setSearchText] = useState('');
  const [varietyFilter, setVarietyFilter] = useState(varietyOptions[0]);
  const [weightFilter, setWeightFilter] = useState(weightOptions[0]);
  const [organicOnly, setOrganicOnly] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [panelFocus, setPanelFocus] = useState<PanelFocus>("all");
  const [showVarietyModal, setShowVarietyModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showOrganicModal, setShowOrganicModal] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [weightSort, setWeightSort] = useState<'none' | 'high' | 'low'>('none');
  const [pricingSort, setPricingSort] = useState<'none' | 'high' | 'low'>('none');
  const [ratingSort, setRatingSort] = useState<'none' | 'high' | 'low'>('none');
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});
  const [showHeaderSearch, setShowHeaderSearch] = useState(false);
  
  // Debug modal states
  useEffect(() => {
    console.log('Modal states:', { showVarietyModal, showWeightModal, showOrganicModal, showRatingModal });
  }, [showVarietyModal, showWeightModal, showOrganicModal, showRatingModal]);
  
  // Backend products state
  const [backendProducts, setBackendProducts] = useState<ProductInfo[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  
  // Additional filters from MangoFilterScreen
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedVarieties, setSelectedVarieties] = useState<string[]>([]);
  const [selectedWeights, setSelectedWeights] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState<string>('relevance');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 1000 });

  // Fetch products and images from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingProducts(true);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);
        
        // Fetch products and images in parallel
        const [productsResponse, images] = await Promise.all([
          fetch(API.GET_PRODUCTS, { signal: controller.signal }),
          getProductImages()
        ]);
        
        clearTimeout(timeoutId);
        
        if (!productsResponse.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await productsResponse.json();
        setProductImages(images);
        
        // Transform backend products with API images
        const transformedProducts: ProductInfo[] = data.map((product: any) => {
          const cardImage = product.primaryImageUrl 
            ? `${API_BASE}${product.primaryImageUrl}`
            : null;
          
          const heroImages = product.imageUrls?.map((url: string) => `${API_BASE}${url}`) || [];
          
          console.log('Product image URL:', cardImage);
          
          return {
            id: String(product.id),
            name: product.name,
            subtitle: product.origin || product.variety || 'Premium Quality',
            price: `$${product.price.toFixed(0)}`,
            priceValue: product.price,
            unit: 'lb',
            cardImage,
            heroImages,
            description: product.description || 'Fresh mangoes from the farm',
            detailItems: [
              { label: 'Variety', value: product.variety || 'Premium' },
              { label: 'Origin', value: product.origin || 'India' },
              { label: 'Available', value: `${product.availableKg || product.stock} kg` },
            ],
            tasteNotes: ['Sweet', 'Juicy', 'Fresh'],
            rating: product.averageRating || 4.5,
            reviewCount: product.reviewCount || 0,
            reviews: [],
            varietyCategory: product.variety || product.category || 'Premium',
            weightCategory: '1-2 kg',
            isOrganic: false,
            stock: product.stock || 0,
          };
        });
        
        setBackendProducts(transformedProducts);
        setProductsError(null);
      } catch (error) {
        setProductsError('Failed to load products. Using local data.');
        setBackendProducts(productCatalog);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchData();
  }, []);
  
  // Listen for search query and filters from route params
  useEffect(() => {
    if (route.params?.searchQuery !== undefined) {
      setSearchText(route.params.searchQuery);
    } else if (route.params !== undefined) {
      setSearchText('');
    }
    
    if (route.params?.filters) {
      const filters = route.params.filters;
      
      setSelectedCategories(filters.categories || []);
      setSelectedVarieties(filters.varieties || []);
      setSelectedWeights(filters.weights || []);
      setSelectedSort(filters.sort || 'relevance');
      if (filters.priceRange) {
        setPriceRange(filters.priceRange);
      }
      
      if (filters.rating && filters.rating !== '1★ & up') {
        const ratingValue = parseInt(filters.rating.charAt(0));
        setRatingFilter(ratingValue);
      } else {
        setRatingFilter(null);
      }
      
      // Reset chip filters when MangoFilter is applied
      setWeightSort('none');
      setPricingSort('none');
      setRatingSort('none');
      
      if ((filters.varieties && filters.varieties.length > 0) || 
          (filters.weights && filters.weights.length > 0) || 
          (filters.categories && filters.categories.length > 0) ||
          filters.rating) {
        setShowFilterPanel(false);
      }
    }
  }, [route.params]);









  const handleOpenCart = () => navigation.navigate("Cart");
  const handleOpenProfile = () => navigation.navigate("Profile");

  const handleHeroCta = () => {
    if (productCatalog[0]) {
      navigation.navigate("ProductDetail", { product: productCatalog[0] });
    }
  };

  const handleAddProductToCart = (product: ProductInfo) => {
    addToCart(product, 1);
    // Item added to cart - cart badge will update automatically
  };

  const getCartQuantity = (productId: string): number => {
    const cartItem = cartItems.find(item => item.id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleIncreaseQuantity = (product: ProductInfo) => {
    const currentQty = getCartQuantity(product.id);
    if (currentQty === 0) {
      addToCart(product, 1);
    } else {
      adjustQuantity(product.id, 1);
    }
  };

  const handleDecreaseQuantity = (productId: string) => {
    adjustQuantity(productId, -1);
  };

  const hasActiveFilters =
    varietyFilter !== varietyOptions[0] ||
    weightFilter !== weightOptions[0] ||
    organicOnly ||
    selectedVarieties.length > 0 ||
    selectedWeights.length > 0 ||
    selectedCategories.length > 0 ||
    selectedSort !== 'relevance' ||
    priceRange.min > 0 || priceRange.max < 1000;

  const resetFilters = useCallback(() => {
    setVarietyFilter(varietyOptions[0]);
    setWeightFilter(weightOptions[0]);
    setOrganicOnly(false);
    setSelectedVarieties([]);
    setSelectedWeights([]);
    setSelectedCategories([]);
    setSelectedSort('relevance');
    setPriceRange({ min: 0, max: 1000 });
    setWeightSort('none');
    setPricingSort('none');
    setRatingSort('none');
  }, []);

  const handleChipPress = useCallback(
    (chipId: ChipId) => {
      console.log('Chip pressed:', chipId);
      switch (chipId) {
        case "filters":
          navigation.navigate('MangoFilter', {
            currentFilters: {
              sort: selectedSort,
              categories: selectedCategories,
              varieties: selectedVarieties,
              weights: selectedWeights,
              rating: organicOnly ? '4★ & up' : '1★ & up',
              priceRange: priceRange,
            },
            searchQuery: searchText || undefined
          });
          break;
        case "weight":
          setWeightSort(prev => {
            if (prev === 'none') return 'low';
            if (prev === 'low') return 'high';
            return 'none';
          });
          setPricingSort('none');
          setRatingSort('none');
          break;
        case "pricing":
          setPricingSort(prev => {
            if (prev === 'none') return 'low';
            if (prev === 'low') return 'high';
            return 'none';
          });
          setWeightSort('none');
          setRatingSort('none');
          break;
        case "rating":
          setRatingSort(prev => {
            if (prev === 'none') return 'high';
            if (prev === 'high') return 'low';
            return 'none';
          });
          setWeightSort('none');
          setPricingSort('none');
          break;
        default:
          break;
      }
    },
    [navigation, selectedSort, selectedCategories, selectedVarieties, selectedWeights, organicOnly, priceRange, searchText],
  );

  const filteredProducts = useMemo(() => {
    // Use backend products or fallback to catalog
    const productsToDisplay = backendProducts.length > 0 ? backendProducts : productCatalog;
    
    let products = productsToDisplay.filter((product) => {
      // Search filter
      const matchesSearch = !searchText || 
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.varietyCategory.toLowerCase().includes(searchText.toLowerCase());
      
      // Variety filter - check both single filter and array from MangoFilter
      const matchesVariety = 
        (varietyFilter === varietyOptions[0] && selectedVarieties.length === 0) ||
        product.varietyCategory === varietyFilter ||
        (selectedVarieties.length > 0 && selectedVarieties.includes(product.varietyCategory));
      
      // Weight filter - check both single filter and array from MangoFilter
      const matchesWeight =
        (weightFilter === weightOptions[0] && selectedWeights.length === 0) ||
        product.weightCategory === weightFilter ||
        (selectedWeights.length > 0 && selectedWeights.includes(product.weightCategory));
      
      const matchesOrganic = !organicOnly || product.isOrganic;
      
      // Price range filter (use priceValue which is a number)
      const matchesPrice = product.priceValue >= priceRange.min && product.priceValue <= priceRange.max;
      
      // Rating filter
      const matchesRating = !ratingFilter || (product.rating >= ratingFilter);

      return matchesSearch && matchesVariety && matchesWeight && matchesOrganic && matchesPrice && matchesRating;
    });
    
    // Apply chip-based sorting
    if (pricingSort === 'high') {
      products = [...products].sort((a, b) => b.priceValue - a.priceValue);
    } else if (pricingSort === 'low') {
      products = [...products].sort((a, b) => a.priceValue - b.priceValue);
    } else if (ratingSort === 'high') {
      products = [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (ratingSort === 'low') {
      products = [...products].sort((a, b) => (a.rating || 0) - (b.rating || 0));
    } else if (weightSort === 'high') {
      products = [...products].sort((a, b) => b.priceValue - a.priceValue);
    } else if (weightSort === 'low') {
      products = [...products].sort((a, b) => a.priceValue - b.priceValue);
    }
    
    // Apply MangoFilter sorting (fallback)
    if (selectedSort === 'price-low') {
      products = [...products].sort((a, b) => a.priceValue - b.priceValue);
    } else if (selectedSort === 'price-high') {
      products = [...products].sort((a, b) => b.priceValue - a.priceValue);
    } else if (selectedSort === 'rating') {
      products = [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    
    return products;
  }, [searchText, organicOnly, varietyFilter, weightFilter, selectedVarieties, selectedWeights, priceRange, selectedSort, ratingFilter, backendProducts, pricingSort, ratingSort, weightSort]);

  const filterSummary = useMemo(() => {
    const parts: string[] = [];
    if (varietyFilter !== varietyOptions[0]) parts.push(varietyFilter);
    if (weightFilter !== weightOptions[0]) parts.push(weightFilter);
    if (selectedVarieties.length > 0) parts.push(`${selectedVarieties.length} varieties`);
    if (selectedWeights.length > 0) parts.push(`${selectedWeights.length} weights`);
    if (selectedCategories.length > 0) parts.push(`${selectedCategories.length} categories`);
    if (organicOnly) parts.push("Organic only");
    return parts.length ? parts.join(" · ") : "Showing all products";
  }, [organicOnly, varietyFilter, weightFilter, selectedVarieties, selectedWeights, selectedCategories]);

  const chunkedProducts = useMemo(() => chunkProducts(filteredProducts, platformResponsive.gridColumns), [filteredProducts, platformResponsive.gridColumns]);
  const hasMatches = filteredProducts.length > 0;
  const shouldHighlightGroup = (group: PanelFocus) =>
    panelFocus === "all" || panelFocus === group;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <Image
            source={{
              uri: "https://image.pollinations.ai/prompt/mango%20inspired%20geometric%20avatar%20icon",
            }}
            style={styles.avatar}
          />
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.headerActions}>
          {showHeaderSearch && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('MangoSearch')}
              accessibilityLabel="Search"
            >
              <Feather name="search" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleOpenProfile}
            accessibilityLabel="Open profile"
          >
            <Feather name="user" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content} 
      showsVerticalScrollIndicator={false}
      onScroll={(event) => {
        const scrollY = event.nativeEvent.contentOffset.y;
        setShowHeaderSearch(scrollY > 80);
      }}
      scrollEventThrottle={16}
    >

      {/* Loading indicator */}
      {loadingProducts && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading fresh mangoes...</Text>
        </View>
      )}

      {/* Error message */}
      {productsError && (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={20} color={colors.error} />
          <Text style={styles.errorText}>{productsError}</Text>
        </View>
      )}

      <TouchableOpacity 
        style={styles.searchBar}
        onPress={() => navigation.navigate('MangoSearch')}
        activeOpacity={0.7}
      >
        <Feather name="search" size={18} color={colors.textSecondary} />
        {searchText ? (
          <View style={styles.searchActiveContent}>
            <Text style={styles.searchActiveText}>"{searchText}"</Text>
            <TouchableOpacity 
              onPress={(e) => {
                e.stopPropagation();
                setSearchText('');
              }}
              style={styles.clearSearchButton}
            >
              <Feather name="x" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.searchPlaceholder}>Search for Kesar, Alphonso...</Text>
        )}
      </TouchableOpacity>



      {showFilterPanel && (
        <View style={styles.filterPanel}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterHeading}>Quick filters</Text>
            {hasActiveFilters ? (
              <TouchableOpacity onPress={resetFilters} accessibilityRole="button">
                <Text style={styles.resetLabel}>Reset</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View
            style={[
              styles.filterGroup,
              shouldHighlightGroup("variety") && styles.filterGroupHighlighted,
            ]}
          >
            <Text style={styles.filterLabel}>Variety</Text>
            <View style={styles.pillRow}>
              {varietyOptions.map((option) => {
                const selected = option === varietyFilter;
                return (
                  <TouchableOpacity
                    key={option}
                    onPress={() => setVarietyFilter(option)}
                    style={[styles.pill, selected && styles.pillActive]}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.pillLabel, selected && styles.pillLabelActive]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View
            style={[
              styles.filterGroup,
              shouldHighlightGroup("weight") && styles.filterGroupHighlighted,
            ]}
          >
            <Text style={styles.filterLabel}>Preferred weight</Text>
            <View style={styles.pillRow}>
              {weightOptions.map((option) => {
                const selected = option === weightFilter;
                return (
                  <TouchableOpacity
                    key={option}
                    onPress={() => setWeightFilter(option)}
                    style={[styles.pill, selected && styles.pillActive]}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.pillLabel, selected && styles.pillLabelActive]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View
            style={[
              styles.filterGroup,
              shouldHighlightGroup("organic") && styles.filterGroupHighlighted,
            ]}
          >
            <Text style={styles.filterLabel}>Farming method</Text>
            <TouchableOpacity
              style={[
                styles.organicToggle,
                organicOnly && styles.organicToggleActive,
              ]}
              onPress={() => setOrganicOnly((prev) => !prev)}
              accessibilityRole="button"
            >
              <Feather
                name="sun"
                size={16}
                color={organicOnly ? colors.background : colors.textPrimary}
              />
              <Text
                style={[
                  styles.organicToggleLabel,
                  organicOnly && styles.organicToggleLabelActive,
                ]}
              >
                Organic only
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ImageBackground
        source={heroCard.image}
        style={styles.heroCard}
        imageStyle={styles.heroImage}
      >
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>{heroCard.title}</Text>
          <Text style={styles.heroSubtitle}>{heroCard.subtitle}</Text>
          <TouchableOpacity style={styles.heroButton} onPress={handleHeroCta}>
            <Text style={styles.heroButtonText}>{heroCard.cta}</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        style={styles.filtersContainer}
      >
        {getChipFilters(weightSort, pricingSort, ratingSort).map((chip) => {
          const isActive =
            (chip.id === "filters" && (hasActiveFilters || showFilterPanel)) ||
            (chip.id === "weight" && weightSort !== 'none') ||
            (chip.id === "pricing" && pricingSort !== 'none') ||
            (chip.id === "rating" && ratingSort !== 'none');

          return (
            <TouchableOpacity
              key={chip.id}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => handleChipPress(chip.id)}
              accessibilityRole="button"
            >
              <Feather
                name={chip.icon}
                size={14}
                color={isActive ? colors.background : colors.textPrimary}
                style={styles.chipIcon}
              />
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{chip.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={styles.sectionTitle}>Quality Mangoes</Text>

      {productsError && !loadingProducts ? (
        <View style={styles.emptyState}>
          <Feather name="wifi-off" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>Unable to load products</Text>
          <Text style={styles.emptySubtitle}>
            Please check your internet connection and try again.
          </Text>
          <TouchableOpacity
            style={styles.resetFiltersButton}
            onPress={() => {
              setLoadingProducts(true);
              setProductsError(null);
              // Trigger refetch by calling the fetch function again
              const fetchData = async () => {
                try {
                  const controller = new AbortController();
                  const timeoutId = setTimeout(() => controller.abort(), 60000);
                  
                  const [productsResponse, images] = await Promise.all([
                    fetch(API.GET_PRODUCTS, { signal: controller.signal }),
                    getProductImages()
                  ]);
                  
                  clearTimeout(timeoutId);
                  
                  if (!productsResponse.ok) {
                    throw new Error('Failed to fetch products');
                  }
                  
                  const data = await productsResponse.json();
                  setProductImages(images);
                  
                  const transformedProducts = data.map((product: any) => {
                    const cardImage = product.primaryImageUrl 
                      ? `${API_BASE}${product.primaryImageUrl}`
                      : null;
                    
                    const heroImages = product.imageUrls?.map((url: string) => `${API_BASE}${url}`) || [];
                    
                    return {
                      id: String(product.id),
                      name: product.name,
                      subtitle: product.origin || product.variety || 'Premium Quality',
                      price: `₹${product.price.toFixed(0)}`,
                      priceValue: product.price,
                      unit: 'kg',
                      cardImage,
                      heroImages,
                      description: product.description || 'Fresh mangoes from the farm',
                      detailItems: [
                        { label: 'Variety', value: product.variety || 'Premium' },
                        { label: 'Origin', value: product.origin || 'India' },
                        { label: 'Available', value: `${product.availableKg || product.stock} kg` },
                      ],
                      tasteNotes: ['Sweet', 'Juicy', 'Fresh'],
                      rating: 4.5,
                      reviewCount: 128,
                      reviews: [],
                      varietyCategory: product.variety || product.category || 'Premium',
                      weightCategory: '1-2 kg',
                      isOrganic: false,
                      stock: product.stock || product.availableKg || 0,
                    };
                  });
                  
                  setBackendProducts(transformedProducts);
                  setProductsError(null);
                } catch (error) {
                  setProductsError('Failed to load products. Please try again.');
                  setBackendProducts(productCatalog);
                } finally {
                  setLoadingProducts(false);
                }
              };
              fetchData();
            }}
            accessibilityRole="button"
          >
            <Text style={styles.resetFiltersText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : !hasMatches && hasActiveFilters ? (
        <View style={styles.emptyState}>
          <Feather name="search" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>No products match those filters</Text>
          <Text style={styles.emptySubtitle}>
            Try changing your variety or weight preferences.
          </Text>
          <TouchableOpacity
            style={styles.resetFiltersButton}
            onPress={resetFilters}
            accessibilityRole="button"
          >
            <Text style={styles.resetFiltersText}>Reset filters</Text>
          </TouchableOpacity>
        </View>
      ) : filteredProducts.length === 0 && !loadingProducts ? (
        <View style={styles.emptyState}>
          <Feather name="package" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>No products available</Text>
          <Text style={styles.emptySubtitle}>
            We're working on adding fresh mangoes. Please check back soon!
          </Text>
        </View>
      ) : (
        chunkedProducts?.map((row, rowIndex) => (
          <View style={styles.productRow} key={`row-${rowIndex}`}>
            {row.map((product) => (
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.productCard}
                key={product.id}
                onPress={() =>
                  navigation.navigate("ProductDetail", {
                    product,
                  })
                }
              >
                <View style={styles.imageContainer}>
                  <Image 
                    source={
                      imageErrors[product.id] || !product.cardImage 
                        ? require('../../assets/ImageNotFound.jpg')
                        : { uri: product.cardImage }
                    }
                    style={styles.productImage}
                    resizeMode="cover"
                    onError={() => {
                      console.log('Image load error:', product.name);
                      setImageErrors(prev => ({ ...prev, [product.id]: true }));
                    }}
                  />
                </View>
                <TouchableOpacity 
                  style={styles.favoriteButton}
                  onPress={async (e) => {
                    e.stopPropagation();
                    const productId = Number(product.id);
                    try {
                      if (isFavorite(productId)) {
                        await removeFavorite(productId);
                      } else {
                        await addFavorite(productId);
                      }
                    } catch (error) {
                      alert('Failed to update favorites. Please try again.');
                    }
                  }}
                >
                  <Feather 
                    name="heart" 
                    size={16} 
                    color={isFavorite(Number(product.id)) ? "#FF6B6B" : colors.textSecondary}
                    fill={isFavorite(Number(product.id)) ? "#FF6B6B" : "transparent"}
                  />
                </TouchableOpacity>
                <Text style={styles.productName}>
                  {product.detailItems?.find(item => item.label === "Variety")?.value || product.name}
                </Text>
                <Text style={styles.productMeta}>
                  {product.price} / {product.unit}
                </Text>
                {product.rating > 0 ? (
                  <View style={styles.ratingContainer}>
                    <MaterialIcons name="star" size={14} color="#F59E0B" />
                    <Text style={styles.ratingText}>{product.rating}</Text>
                    <Text style={styles.reviewCountText}>({product.reviewCount})</Text>
                  </View>
                ) : (
                  <View style={styles.ratingContainer}>
                    <Text style={styles.noRatingText}>No reviews yet</Text>
                  </View>
                )}
                {getCartQuantity(product.id) > 0 ? (
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => handleDecreaseQuantity(product.id)}
                    >
                      <Feather name="minus" size={18} color="#000" strokeWidth={3} />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{getCartQuantity(product.id)}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => handleIncreaseQuantity(product)}
                    >
                      <Feather name="plus" size={18} color="#000" strokeWidth={3} />
                    </TouchableOpacity>
                  </View>
                ) : (console.log('Product card stock check:', { id: product.id, stock: product.stock, stockType: typeof product.stock }), product.stock === 0) ? (
                  <View style={[styles.cartCta, styles.outOfStockButton]}>
                    <Text style={[styles.cartCtaText, styles.outOfStockText]}>Out of Stock</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.cartCta}
                    onPress={() => handleAddProductToCart(product)}
                  >
                    <Text style={styles.cartCtaText}>Add to Cart</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))
      )}


    </ScrollView>

      {/* Variety Modal */}
      {showVarietyModal && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            onPress={() => setShowVarietyModal(false)}
            activeOpacity={1}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Variety</Text>
              <TouchableOpacity onPress={() => setShowVarietyModal(false)}>
                <Feather name="x" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalOptions}>
              {varietyOptions.map((option) => {
                const selected = option === varietyFilter;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.modalOption, selected && styles.modalOptionSelected]}
                    onPress={() => {
                      setVarietyFilter(option);
                      setShowVarietyModal(false);
                    }}
                  >
                    <Text style={[styles.modalOptionText, selected && styles.modalOptionTextSelected]}>
                      {option}
                    </Text>
                    {selected && <Feather name="check" size={20} color={colors.primary} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Weight Modal */}
      {showWeightModal && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            onPress={() => setShowWeightModal(false)}
            activeOpacity={1}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Weight</Text>
              <TouchableOpacity onPress={() => setShowWeightModal(false)}>
                <Feather name="x" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalOptions}>
              {weightOptions.map((option) => {
                const selected = option === weightFilter;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.modalOption, selected && styles.modalOptionSelected]}
                    onPress={() => {
                      setWeightFilter(option);
                      setShowWeightModal(false);
                    }}
                  >
                    <Text style={[styles.modalOptionText, selected && styles.modalOptionTextSelected]}>
                      {option}
                    </Text>
                    {selected && <Feather name="check" size={20} color={colors.primary} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Organic Modal */}
      {showOrganicModal && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            onPress={() => setShowOrganicModal(false)}
            activeOpacity={1}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Organic Type</Text>
              <TouchableOpacity onPress={() => setShowOrganicModal(false)}>
                <Feather name="x" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalOptions}>
              {organicOptions.map((option) => {
                const selected = 
                  (option === "All Products" && organicOnly === null) ||
                  (option === "Organic Only" && organicOnly === true) ||
                  (option === "Non-Organic Only" && organicOnly === false);
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.modalOption, selected && styles.modalOptionSelected]}
                    onPress={() => {
                      if (option === "All Products") {
                        setOrganicOnly(false);
                      } else if (option === "Organic Only") {
                        setOrganicOnly(true);
                      } else {
                        setOrganicOnly(false);
                      }
                      setShowOrganicModal(false);
                    }}
                  >
                    <Text style={[styles.modalOptionText, selected && styles.modalOptionTextSelected]}>
                      {option}
                    </Text>
                    {selected && <Feather name="check" size={20} color={colors.primary} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            onPress={() => setShowRatingModal(false)}
            activeOpacity={1}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter by Rating</Text>
              <TouchableOpacity onPress={() => setShowRatingModal(false)}>
                <Feather name="x" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalOptions}>
              <TouchableOpacity
                style={[styles.modalOption, ratingFilter === null && styles.modalOptionSelected]}
                onPress={() => {
                  setRatingFilter(null);
                  setShowRatingModal(false);
                }}
              >
                <Text style={[styles.modalOptionText, ratingFilter === null && styles.modalOptionTextSelected]}>
                  All Ratings
                </Text>
                {ratingFilter === null && <Feather name="check" size={20} color={colors.primary} />}
              </TouchableOpacity>
              {[5, 4, 3].map((rating) => {
                const selected = ratingFilter === rating;
                return (
                  <TouchableOpacity
                    key={rating}
                    style={[styles.modalOption, selected && styles.modalOptionSelected]}
                    onPress={() => {
                      setRatingFilter(rating);
                      setShowRatingModal(false);
                    }}
                  >
                    <View style={styles.ratingRow}>
                      <Text style={[styles.modalOptionText, selected && styles.modalOptionTextSelected]}>
                        {rating}★ & up
                      </Text>
                      <View style={styles.starContainer}>
                        {[...Array(5)].map((_, i) => (
                          <Feather
                            key={i}
                            name="star"
                            size={14}
                            color={i < rating ? colors.primary : colors.border}
                            fill={i < rating ? colors.primary : "transparent"}
                          />
                        ))}
                      </View>
                    </View>
                    {selected && <Feather name="check" size={20} color={colors.primary} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    flexGrow: 1,
    paddingTop: 16,
    paddingBottom: 64,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 100,
    height: 32,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(128, 128, 128, 0.15)",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(10px)",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    ...typography.body,
    color: colors.textPrimary,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 8,
    ...typography.body,
    color: "rgba(0, 0, 0, 0.7)",
  },
  searchActiveContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 8,
  },
  searchActiveText: {
    ...typography.body,
    color: "#000000",
    fontWeight: '500',
  },
  clearSearchButton: {
    padding: 4,
  },
  filtersContainer: {
    paddingHorizontal: 16,
  },
  filters: {
    paddingVertical: 8,
    gap: 6,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 6,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipIcon: { marginRight: 6 },
  chipText: {
    ...typography.small,
    color: colors.textPrimary,
  },
  chipTextActive: {
    color: colors.background,
  },
  filterPanel: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  filterHeading: {
    ...typography.h2,
    fontSize: 18,
  },
  resetLabel: {
    ...typography.small,
    color: colors.error,
    fontWeight: "600",
  },
  filterGroup: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 12,
  },
  filterGroupHighlighted: {
    borderColor: colors.primary,
  },
  filterLabel: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  pillLabel: {
    ...typography.small,
    color: colors.textPrimary,
  },
  pillLabelActive: {
    color: colors.background,
    fontWeight: "600",
  },
  organicToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  organicToggleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  organicToggleLabel: {
    ...typography.small,
    color: colors.textPrimary,
  },
  organicToggleLabelActive: {
    color: colors.background,
    fontWeight: "600",
  },
  activeFilters: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  heroCard: {
    height: 220,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 24,
    marginHorizontal: 12,
  },
  heroImage: {
    borderRadius: 24,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  heroContent: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  heroTitle: {
    ...typography.h1,
    color: colors.background,
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.background,
    marginTop: 4,
    marginBottom: 16,
  },
  heroButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
  },
  heroButtonText: {
    ...typography.button,
    color: colors.textPrimary,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 16,
    fontWeight: '700',
    fontSize: 22,
    paddingHorizontal: 16,
  },
  emptyState: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    ...typography.h2,
    fontSize: 18,
    textAlign: "center",
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  resetFiltersButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  resetFiltersText: {
    ...typography.button,
    color: colors.primary,
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
    paddingHorizontal: 16,
  },
  productCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 16,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  productImage: {
    width: "100%",
    height: 160,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#f8f8f8',
  },
  imageContainer: {
    width: "100%",
    height: 160,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    backgroundColor: '#FFF4E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  placeholderLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
  },
  favoriteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  productName: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 12,
    marginHorizontal: 12,
    lineHeight: 20,
  },
  productMeta: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginHorizontal: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 8,
  },
  cartCta: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginHorizontal: 12,
    marginTop: 12,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  cartCtaText: {
    ...typography.button,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
    marginTop: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 40,
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    minWidth: 20,
    textAlign: 'center',
  },
  outOfStockButton: {
    backgroundColor: colors.border,
  },
  outOfStockText: {
    color: colors.textSecondary,
  },

  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    flex: 1,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 20,
    width: "85%",
    maxWidth: 500, // Increased for foldable devices
    maxHeight: "70%",
    paddingBottom: 34,
    zIndex: 1001,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.h2,
    fontSize: 20,
  },
  modalOptions: {
    flex: 1,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalOptionSelected: {
    backgroundColor: colors.surface,
  },
  modalOptionDescription: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 4,
  },
  modalOptionText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  modalOptionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  starContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  reviewCountText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  noRatingText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});

// Center modal styles
const centerModalStyles = {
  centerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerModalContent: {
    backgroundColor: colors.background,
    borderRadius: 20,
    width: "85%",
    maxHeight: "70%",
    paddingBottom: 20,
  },
};
