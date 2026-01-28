import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Button from "../../components/customer/Button";
import { getDeviceFingerprint } from "../../utils/deviceId";
import {
  COUNTRY_OPTIONS,
  CountryOption,
  formatNationalNumber,
  normalizePhoneNumber,
  isValidForCountry,
  stripNonDigits,
} from "../../utils/phone";
import { sendOtp } from "../../services/otpService";
import { isPhoneRegistered } from "../../data/userStore";
import type { RootStackParamList } from "../../App";

type Props = NativeStackScreenProps<RootStackParamList, "PhoneEntry">;

export default function PhoneEntryScreen({ navigation }: Props) {
  const [country, setCountry] = useState<CountryOption>(COUNTRY_OPTIONS[0]);
  const [nationalNumber, setNationalNumber] = useState("");
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    getDeviceFingerprint().then(setDeviceId);
  }, []);

  const formattedNumber = useMemo(
    () => formatNationalNumber(country.iso2, country.dialCode, nationalNumber),
    [country.dialCode, country.iso2, nationalNumber]
  );

  const phoneE164 = useMemo(
    () => normalizePhoneNumber(country.dialCode, nationalNumber),
    [country.dialCode, nationalNumber]
  );

  const isExistingUser = useMemo(() => isPhoneRegistered(phoneE164), [phoneE164]);
  const numericLength = stripNonDigits(nationalNumber).length;

  const isNumberValid = useMemo(
    () =>
      numericLength > 0 &&
      isValidForCountry(country.iso2, country.dialCode, nationalNumber),
    [country.dialCode, country.iso2, nationalNumber, numericLength]
  );

  const validationMessage = useMemo(() => {
    if (numericLength === 0) return null;
    if (!isNumberValid && numericLength > 0)
      return `Enter a valid ${country.name} mobile number.`;
    return null;
  }, [country.name, isNumberValid, numericLength]);

  const canSubmit = isNumberValid && !!deviceId && !isSubmitting;

  const handleSubmit = async () => {
    if (!deviceId) {
      Alert.alert("Please wait", "Preparing secure session. Try again shortly.");
      return;
    }

    if (!isNumberValid) {
      setErrorMessage(`Enter a valid ${country.name} mobile number.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await sendOtp({ phoneE164, deviceId });

      navigation.navigate("OtpVerify", {
        phoneE164,
        isExistingUser,
        deviceId,
        channel: result.channel || "SMS",
      });
    } catch (error: any) {
      const code = error?.code;
      const messageMap: Record<string, string> = {
        PHONE_BLOCKED: "This phone number has been blocked. Contact support.",
        RATE_LIMITED: "Too many attempts. Try again later.",
        INVALID_PHONE: "Enter a valid phone number.",
        DEVICE_BLOCKED: "This device is blocked from requesting OTPs.",
        SERVICE_UNAVAILABLE: "OTP service is temporarily unavailable. Try again soon.",
      };
      setErrorMessage(messageMap[code] || "We couldn’t send the code. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flexContainer}
      >
        <View style={styles.container}>
          <Text style={styles.title}>What's your number?</Text>
          <Text style={styles.subtitle}>
            We'll text you a code to verify your phone.
          </Text>

          {/* Country selector */}
          <TouchableOpacity
            style={styles.countrySelector}
            onPress={() => setIsCountryModalOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.countryText}>{country.name}</Text>
          </TouchableOpacity>

          {/* Phone input */}
          <TextInput
            keyboardType="phone-pad"
            style={styles.input}
            placeholder={country.sampleFormat || "Enter phone number"}
            value={nationalNumber}
            onChangeText={(value) => {
              if (errorMessage) setErrorMessage(null);
              setNationalNumber(value);
            }}
            textContentType="telephoneNumber"
            autoComplete="tel"
            maxLength={20}
          />

          {/* Validation/Error messages */}
          {isExistingUser && (
            <Text style={styles.infoText}>
              This phone number is already in use.{" "}
              <Text
                style={styles.linkText}
                onPress={() => navigation.navigate("Login")}
              >
                Log in instead?
              </Text>
            </Text>
          )}

          {validationMessage && (
            <Text style={styles.errorText}>{validationMessage}</Text>
          )}
          {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

          {/* Continue button */}
          <View style={styles.buttonWrapper}>
            <Button
              title={isSubmitting ? "Sending..." : "Continue"}
              onPress={handleSubmit}
              disabled={!canSubmit}
            />
          </View>

          {isSubmitting && (
            <ActivityIndicator size="small" color="#0066FF" style={{ marginTop: 10 }} />
          )}
        </View>

        {/* Country Selector Modal */}
        <Modal visible={isCountryModalOpen} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <FlatList
                data={COUNTRY_OPTIONS}
                keyExtractor={(item) => item.iso2}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setCountry(item);
                      setIsCountryModalOpen(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.modalItemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                onPress={() => setIsCountryModalOpen(false)}
                style={styles.closeBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  flexContainer: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111",
    marginBottom: 6,
  },
  subtitle: {
    color: "#666",
    fontSize: 15,
    marginBottom: 20,
    textAlign: "center",
  },
  countrySelector: {
    width: "80%",
    borderColor: "#e0e0e0",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fafafa",
    marginBottom: 10,
  },
  countryText: { fontSize: 16, fontWeight: "500", color: "#222" },
  input: {
    width: "80%",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#111",
  },
  infoText: {
    marginTop: 10,
    color: "#444",
    width: "80%",
    textAlign: "left",
  },
  linkText: {
    color: "#0066FF",
    fontWeight: "500",
  },
  errorText: {
    color: "#D32F2F",
    marginTop: 8,
    fontSize: 14,
    width: "80%",
    textAlign: "left",
  },
  buttonWrapper: {
    width: "80%",
    marginTop: 16,
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  modalItem: { paddingVertical: 12 },
  modalItemText: { fontSize: 16, color: "#222" },
  closeBtn: {
    marginTop: 16,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  closeBtnText: { color: "#0066FF", fontSize: 16, fontWeight: "600" },
});
