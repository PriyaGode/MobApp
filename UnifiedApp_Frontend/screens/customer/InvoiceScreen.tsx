import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Share,
} from "react-native";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../themeTokens";

interface InvoiceItem {
  name: string;
  quantity: string;
  amount: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  totalAmount: number;
  customerName: string;
  customerAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  deliveryCharges: number;
  tax: number;
  discount: number;
  transactionId: string;
  orderReference: string;
  paymentMethod: string;
}

export default function InvoiceScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { invoiceData } = route.params as { invoiceData: InvoiceData };

  const handleDownloadInvoice = async () => {
    try {
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoiceData.invoiceNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #F5AD05; padding-bottom: 20px; }
    .company { font-size: 28px; font-weight: bold; color: #F5AD05; margin-bottom: 10px; }
    .company-address { color: #666; font-size: 14px; }
    .invoice-info { display: flex; justify-content: space-between; margin: 30px 0; }
    .total-section { text-align: center; background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .total-amount { font-size: 36px; font-weight: bold; color: #F5AD05; margin: 10px 0; }
    .success-badge { display: inline-block; background: #d4edda; color: #155724; padding: 8px 16px; border-radius: 20px; font-size: 14px; }
    .billing-section { margin: 30px 0; }
    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    .items-table th { background: #f8f9fa; font-weight: bold; }
    .summary-section { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .summary-row { display: flex; justify-content: space-between; margin: 8px 0; }
    .total-row { border-top: 2px solid #F5AD05; padding-top: 10px; margin-top: 10px; font-weight: bold; font-size: 18px; }
    .transaction-section { margin: 30px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company">AAMRAJ</div>
    <div class="company-address">Ratnagiri Estate, Block 4, Maharashtra, 415612</div>
  </div>
  
  <div class="invoice-info">
    <div><strong>Invoice Number:</strong> ${invoiceData.invoiceNumber}</div>
    <div><strong>Date:</strong> ${invoiceData.date}</div>
  </div>
  
  <div class="total-section">
    <div style="color: #666; font-size: 14px;">Total Amount Paid</div>
    <div class="total-amount">₹${invoiceData.totalAmount.toFixed(2)}</div>
    <div class="success-badge">✓ Payment Successful</div>
  </div>
  
  <div class="billing-section">
    <strong>Bill To:</strong><br>
    ${invoiceData.customerName}<br>
    ${invoiceData.customerAddress}
  </div>
  
  <table class="items-table">
    <thead>
      <tr>
        <th>Item Description</th>
        <th>Quantity</th>
        <th style="text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${invoiceData.items.map(item => `
        <tr>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td style="text-align: right;">₹${item.amount.toFixed(2)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <div class="summary-section">
    <div class="summary-row">
      <span>Subtotal:</span>
      <span>₹${invoiceData.subtotal.toFixed(2)}</span>
    </div>
    <div class="summary-row">
      <span>Delivery Charges:</span>
      <span>${invoiceData.deliveryCharges === 0 ? 'Free' : '₹' + invoiceData.deliveryCharges.toFixed(2)}</span>
    </div>
    <div class="summary-row">
      <span>Tax (GST):</span>
      <span>₹${invoiceData.tax.toFixed(2)}</span>
    </div>
    <div class="summary-row">
      <span>Discount:</span>
      <span style="color: #dc3545;">-₹${invoiceData.discount.toFixed(2)}</span>
    </div>
    <div class="summary-row total-row">
      <span>Grand Total:</span>
      <span>₹${invoiceData.totalAmount.toFixed(2)}</span>
    </div>
  </div>
  
  <div class="transaction-section">
    <h3>Transaction Information</h3>
    <p><strong>Payment Method:</strong> ${invoiceData.paymentMethod}</p>
    <p><strong>Transaction ID:</strong> ${invoiceData.transactionId}</p>
    <p><strong>Order Reference:</strong> ${invoiceData.orderReference}</p>
  </div>
</body>
</html>`;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Download Invoice PDF'
        });
      } else {
        Alert.alert('Success', 'PDF generated successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  const handleEmailInvoice = async () => {
    try {
      await Share.share({
        message: `Invoice #${invoiceData.invoiceNumber} - Total: ₹${invoiceData.totalAmount.toFixed(2)}`,
        title: 'Invoice Details',
      });
    } catch (error) {
      console.error('Error sharing invoice:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invoice Details</Text>
        <TouchableOpacity style={styles.moreButton}>
          <MaterialIcons name="more-vert" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Total Amount Card */}
        <View style={styles.totalCard}>
          <View style={styles.decorativeCircle} />
          <Text style={styles.totalLabel}>Total Amount Paid</Text>
          <Text style={styles.totalAmount}>₹{invoiceData.totalAmount.toFixed(2)}</Text>
          <View style={styles.successBadge}>
            <MaterialIcons name="check-circle" size={16} color="#10B981" />
            <Text style={styles.successText}>Payment Successful</Text>
          </View>
        </View>

        {/* Invoice Info Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <MaterialIcons name="receipt" size={18} color={colors.primary} />
              <Text style={styles.infoHeaderText}>INVOICE NO</Text>
            </View>
            <Text style={styles.infoValue}>{invoiceData.invoiceNumber}</Text>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <MaterialIcons name="event" size={18} color={colors.primary} />
              <Text style={styles.infoHeaderText}>DATE</Text>
            </View>
            <Text style={styles.infoValue}>{invoiceData.date}</Text>
          </View>
        </View>

        {/* Invoice Details Card */}
        <View style={styles.invoiceCard}>
          {/* Header Section */}
          <View style={styles.invoiceHeader}>
            <View>
              <View style={styles.companyHeader}>
                <MaterialIcons name="spa" size={20} color={colors.primary} />
                <Text style={styles.companyName}>AAMRAJ</Text>
              </View>
              <Text style={styles.companyAddress}>
                Ratnagiri Estate, Block 4,{'\n'}Maharashtra, 415612
              </Text>
            </View>
            <View style={styles.billedTo}>
              <Text style={styles.billedToLabel}>BILLED TO</Text>
              <Text style={styles.customerName}>{invoiceData.customerName}</Text>
              <Text style={styles.customerAddress}>{invoiceData.customerAddress}</Text>
            </View>
          </View>

          {/* Items Section */}
          <View style={styles.itemsSection}>
            <View style={styles.itemsHeader}>
              <Text style={styles.itemsHeaderText}>Item Description</Text>
              <Text style={styles.itemsHeaderText}>Amount</Text>
            </View>
            
            {invoiceData.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                </View>
                <Text style={styles.itemAmount}>₹{item.amount.toFixed(2)}</Text>
              </View>
            ))}
          </View>

          {/* Summary Section */}
          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{invoiceData.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Charges</Text>
              <Text style={[styles.summaryValue, styles.freeText]}>
                {invoiceData.deliveryCharges === 0 ? 'Free' : `₹${invoiceData.deliveryCharges.toFixed(2)}`}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (GST)</Text>
              <Text style={styles.summaryValue}>₹{invoiceData.tax.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount (Summer Sale)</Text>
              <Text style={[styles.summaryValue, styles.discountText]}>-₹{invoiceData.discount.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>₹{invoiceData.totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Transaction Information Card */}
        <View style={styles.transactionCard}>
          <Text style={styles.transactionTitle}>TRANSACTION INFORMATION</Text>
          
          <View style={styles.paymentMethodRow}>
            <View style={styles.paymentIcon}>
              <MaterialIcons name="credit-card" size={16} color="#3B82F6" />
            </View>
            <View>
              <Text style={styles.paymentMethodLabel}>Payment Method</Text>
              <Text style={styles.paymentMethodValue}>{invoiceData.paymentMethod}</Text>
            </View>
          </View>

          <View style={styles.transactionGrid}>
            <View>
              <Text style={styles.transactionLabel}>Transaction ID</Text>
              <Text style={styles.transactionValue}>{invoiceData.transactionId}</Text>
            </View>
            <View style={styles.orderRefSection}>
              <Text style={styles.transactionLabel}>Order Reference</Text>
              <Text style={styles.transactionValue}>{invoiceData.orderReference}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadInvoice}>
            <MaterialIcons name="picture-as-pdf" size={20} color="#FFFFFF" />
            <Text style={styles.downloadButtonText}>Download Invoice</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    flex: 1,
    textAlign: "center",
  },
  moreButton: {
    padding: 8,
    borderRadius: 20,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  totalCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 10,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  decorativeCircle: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: `${colors.primary}10`,
  },
  totalLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 16,
  },
  successBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  successText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
  },
  infoGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },
  infoCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  infoHeaderText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.primary,
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  invoiceCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 18,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  invoiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  companyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  companyName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  companyAddress: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  billedTo: {
    alignItems: "flex-end",
  },
  billedToLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  customerAddress: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  itemsSection: {
    marginBottom: 18,
  },
  itemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 12,
  },
  itemsHeaderText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
    paddingRight: 16,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  itemAmount: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary,
    fontFamily: "monospace",
  },
  summarySection: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary,
    fontFamily: "monospace",
  },
  freeText: {
    color: "#10B981",
  },
  discountText: {
    color: "#EF4444",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 8,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
    fontFamily: "monospace",
  },
  transactionCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  transactionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 12,
  },
  paymentMethodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  paymentIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  paymentMethodLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  paymentMethodValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: 2,
  },
  transactionGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
  },
  orderRefSection: {
    alignItems: "flex-end",
  },
  transactionLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  transactionValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary,
    fontFamily: "monospace",
    marginTop: 2,
  },
  actionButtons: {
    gap: 8,
    paddingBottom: 16,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  downloadButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },

});