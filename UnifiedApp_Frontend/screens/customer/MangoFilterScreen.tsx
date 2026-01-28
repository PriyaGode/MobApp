import { Feather } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { RootStackParamList } from '../../App';
import { productCatalog } from '../productData';

type Props = NativeStackScreenProps<RootStackParamList, 'MangoFilter'>;

const sortOptions = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'price-low', label: 'Price: Low → High' },
  { id: 'price-high', label: 'Price: High → Low' },
  { id: 'rating', label: 'Rating' },
  { id: 'newest', label: 'Newest Harvest' },
  { id: 'discount', label: 'Discount' },
];

const uniqueWeights = Array.from(
  new Set(productCatalog.map((p) => p.weightCategory))
);

const ratings = ['4★ & up', '3★ & up', '2★ & up', '1★ & up'];
const weights = uniqueWeights;

export default function MangoFilterScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const currentFilters = route.params?.currentFilters || {};
  const searchQuery = route.params?.searchQuery;

  const [selectedSort, setSelectedSort] = useState(
    currentFilters.sort || 'relevance'
  );
  const [selectedRating, setSelectedRating] = useState(
    currentFilters.rating || '1★ & up'
  );
  const [selectedWeights, setSelectedWeights] = useState<string[]>(
    currentFilters.weights || []
  );
  const [minPrice, setMinPrice] = useState(
    currentFilters.priceRange?.min ?? 0
  );
  const [maxPrice, setMaxPrice] = useState(
    currentFilters.priceRange?.max ?? 1000
  );

  const toggleWeight = (weight: string) => {
    setSelectedWeights((prev) =>
      prev.includes(weight)
        ? prev.filter((w) => w !== weight)
        : [...prev, weight]
    );
  };

  const activeFiltersCount =
    (selectedRating !== '1★ & up' ? 1 : 0) + selectedWeights.length;

  const handleApplyFilters = () => {
    const filters = {
      sort: selectedSort,
      rating: selectedRating,
      weights: selectedWeights,
      priceRange: { min: minPrice, max: maxPrice },
    };

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'Main',
            state: {
              routes: [
                {
                  name: 'Home',
                  params: {
                    filters,
                    ...(searchQuery && { searchQuery }),
                  },
                },
              ],
            },
          },
        ],
      })
    );
  };

  const handleReset = () => {
    setSelectedSort('relevance');
    setSelectedRating('1★ & up');
    setSelectedWeights([]);
    setMinPrice(0);
    setMaxPrice(1000);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={[styles.content, { paddingTop: insets.top || 20 }]} showsVerticalScrollIndicator={false}>
        {/* Sort */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sort By</Text>
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.radioItem}
              onPress={() => setSelectedSort(option.id)}
            >
              <View style={styles.radioButton}>
                {selectedSort === option.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <Text
                style={[
                  styles.radioLabel,
                  selectedSort === option.id && styles.radioLabelActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mango Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mango Category</Text>
          <View style={styles.comingSoonContainer}>
            <Text style={styles.comingSoonText}>🚀 Coming Soon!</Text>
            <Text style={styles.comingSoonSubtext}>More categories will be available soon</Text>
          </View>
        </View>

        {/* Mango Variety */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mango Variety</Text>
          <View style={styles.comingSoonContainer}>
            <Text style={styles.comingSoonText}>🥭 Coming Soon!</Text>
            <Text style={styles.comingSoonSubtext}>Variety filtering will be available soon</Text>
          </View>
        </View>

        {/* Price Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Range</Text>

          <View style={styles.priceDisplay}>
            <Text style={styles.priceText}>₹{minPrice}</Text>
            <Text style={styles.priceText}>₹{maxPrice}</Text>
          </View>

          <MultiSlider
            values={[minPrice, maxPrice]}
            min={0}
            max={1000}
            step={1} // ✅ smooth
            sliderLength={300}
            onValuesChange={(values) => {
              setMinPrice(values[0]);
              setMaxPrice(values[1]);
            }}
            selectedStyle={{ backgroundColor: '#FFC300' }}
            unselectedStyle={{ backgroundColor: '#E8E8E8' }}
            markerStyle={styles.sliderThumb}
            pressedMarkerStyle={styles.sliderThumbPressed}
            touchDimensions={{
              height: 50,
              width: 50,
              borderRadius: 25,
              slipDisplacement: 40,
            }}
            containerStyle={{ alignSelf: 'center', marginTop: 16 }}
          />

          {/* Price Buttons */}
          <View style={styles.priceButtons}>
            {[0, 100, 300, 500, 1000].map((price) => (
              <TouchableOpacity
                key={price}
                style={[
                  styles.priceButton,
                  (minPrice === price || maxPrice === price) &&
                    styles.priceButtonActive,
                ]}
                onPress={() => {
                  if (price <= maxPrice) setMinPrice(price);
                  else setMaxPrice(price);
                }}
              >
                <Text
                  style={[
                    styles.priceButtonText,
                    (minPrice === price || maxPrice === price) &&
                      styles.priceButtonTextActive,
                  ]}
                >
                  ₹{price}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rating</Text>
          <View style={styles.chipRow}>
            {ratings.map((rating) => (
              <TouchableOpacity
                key={rating}
                style={[
                  styles.chip,
                  selectedRating === rating && styles.chipActive,
                ]}
                onPress={() => setSelectedRating(rating)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedRating === rating && styles.chipTextActive,
                  ]}
                >
                  {rating}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Weight */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weight</Text>
          <View style={styles.comingSoonContainer}>
            <Text style={styles.comingSoonText}>⚖️ Coming Soon!</Text>
            <Text style={styles.comingSoonSubtext}>Weight filtering will be available soon</Text>
          </View>
        </View>
      </ScrollView>

      {/* Apply */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
          <Text style={styles.applyButtonText}>
            Apply Filters ({activeFiltersCount})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF6' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#333' },
  resetText: { fontSize: 16, color: '#FFC300', fontWeight: '600' },
  content: { paddingHorizontal: 32 },
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  radioItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFC300',
  },
  radioLabel: { fontSize: 16, color: '#666' },
  radioLabelActive: { color: '#333', fontWeight: '500' },
  priceDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceText: { fontSize: 16, fontWeight: '600', color: '#333' },
  sliderThumb: {
    height: 22,
    width: 22,
    borderRadius: 11,
    backgroundColor: '#FFC300',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  sliderThumbPressed: {
    backgroundColor: '#FFB703',
  },
  priceButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 20,
  },
  priceButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  priceButtonActive: {
    backgroundColor: '#FFF3C1',
    borderColor: '#FFC300',
  },
  priceButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  priceButtonTextActive: {
    color: '#333',
    fontWeight: '600',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  chipActive: { backgroundColor: '#FFF3C1', borderColor: '#FFC300' },
  chipText: { fontSize: 14, color: '#666', fontWeight: '500' },
  chipTextActive: { color: '#333', fontWeight: '600' },
  checkboxItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: { fontSize: 16, color: '#333' },
  footer: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  applyButton: {
    backgroundColor: '#FFC300',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  applyButtonText: { fontSize: 16, fontWeight: '600' },
  comingSoonContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  comingSoonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C757D',
    marginBottom: 4,
  },
  comingSoonSubtext: {
    fontSize: 14,
    color: '#ADB5BD',
    textAlign: 'center',
  },
});
