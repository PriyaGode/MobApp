import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'MangoFilter'>;

const sortOptions = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'price-low', label: 'Price: Low → High' },
  { id: 'price-high', label: 'Price: High → Low' },
  { id: 'rating', label: 'Rating' },
  { id: 'newest', label: 'Newest Harvest' },
  { id: 'discount', label: 'Discount' },
];

const categories = ['Fresh', 'Pulp', 'Pickle', 'Juice', 'Dried'];
const ratings = ['4★ & up', '3★ & up', '2★ & up', '1★ & up'];
const brands = ['Mango Kings', 'Fresh Farms', 'Golden Harvest', 'Tropicana'];

export default function MangoFilterScreen({ navigation, route }: Props) {
  const currentFilters = route.params?.currentFilters || {};
  
  const [selectedSort, setSelectedSort] = useState(currentFilters.sort || 'relevance');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(currentFilters.categories || []);
  const [selectedRating, setSelectedRating] = useState(currentFilters.rating || '1★ & up');
  const [selectedBrands, setSelectedBrands] = useState<string[]>(currentFilters.brands || []);
  const [minPrice, setMinPrice] = useState(currentFilters.priceRange?.min ?? 0);
  const [maxPrice, setMaxPrice] = useState(currentFilters.priceRange?.max ?? 1000);

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const toggleBrand = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter((b) => b !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
  };

  const activeFiltersCount = 
    selectedCategories.length + 
    (selectedRating !== '1★ & up' ? 1 : 0) + 
    selectedBrands.length;

  const handleApplyFilters = () => {
    const filters = {
      sort: selectedSort,
      categories: selectedCategories,
      rating: selectedRating,
      brands: selectedBrands,
      priceRange: { min: minPrice, max: maxPrice }
    };
    
    // Use CommonActions to reset to Main with Home tab and new params
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
                  params: { filters },
                },
              ],
            },
          },
        ],
      })
    );
  };

  const handleReset = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedRating('1★ & up');
    setSelectedSort('relevance');
    setMinPrice(0);
    setMaxPrice(1000);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="x" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filter & Sort</Text>
        <TouchableOpacity onPress={handleReset}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Sort Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sort By</Text>
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.radioItem}
              onPress={() => setSelectedSort(option.id)}
            >
              <View style={styles.radioButton}>
                {selectedSort === option.id && <View style={styles.radioButtonInner} />}
              </View>
              <Text style={[styles.radioLabel, selectedSort === option.id && styles.radioLabelActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mango Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mango Category</Text>
          <View style={styles.chipRow}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.chip,
                  selectedCategories.includes(category) && styles.chipActive,
                ]}
                onPress={() => toggleCategory(category)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedCategories.includes(category) && styles.chipTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Price Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Range</Text>
          <View style={styles.priceInputRow}>
            <View style={styles.priceInput}>
              <Text style={styles.priceLabel}>Min</Text>
              <Text style={styles.priceValue}>${minPrice}</Text>
            </View>
            <View style={styles.priceSeparator} />
            <View style={styles.priceInput}>
              <Text style={styles.priceLabel}>Max</Text>
              <Text style={styles.priceValue}>${maxPrice}</Text>
            </View>
          </View>
          <View style={styles.sliderContainer}>
            <View style={styles.sliderTrack} />
            <View style={[styles.sliderFill, { width: '70%' }]} />
            <View style={[styles.sliderThumb, { left: '20%' }]} />
            <View style={[styles.sliderThumb, { left: '90%' }]} />
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

        {/* Brands */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Brand</Text>
          {brands.map((brand) => (
            <TouchableOpacity
              key={brand}
              style={styles.checkboxItem}
              onPress={() => toggleBrand(brand)}
            >
              <View style={styles.checkbox}>
                {selectedBrands.includes(brand) && (
                  <Feather name="check" size={16} color="#FFC300" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>{brand}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Apply Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.applyButton}
          onPress={handleApplyFilters}
        >
          <Text style={styles.applyButtonText}>
            Apply Filters ({activeFiltersCount})
          </Text>
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
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  resetText: {
    fontSize: 16,
    color: '#FFC300',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
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
  radioLabel: {
    fontSize: 16,
    color: '#666',
  },
  radioLabelActive: {
    color: '#333',
    fontWeight: '500',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  chipActive: {
    backgroundColor: '#FFF3C1',
    borderColor: '#FFC300',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#333',
    fontWeight: '600',
  },
  priceInputRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  priceInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    padding: 16,
  },
  priceLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  priceSeparator: {
    width: 1,
    backgroundColor: '#E8E8E8',
    alignSelf: 'center',
    height: 20,
  },
  sliderContainer: {
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  sliderTrack: {
    height: 4,
    backgroundColor: '#E8E8E8',
    borderRadius: 2,
  },
  sliderFill: {
    height: 4,
    backgroundColor: '#FFC300',
    borderRadius: 2,
    position: 'absolute',
    left: '20%',
  },
  sliderThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFC300',
    position: 'absolute',
    marginLeft: -10,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
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
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
  footer: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    backgroundColor: '#FFFDF6',
  },
  applyButton: {
    backgroundColor: '#FFC300',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});
