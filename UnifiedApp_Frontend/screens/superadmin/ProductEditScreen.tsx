import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Button from '../../components/superadmin/Button';
import CollapsibleSection from '../../components/superadmin/CollapsibleSection';
import { API_BASE_URL } from '../../config'; // Import from central config



const CATEGORY_OPTIONS = ['Fresh Mangoes', 'Apples', 'Bananas', 'Exotic Fruits', 'Pantry & Staples', 'Beverages'];

export default function ProductEditScreen({ navigation, route }: { navigation: any; route: any }) {
  const existingProduct = route.params?.product;
  const isEditing = !!existingProduct;

  const [productName, setProductName] = useState(existingProduct?.name || '');
  const [category, setCategory] = useState(existingProduct?.category || '');
  const [variety, setVariety] = useState(existingProduct?.variety || '');
  const [origin, setOrigin] = useState(existingProduct?.origin || '');
  const [description, setDescription] = useState(existingProduct?.description || '');
  const [price, setPrice] = useState(existingProduct?.price?.toString() || '');
  const [stock, setStock] = useState(existingProduct?.stock?.toString() || '');
  const [availableKg, setAvailableKg] = useState(existingProduct?.availableKg?.toString() || '');
  const [status, setStatus] = useState(existingProduct?.status || 'ACTIVE');
  const [imageUri, setImageUri] = useState<string | null>(existingProduct?.imageUrl || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [availableHubs, setAvailableHubs] = useState<any[]>([]);
  const [selectedHubs, setSelectedHubs] = useState<string[]>([]);

  useEffect(() => {
    const fetchHubs = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/hubs`);
        if (response.ok) {
          const data = await response.json();
          setAvailableHubs(data);
          if (existingProduct?.hubVisibility && existingProduct.hubVisibility !== 'ALL') {
            setSelectedHubs(existingProduct.hubVisibility.split(','));
          }
        }
      } catch (error) {
        console.error('Failed to fetch hubs:', error);
      }
    };
    fetchHubs();
  }, []);

  const toggleHub = (hubId: string) => {
    setSelectedHubs(prev => 
      prev.includes(hubId) ? prev.filter(id => id !== hubId) : [...prev, hubId]
    );
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!productName || !price || !stock || !category) {
      Alert.alert('Missing Information', 'Please fill out Product Name, Category, Price, and Stock.');
      return;
    }
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      Alert.alert('Invalid Price', 'Price must be a number greater than 0.');
      return;
    }
    const numericStock = parseInt(stock, 10);
    if (isNaN(numericStock) || numericStock < 0) {
      Alert.alert('Invalid Stock', 'Stock must be a valid number.');
      return;
    }
    setIsSubmitting(true);
    
    const productData: any = {
      name: productName,
      category,
      variety,
      origin,
      description,
      price: numericPrice,
      stock: numericStock,
      availableKg: availableKg ? parseInt(availableKg, 10) : numericStock,
      imageUrl: imageUri,
      status: status,
      hubVisibility: selectedHubs.length > 0 ? selectedHubs.join(',') : 'ALL',
    };

    const API_URL = `${API_BASE_URL}/products`;
    const url = isEditing ? `${API_URL}/${existingProduct.id}` : API_URL;
    const method = isEditing ? 'PUT' : 'POST';
    try {
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productData) });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred.' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      Alert.alert(isEditing ? 'Product Updated' : 'Product Saved', 'Product has been successfully saved.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error) {
      console.error('Failed to save product:', error);
      Alert.alert('Save Failed', (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{isEditing ? 'Edit Product' : 'Add Product'}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        <CollapsibleSection title="Basic Info" isInitiallyOpen>
          <Text style={styles.label}>Product Image</Text>
          <TouchableOpacity style={styles.imageUploader} onPress={pickImage}>
            {imageUri ? <Image source={{ uri: imageUri }} style={styles.productImage} /> : (
              <View style={styles.uploaderPlaceholder}><Feather name="image" size={40} color="#888" /><Text style={styles.uploaderText}>Tap to upload</Text></View>
            )}
          </TouchableOpacity>
          <Text style={styles.fieldHint}>Upload a high-quality image of the product.</Text>

          {isEditing && (
            <>
              <Text style={styles.label}>SKU</Text>
              <Text style={styles.readOnlyField}>SKU{existingProduct.id}</Text>
            </>
          )}

          <Text style={styles.label}>Product Name</Text>
          <TextInput style={styles.input} placeholder="e.g., Premium Alphonso Mangoes" value={productName} onChangeText={setProductName} />

          <Text style={styles.label}>Category</Text>
          <TouchableOpacity style={styles.pickerButton} onPress={() => setCategoryModalVisible(true)}><Text style={styles.pickerText}>{category || 'Select a category'}</Text><Feather name="chevron-down" size={20} color="#555" /></TouchableOpacity>

          <Text style={styles.label}>Variety</Text>
          <TextInput style={styles.input} placeholder="e.g., Alphonso" value={variety} onChangeText={setVariety} />

          <Text style={styles.label}>Origin</Text>
          <TextInput style={styles.input} placeholder="e.g., Ratnagiri" value={origin} onChangeText={setOrigin} />

          <Text style={styles.label}>Description</Text>
          <TextInput style={styles.input} placeholder="Product description" value={description} onChangeText={setDescription} multiline numberOfLines={3} />
        </CollapsibleSection>

        <CollapsibleSection title="Pricing & Stock">
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Price</Text>
              <TextInput style={styles.input} placeholder="₹ 1200" keyboardType="numeric" value={price} onChangeText={setPrice} />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Available (Kg)</Text>
              <TextInput style={styles.input} placeholder="e.g., 450" keyboardType="numeric" value={availableKg} onChangeText={setAvailableKg} />
            </View>
          </View>
          <Text style={styles.label}>Stock Quantity</Text>
          <TextInput style={styles.input} placeholder="e.g., 500" keyboardType="numeric" value={stock} onChangeText={setStock} />
        </CollapsibleSection>

        <CollapsibleSection title="Status">
          <Text style={styles.label}>Product Status</Text>
          <View style={styles.statusOptions}>
            <TouchableOpacity 
              style={[styles.statusOption, status === 'ACTIVE' && styles.statusOptionActive]} 
              onPress={() => setStatus('ACTIVE')}>
              <View style={[styles.statusDot, {backgroundColor: '#4CAF50'}]} />
              <Text style={[styles.statusOptionText, status === 'ACTIVE' && styles.statusOptionTextActive]}>Active</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.statusOption, status === 'DRAFT' && styles.statusOptionActive]} 
              onPress={() => setStatus('DRAFT')}>
              <View style={[styles.statusDot, {backgroundColor: '#9E9E9E'}]} />
              <Text style={[styles.statusOptionText, status === 'DRAFT' && styles.statusOptionTextActive]}>Draft</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.fieldHint}>Active products are visible to customers. Draft products are hidden.</Text>
        </CollapsibleSection>

        <CollapsibleSection title="Hub Visibility">
          <Text style={styles.label}>Select Hubs</Text>
          <Text style={styles.fieldHint}>Choose which hubs can sell this product</Text>
          <View style={styles.checkboxGroup}>
            {availableHubs.map(hub => (
              <TouchableOpacity 
                key={hub.id} 
                style={styles.checkboxContainer} 
                onPress={() => toggleHub(hub.id)}>
                <View style={[styles.checkbox, selectedHubs.includes(hub.id) && styles.checkboxChecked]}>
                  {selectedHubs.includes(hub.id) && <Feather name="check" size={14} color="#fff" />}
                </View>
                <Text style={styles.checkboxLabel}>{hub.name || hub.location}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {selectedHubs.length === 0 && (
            <Text style={styles.fieldHint}>No hubs selected - product will be available to ALL hubs</Text>
          )}
        </CollapsibleSection>

      </ScrollView>

      <View style={styles.footer}>
        <Button title={isSubmitting ? 'Saving...' : 'Save Product'} onPress={handleSave} disabled={isSubmitting} style={{flex: 1, marginHorizontal: 10}} />
      </View>

      <Modal transparent visible={isCategoryModalVisible} animationType="fade" onRequestClose={() => setCategoryModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setCategoryModalVisible(false)}>
          <View style={styles.modalContent}><Text style={styles.modalTitle}>Select a Category</Text><FlatList data={CATEGORY_OPTIONS} keyExtractor={item => item} renderItem={({ item }) => (<TouchableOpacity style={styles.modalItem} onPress={() => { setCategory(item); setCategoryModalVisible(false); }}><Text style={styles.modalItemText}>{item}</Text></TouchableOpacity>)} /></View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd' },
  backButton: { padding: 5, marginRight: 15 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  scrollContainer: { padding: 10 },
  label: { fontSize: 16, fontWeight: '600', color: '#555', marginTop: 10, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fff' },
  readOnlyField: { borderWidth: 1, borderColor: '#eee', backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8, fontSize: 16, color: '#555' },
  autoGenerateText: { fontStyle: 'italic', color: '#888', padding: 12 },
  imageUploader: { height: 120, borderWidth: 2, borderColor: '#ccc', borderStyle: 'dashed', borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9', overflow: 'hidden' },
  uploaderPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  uploaderText: { marginTop: 8, color: '#888' },
  productImage: { width: '100%', height: '100%' },
  fieldHint: { fontSize: 12, color: '#888', marginTop: 5 },
  pickerButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, backgroundColor: '#fff' },
  pickerText: { fontSize: 16, color: '#333' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfWidth: { width: '48%' },
  checkboxGroup: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', width: '48%', marginVertical: 8 },
  checkbox: { width: 20, height: 20, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
  checkboxLabel: { fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', borderRadius: 10, padding: 20, width: '80%', maxHeight: '60%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalItemText: { fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'space-around', padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#ddd' },
  footerButton: { flex: 1, marginHorizontal: 5 },
  statusOptions: { flexDirection: 'row', gap: 10 },
  statusOption: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#fff' },
  statusOptionActive: { borderColor: '#2196F3', backgroundColor: '#E3F2FD' },
  statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  statusOptionText: { fontSize: 16, color: '#666' },
  statusOptionTextActive: { color: '#2196F3', fontWeight: '600' },
});
