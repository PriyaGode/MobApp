import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/superadmin/Button';
import { API_BASE_URL } from '../../config'; // Import from central config

// Define the structure of a Product
type Product = {
  id: number;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string;
  stock: number;
  category: string;
};

export default function ProductDetailScreen({ route, navigation }: { route: any, navigation: any }) {
  const { productId } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId) {
        Alert.alert("Error", "No product ID provided.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);
        if (!response.ok) {
          throw new Error("Product not found.");
        }
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        Alert.alert("Error", "Failed to fetch product details.");
        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const handleEdit = () => {
    // Navigate to Edit and pop this screen off the stack.
    // When ProductEdit goes back, it will go directly to the list, triggering a refresh.
    navigation.pop();
    navigation.navigate('ProductEdit', { product });
  };

  const handleDelete = () => {
    if (!product) return;

    Alert.alert(
      "Confirm Deletion",
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/products/${product.id}`, {
                method: 'DELETE',
              });

              if (!response.ok) {
                throw new Error('Failed to delete product.');
              }

              Alert.alert("Success", "Product deleted successfully.", [
                { text: "OK", onPress: () => navigation.goBack() }
              ]);

            } catch (error) {
              Alert.alert("Error", (error as Error).message);
            }
          } 
        }
      ]
    );
  };

  if (isLoading) {
    return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  if (!product) {
    return <View style={styles.centered}><Text>Product not found.</Text></View>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
      <Image source={{ uri: product.imageUrl || 'https://via.placeholder.com/400' }} style={styles.image} />
      <View style={styles.detailsContainer}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>₹{product.price.toFixed(2)}</Text>
        <Text style={styles.description}>{product.description || 'No description available.'}</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Stock:</Text>
          <Text style={styles.infoValue}>{product.stock} units</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Category:</Text>
          <Text style={styles.infoValue}>{product.category}</Text>
        </View>
      </View>

      <View style={styles.adminActions}>
        <Button title="Edit Product" onPress={handleEdit} />
        <Button title="Delete Product" onPress={handleDelete} outline style={styles.deleteButton} />
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex:1, backgroundColor:'#fff' },
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 300, backgroundColor: '#eee' },
  detailsContainer: { padding: 20 },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  price: { fontSize: 22, color: '#2196F3', marginBottom: 16 },
  description: { fontSize: 16, lineHeight: 24, color: '#666' },
  infoRow: { flexDirection: 'row', marginTop: 12 },
  infoLabel: { fontSize: 16, fontWeight: '600', marginRight: 8 },
  infoValue: { fontSize: 16, color: '#333' },
  adminActions: { padding: 20, borderTopWidth: 1, borderTopColor: '#eee' },
  deleteButton: { borderColor: '#D32F2F' },
});
