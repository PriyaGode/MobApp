import { Feather } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useContext, useEffect, useState } from "react";
import {
    Alert,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Animated,
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from "../../App";
import { AuthContext } from '../../contexts/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, "MangoSearch">;

const topCategories = [
  { id: 1, name: 'Fresh Mangoes', icon: '🥭' },
  { id: 2, name: 'Mango Juices', icon: '🧃' },
  { id: 3, name: 'Mango Desserts', icon: '🍨' },
  { id: 4, name: 'Dried Mangoes', icon: '🍃' },
];

const topBrands = [
  { id: 1, name: 'SunRipe', logo: '🌞', color: '#FFE5B4' },
  { id: 2, name: 'Mango Grove', logo: '🥭', color: '#FFF9E6' },
  { id: 3, name: 'Tropicana', logo: '🌴', color: '#2D5F4F' },
  { id: 4, name: 'Pure Gold', logo: '✨', color: '#FFD700' },
];

export default function MangoSearchScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  const [voiceInput, setVoiceInput] = useState('');
  const pulseAnim = useState(new Animated.Value(1))[0];
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user?.email) {
      loadRecentSearches();
    }
  }, [user?.email]);

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const getStorageKey = () => {
    return `recentSearches_${user?.email || 'guest'}`;
  };

  const loadRecentSearches = async () => {
    try {
      const storageKey = getStorageKey();
      const stored = await AsyncStorage.getItem(storageKey);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      // Silently fail
    }
  };

  const saveRecentSearches = async (searches: string[]) => {
    try {
      const storageKey = getStorageKey();
      await AsyncStorage.setItem(storageKey, JSON.stringify(searches));
    } catch (error) {
      // Silently fail
    }
  };

  const suggestions = [
    'alphonso mangoes',
    'alpha-mango drink',
  ];

  const filteredSuggestions = searchText 
    ? suggestions.filter(s => s.toLowerCase().includes(searchText.toLowerCase()))
    : [];

  const handleSearch = (query: string) => {
    if (query.trim()) {
      const updatedSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(updatedSearches);
      saveRecentSearches(updatedSearches);
      
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
                    params: { searchQuery: query },
                  },
                ],
              },
            },
          ],
        })
      );
    }
  };

  const handleVoiceSearch = async () => {
    Alert.alert("Voice Search", "Voice search feature coming soon. Please type your search query.");
  };

  const removeRecentSearch = (search: string) => {
    const updatedSearches = recentSearches.filter(s => s !== search);
    setRecentSearches(updatedSearches);
    saveRecentSearches(updatedSearches);
  };

  const startVoiceSearch = () => {
    setVoiceModalVisible(true);
    setIsListening(true);
    setVoiceInput('');
    
    // Simulate listening animation
    setTimeout(() => {
      setIsListening(false);
    }, 2000);
  };

  const stopVoiceSearch = () => {
    setIsListening(false);
    
    if (voiceInput.trim()) {
      setSearchText(voiceInput);
      setTimeout(() => {
        setVoiceModalVisible(false);
        handleSearch(voiceInput);
      }, 300);
    } else {
      setVoiceModalVisible(false);
    }
  };

  const cancelVoiceSearch = () => {
    setIsListening(false);
    setVoiceInput('');
    setVoiceModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top || 20 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search</Text>
        <TouchableOpacity onPress={startVoiceSearch}>
          <Feather name="mic" size={24} color="#FF9800" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for mangoes, products..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
          autoFocus
          returnKeyType="search"
          onSubmitEditing={() => handleSearch(searchText)}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Feather name="x-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Suggestions */}
        {searchText.length > 0 && filteredSuggestions.length > 0 && (
          <View style={styles.section}>
            {filteredSuggestions.map((suggestion, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.suggestionItem}
                onPress={() => handleSearch(suggestion)}
              >
                <Feather name="search" size={18} color="#666" />
                <Text style={styles.suggestionText}>
                  {suggestion.split(searchText.toLowerCase()).map((part, i, arr) => (
                    <React.Fragment key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <Text style={styles.suggestionHighlight}>{searchText.toLowerCase()}</Text>
                      )}
                    </React.Fragment>
                  ))}
                </Text>
                <Feather name="arrow-up-left" size={18} color="#999" style={styles.suggestionArrow} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Recent Searches */}
        {searchText.length === 0 && recentSearches.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            {recentSearches.map((search, index) => (
              <View key={index} style={styles.recentItem}>
                <Feather name="clock" size={18} color="#666" />
                <TouchableOpacity 
                  style={styles.recentTextContainer}
                  onPress={() => handleSearch(search)}
                >
                  <Text style={styles.recentText}>{search}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeRecentSearch(search)}>
                  <Feather name="x" size={18} color="#999" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Top Categories */}
        {searchText.length === 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Categories</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {topCategories.map((category) => (
                <TouchableOpacity 
                  key={category.id} 
                  style={[
                    styles.categoryChip,
                    category.id === 1 && styles.categoryChipActive
                  ]}
                  onPress={() => handleSearch(category.name)}
                >
                  <Text style={styles.categoryEmoji}>{category.icon}</Text>
                  <Text style={[
                    styles.categoryText,
                    category.id === 1 && styles.categoryTextActive
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Top Brands */}
        {searchText.length === 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Brands</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.brandsContainer}
            >
              {topBrands.map((brand) => (
                <TouchableOpacity 
                  key={brand.id} 
                  style={styles.brandCard}
                  onPress={() => handleSearch(brand.name)}
                >
                  <View style={[styles.brandLogo, { backgroundColor: brand.color }]}>
                    <Text style={styles.brandEmoji}>{brand.logo}</Text>
                  </View>
                  <Text style={styles.brandName}>{brand.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Voice Search Modal */}
      <Modal
        visible={voiceModalVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelVoiceSearch}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.voiceModal}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={cancelVoiceSearch}
            >
              <Feather name="x" size={24} color="#666" />
            </TouchableOpacity>

            <Animated.View 
              style={[
                styles.micContainer,
                {
                  transform: [{ scale: pulseAnim }],
                }
              ]}
            >
              <View style={styles.micCircle}>
                <Feather name="mic" size={48} color="#FFF" />
              </View>
            </Animated.View>

            <Text style={styles.listeningText}>
              {isListening ? 'Listening...' : 'Type your search'}
            </Text>
            
            <View style={styles.voiceInputContainer}>
              <TextInput
                style={styles.voiceTextInput}
                placeholder="E.g., Alphonso Mango"
                placeholderTextColor="#999"
                value={voiceInput}
                onChangeText={setVoiceInput}
                autoFocus={!isListening}
                returnKeyType="search"
                onSubmitEditing={stopVoiceSearch}
              />
            </View>

            <View style={styles.waveformContainer}>
              {[1, 2, 3, 4, 5].map((_, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.waveBar,
                    { 
                      height: isListening ? 20 + Math.random() * 30 : 10,
                      backgroundColor: isListening ? '#FF9800' : '#DDD',
                    }
                  ]} 
                />
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.searchButton}
                onPress={stopVoiceSearch}
              >
                <Text style={styles.searchButtonText}>Search</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={cancelVoiceSearch}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  micActive: {
    opacity: 0.6,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginHorizontal: 16,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  suggestionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  suggestionHighlight: {
    fontWeight: '600',
    color: '#FF9800',
  },
  suggestionArrow: {
    marginLeft: 8,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  recentTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  recentText: {
    fontSize: 16,
    color: '#333',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#FFF9E6',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  categoryEmoji: {
    fontSize: 20,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  categoryTextActive: {
    color: '#333',
    fontWeight: '500',
  },
  brandsContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  brandCard: {
    alignItems: 'center',
    marginRight: 16,
    width: 100,
  },
  brandLogo: {
    width: 80,
    height: 80,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  brandEmoji: {
    fontSize: 32,
  },
  brandName: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  // Voice Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceModal: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '85%',
    maxWidth: 400,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 1,
  },
  micContainer: {
    marginTop: 20,
    marginBottom: 24,
  },
  micCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  listeningText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  voiceInputContainer: {
    width: '80%',
    marginBottom: 24,
  },
  voiceTextInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    gap: 8,
    marginBottom: 32,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: '#DDD',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '80%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  searchButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: '#FF9800',
    alignItems: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#CCC',
  },
  searchButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
});
