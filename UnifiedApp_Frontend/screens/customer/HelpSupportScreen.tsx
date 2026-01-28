import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../themeTokens";
import { API_BASE } from "../../services/apiBase";
import { AuthContext } from "../../contexts/AuthContext";
import { useContext } from 'react';

interface HelpSupportParams {
  orderId?: string;
  orderItems?: string;
}

export default function HelpSupportScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useContext(AuthContext);
  const params = route.params as HelpSupportParams;
  const [searchQuery, setSearchQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChatSupport = () => {
    (navigation as any).navigate('Chat', {
      orderId: params?.orderId,
      orderItems: params?.orderItems
    });
  };

  const handleCallSupport = () => {
    Linking.openURL("tel:+918000000000");
  };

  const handleEmailSupport = () => {
    Linking.openURL("mailto:support@aamraj.com");
  };

  const handleSubmitRequest = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert("Error", "Please fill in both subject and message fields.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const userId = (user?.userId || user?.id)?.toString() || 'customer123';
      console.log('Creating ticket for user ID:', userId);
      
      const response = await fetch(`${API_BASE}/api/customer/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
        body: JSON.stringify({
          subject: subject.trim(),
          message: message.trim(),
          category: 'General'
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const result = await response.json();
        Alert.alert(
          "Request Submitted", 
          `Your support ticket ${result.ticketNumber} has been created successfully. We'll get back to you within 24 hours.`,
          [{ 
            text: "View Tickets", 
            onPress: () => {
              setSubject(""); 
              setMessage(""); 
              (navigation as any).navigate('SupportTickets');
            }
          }]
        );
      } else {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to submit request');
      }
    } catch (error: any) {
      console.error('Submit request error:', error);
      if (error.name === 'AbortError') {
        Alert.alert("Error", "Request timeout. Please try again.");
      } else {
        Alert.alert("Error", `Failed to submit your request: ${error.message || 'Network error'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewTickets = () => {
    (navigation as any).navigate('SupportTickets');
  };

  const handleFAQPress = (question: string) => {
    let title = "";
    let message = "";
    
    switch (question) {
      case "How do I track my delivery?":
        title = "Track Your Delivery";
        message = "You can track your order in real-time:\n\n• Go to 'My Orders' from your profile\n• Select your order to view tracking details\n• You'll receive SMS updates at each stage\n• Use the 'Track Order' button for live location\n\nDelivery typically takes 2-5 business days.";
        break;
      case "Mango quality guarantee":
        title = "Quality Guarantee";
        message = "We guarantee the freshness and quality of our mangoes:\n\n• Hand-picked from certified farms\n• Packed with care to prevent damage\n• 100% freshness guarantee\n• Free replacement if not satisfied\n• Quality checked before dispatch\n\nIf you're not happy with the quality, contact us within 24 hours of delivery.";
        break;
      case "Refunds & Returns Policy":
        title = "Refunds & Returns";
        message = "Our return policy:\n\n• 24-hour return window for quality issues\n• Full refund for damaged/spoiled items\n• Refunds processed within 3-5 business days\n• No questions asked for quality concerns\n• Contact support with photos for quick resolution\n\nNote: Returns accepted only for quality issues, not change of mind.";
        break;
      case "Change delivery address":
        title = "Change Delivery Address";
        message = "To change your delivery address:\n\n• Contact us immediately after placing order\n• Address can be changed before dispatch\n• Call +91 8000000000 or use chat\n• Provide your order ID for quick service\n• Changes may affect delivery timeline\n\nOnce dispatched, address cannot be changed.";
        break;
      default:
        title = "FAQ";
        message = `Information about: ${question}`;
    }
    
    Alert.alert(title, message, [{ text: "Got it", style: "default" }]);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Section */}
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitleSmall}>How can we help?</Text>
        </View>

        {/* Order Info Banner */}
        {params?.orderId && (
          <View style={styles.orderBanner}>
            <MaterialIcons name="info" size={20} color="#3B82F6" />
            <View style={styles.orderBannerContent}>
              <Text style={styles.orderBannerTitle}>Regarding Order #{params.orderId}</Text>
              <Text style={styles.orderBannerText}>
                You are viewing support options for your recent order{params.orderItems ? ` of ${params.orderItems}` : ''}.
              </Text>
            </View>
          </View>
        )}

        {/* Send Message Form */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SEND US A MESSAGE</Text>
          
          <View style={styles.formContainer}>
            <TextInput
              style={styles.formInput}
              placeholder="Subject"
              placeholderTextColor="#9CA3AF"
              value={subject}
              onChangeText={setSubject}
            />
            
            <TextInput
              style={[styles.formInput, styles.messageInput]}
              placeholder="Your Message"
              placeholderTextColor="#9CA3AF"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <TouchableOpacity 
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
              onPress={handleSubmitRequest}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Request</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Support */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CONTACT SUPPORT</Text>
          
          <View style={styles.contactGrid}>
            <View style={styles.contactRow}>
              <TouchableOpacity style={styles.contactCardSmall} onPress={handleCallSupport}>
                <View style={styles.contactIconSmall}>
                  <MaterialIcons name="phone-in-talk" size={16} color="#10B981" />
                </View>
                <Text style={styles.contactTitleSmall}>Call Us</Text>
                <Text style={styles.contactSubtitleSmall}>Mon-Sat, 9am-6pm</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.contactCardSmall} onPress={handleEmailSupport}>
                <View style={[styles.contactIconSmall, styles.emailIcon]}>
                  <MaterialIcons name="mail" size={16} color="#6366F1" />
                </View>
                <Text style={styles.contactTitleSmall}>Email Us</Text>
                <Text style={styles.contactSubtitleSmall}>Replies in 24 hrs</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.chatButtonSmall} onPress={handleChatSupport}>
              <View style={styles.chatButtonContent}>
                <View style={styles.chatIconSmall}>
                  <MaterialIcons name="chat-bubble" size={20} color="#fff" />
                </View>
                <View style={styles.chatTextContainer}>
                  <Text style={styles.chatTitleSmall}>Chat with Us</Text>
                  <Text style={styles.chatSubtitleSmall}>Typically replies in 2 min</Text>
                </View>
              </View>
              <MaterialIcons name="arrow-forward" size={16} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>
        </View>

        {/* View Support Tickets */}
        <TouchableOpacity style={styles.ticketsButton} onPress={handleViewTickets}>
          <View style={styles.ticketsButtonContent}>
            <View style={styles.ticketsIcon}>
              <MaterialIcons name="receipt-long" size={24} color={colors.primary} />
            </View>
            <View style={styles.ticketsTextContainer}>
              <Text style={styles.ticketsTitle}>View Support Tickets</Text>
              <Text style={styles.ticketsSubtitle}>Check status of past complaints</Text>
            </View>
          </View>
          <View style={styles.ticketsArrow}>
            <MaterialIcons name="arrow-forward" size={16} color="#9CA3AF" />
          </View>
        </TouchableOpacity>

        {/* Common Questions */}
        <View style={styles.section}>
          <View style={styles.faqHeader}>
            <Text style={styles.sectionLabel}>COMMON QUESTIONS</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.faqContainer}>
            <TouchableOpacity 
              style={styles.faqItem} 
              onPress={() => handleFAQPress("How do I track my delivery?")}
            >
              <View style={styles.faqContent}>
                <MaterialIcons name="local-shipping" size={18} color="#9CA3AF" />
                <Text style={styles.faqText}>How do I track my delivery?</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#D1D5DB" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.faqItem} 
              onPress={() => handleFAQPress("Mango quality guarantee")}
            >
              <View style={styles.faqContent}>
                <MaterialIcons name="eco" size={18} color="#9CA3AF" />
                <Text style={styles.faqText}>Mango quality guarantee</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#D1D5DB" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.faqItem} 
              onPress={() => handleFAQPress("Refunds & Returns Policy")}
            >
              <View style={styles.faqContent}>
                <MaterialIcons name="currency-rupee" size={18} color="#9CA3AF" />
                <Text style={styles.faqText}>Refunds & Returns Policy</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#D1D5DB" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.faqItem} 
              onPress={() => handleFAQPress("Change delivery address")}
            >
              <View style={styles.faqContent}>
                <MaterialIcons name="edit-location" size={18} color="#9CA3AF" />
                <Text style={styles.faqText}>Change delivery address</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          </View>
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
    marginLeft: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  searchSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 16,
  },
  sectionTitleSmall: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 16,
  },
  orderBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  orderBannerContent: {
    flex: 1,
  },
  orderBannerTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E40AF",
    marginBottom: 4,
  },
  orderBannerText: {
    fontSize: 12,
    color: "#1D4ED8",
    lineHeight: 18,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 16,
    marginLeft: 4,
  },
  contactGrid: {
    gap: 16,
  },
  contactRow: {
    flexDirection: "row",
    gap: 16,
  },
  chatButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  chatButtonSmall: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  chatButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  chatIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  chatIconSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  chatTextContainer: {
    alignItems: "flex-start",
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  chatTitleSmall: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  chatSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
    marginTop: 4,
  },
  chatSubtitleSmall: {
    fontSize: 10,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
    marginTop: 2,
  },
  contactCard: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    flex: 1,
  },
  contactCardSmall: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    flex: 1,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
  },
  contactIconSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
  },
  emailIcon: {
    backgroundColor: "#E0E7FF",
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  contactTitleSmall: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  contactSubtitle: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  contactSubtitleSmall: {
    fontSize: 9,
    color: colors.textSecondary,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginLeft: 4,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  faqContainer: {
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    overflow: "hidden",
  },
  faqItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  faqContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    flex: 1,
  },
  faqText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary,
    flex: 1,
  },
  formContainer: {
    gap: 16,
  },
  formInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: "500",
    color: colors.textPrimary,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  messageInput: {
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  ticketsButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  ticketsButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  ticketsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },
  ticketsTextContainer: {
    alignItems: "flex-start",
  },
  ticketsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  ticketsSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
    marginTop: 4,
  },
  ticketsArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
});