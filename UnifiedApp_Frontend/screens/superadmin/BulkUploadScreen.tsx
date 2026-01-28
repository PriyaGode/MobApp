import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, FlatList, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../components/superadmin/Button';
import { API_BASE_URL } from '../../config';
import { normalize, wp } from '../../utils/responsive';

// --- Types for this screen ---
type SelectedFile = { name: string; size?: number; uri: string };
type ProductRow = { Name: string; Category: string; Variety: string; Origin: string; Description: string; Price: string; Stock: string; AvailableKg: string; ImageUrl: string; [key: string]: string };
type ValidatedRow = { data: ProductRow; isValid: boolean; errors: string[] };
type UploadError = { row: number; error: string; data: ProductRow };
type UploadStatus = 'idle' | 'validating' | 'uploading' | 'success' | 'error';
type UploadResult = { successCount: number; errorCount: number; errors: UploadError[] };

export default function BulkUploadScreen({ navigation }: { navigation: any }) {
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [isErrorLogVisible, setIsErrorLogVisible] = useState(false);

  const resetState = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    setUploadResult(null);
  };

  const handleDownloadFormat = () => {
    Alert.alert(
      'CSV Template Format',
      'Required Columns (in exact order):\n\n' +
      '1. Name (mandatory)\n' +
      '2. Category\n' +
      '3. Variety\n' +
      '4. Origin\n' +
      '5. Description\n' +
      '6. Price (mandatory)\n' +
      '7. Stock (mandatory)\n' +
      '8. AvailableKg\n' +
      '9. ImageUrl\n\n' +
      'Example:\n' +
      'Alphonso Mango,Fresh Mangoes,Alphonso,Ratnagiri,Sweet and juicy,1200,500,450,https://example.com/mango.jpg',
      [
        { text: 'Got it' }
      ]
    );
  };

  const handleChooseFile = async () => {
    resetState();
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['text/csv'] });
      if (!result.canceled && result.assets?.[0]) {
        const { name, size, uri } = result.assets[0];
        setSelectedFile({ name, size, uri });
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred while picking the file.');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploadStatus('uploading');
    const formData = new FormData();
    formData.append('file', { uri: selectedFile.uri, name: selectedFile.name, type: 'text/csv' } as any);

    try {
      const response = await fetch(`${API_BASE_URL}/products/bulk-upload`, { method: 'POST', body: formData, headers: { 'Content-Type': 'multipart/form-data' } });
      const result = await response.json();

      if (!response.ok) throw new Error(result.message || 'An unknown error occurred during upload.');
      
      setUploadResult(result);
      setUploadStatus(result.errorCount > 0 ? 'error' : 'success');
    } catch (error) {
      setUploadResult({ successCount: 0, errorCount: 0, errors: [{ row: 0, error: (error as Error).message, data: {} as ProductRow }] });
      setUploadStatus('error');
    }
  };

  const renderStatusContent = () => {
    switch (uploadStatus) {
      case 'uploading':
        return (
          <View style={styles.statusBox}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.statusTitle}>Uploading...</Text>
            <Text style={styles.statusMessage}>Your file is being processed. Please wait.</Text>
          </View>
        );
      case 'success':
        return (
          <View style={styles.statusBox}>
            <MaterialIcons name="check-circle" size={48} color="#2E7D32" />
            <Text style={[styles.statusTitle, {color: '#2E7D32'}]}>Upload Complete</Text>
            <Text style={styles.statusMessage}>{uploadResult?.successCount} products have been successfully added.</Text>
            <Button title="Upload Another File" onPress={resetState} outline style={{marginTop: 20}} />
          </View>
        );
      case 'error':
        return (
          <View style={styles.statusBox}>
            <MaterialIcons name="error" size={48} color="#D32F2F" />
            <Text style={[styles.statusTitle, {color: '#D32F2F'}]}>Upload Failed</Text>
            {uploadResult?.errorCount && uploadResult.errorCount > 0 ? (
              <Text style={styles.statusMessage}>{uploadResult.errorCount} rows have errors.</Text>
            ) : (
              <Text style={styles.statusMessage}>An unexpected error occurred.</Text>
            )}
            {uploadResult?.errors && uploadResult.errors.length > 0 && (
              <TouchableOpacity onPress={() => setIsErrorLogVisible(true)}>
                <Text style={styles.link}>View Error Log</Text>
              </TouchableOpacity>
            )}
            <Button title="Try Again" onPress={resetState} outline style={{marginTop: 20}} />
          </View>
        );
      case 'idle':
      default:
        return (
          <View style={styles.statusBox}>
            <MaterialIcons name="cloud-upload" size={48} color="#757575" />
            <Text style={styles.statusTitle}>Waiting for file upload...</Text>
            <Text style={styles.statusMessage}>Your upload status and results will appear here once you upload a file.</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><MaterialIcons name="arrow-back" size={24} color="#333" /></TouchableOpacity>
        <Text style={styles.title}>Bulk Product Upload</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.uploadCard}>
          <Button 
            title="Upload File" 
            onPress={handleChooseFile} 
            style={styles.uploadButton}
          />
          <Text style={styles.instructions}>Upload a CSV file with columns: Name, Category, Variety, Origin, Description, Price, Stock, AvailableKg, ImageUrl</Text>
          <TouchableOpacity onPress={handleDownloadFormat}><Text style={styles.link}>View Template Format</Text></TouchableOpacity>
          {selectedFile && (
            <View style={styles.fileInfo}>
              <MaterialIcons name="insert-drive-file" size={20} color="#2196F3" />
              <Text style={styles.fileName}>{selectedFile.name}</Text>
            </View>
          )}
          {selectedFile && <Button title="Upload" onPress={handleUpload} style={{marginTop: 15, width: '100%'}} disabled={uploadStatus === 'uploading'} />}
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.cardTitle}>Upload Status</Text>
          {renderStatusContent()}
        </View>
      </View>

      <Modal visible={isErrorLogVisible} transparent animationType="slide" onRequestClose={() => setIsErrorLogVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Error Log</Text>
            <FlatList
              data={uploadResult?.errors}
              keyExtractor={(item, index) => `error-${index}`}
              renderItem={({ item }) => (
                <View style={styles.rowInvalid}>
                  <Text style={styles.rowErrorText}>Row {item.row}: {item.error}</Text>
                  <Text style={styles.rowDataText}>Data: {JSON.stringify(item.data)}</Text>
                </View>
              )}
            />
            <Button title="Close" onPress={() => setIsErrorLogVisible(false)} style={{alignSelf: 'center', marginTop: 20}} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', padding: normalize(16), backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  backButton: { padding: normalize(8), marginRight: normalize(12) },
  title: { fontSize: normalize(18), fontWeight: 'bold', color: '#333', flex: 1, textAlign: 'center', marginRight: normalize(40) },
  content: { flex: 1, padding: wp(4) },
  uploadCard: { backgroundColor: '#fff', borderRadius: normalize(12), padding: normalize(24), alignItems: 'center', marginBottom: normalize(16), elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  uploadButton: { width: '100%', maxWidth: normalize(300), backgroundColor: '#FFC107', marginBottom: normalize(16) },
  statusCard: { backgroundColor: '#fff', borderRadius: normalize(12), padding: normalize(24), flex: 1, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  cardTitle: { fontSize: normalize(18), fontWeight: 'bold', color: '#333', marginBottom: normalize(16) },
  instructions: { fontSize: normalize(14), color: '#757575', textAlign: 'center', marginBottom: normalize(12), lineHeight: normalize(20) },
  link: { fontSize: normalize(14), color: '#2E7D32', textDecorationLine: 'underline', marginBottom: normalize(20), fontWeight: '500' },
  fileInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', padding: normalize(12), borderRadius: normalize(8), marginTop: normalize(12), gap: normalize(8), width: '100%' },
  fileName: { fontSize: normalize(14), color: '#333', flex: 1 },
  statusBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: normalize(40), paddingHorizontal: normalize(20), backgroundColor: '#F5F5F5', borderRadius: normalize(8), borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dashed' },
  statusTitle: { fontSize: normalize(18), fontWeight: '600', marginTop: normalize(16), color: '#333' },
  statusMessage: { fontSize: normalize(14), color: '#757575', textAlign: 'center', marginTop: normalize(8), lineHeight: normalize(20) },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: normalize(20), borderTopRightRadius: normalize(20), padding: normalize(20), height: '60%' },
  modalTitle: { fontSize: normalize(20), fontWeight: 'bold', marginBottom: normalize(15), textAlign: 'center' },
  rowInvalid: { backgroundColor: '#FFF0F0', padding: normalize(10), borderRadius: normalize(5), marginBottom: normalize(10) },
  rowErrorText: { fontSize: normalize(14), color: '#D32F2F', fontWeight: 'bold' },
  rowDataText: { fontSize: normalize(12), color: '#666', marginTop: normalize(4), fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' },
});
