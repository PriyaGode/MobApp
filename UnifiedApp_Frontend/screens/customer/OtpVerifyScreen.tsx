import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  ScrollView,
  Image,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Button from "../../components/customer/Button";
import { sendOtp, verifyOtp } from "../../services/otpService";
import type { RootStackParamList } from "../../App";
import * as Clipboard from "expo-clipboard";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

type Props = NativeStackScreenProps<RootStackParamList, "OtpVerify">;

export default function OtpVerifyScreen({ navigation, route }: Props) {
  const { phoneE164, isExistingUser, deviceId, channel, debugCode: initialDebugCode } = route.params;

  const [digits, setDigits] = useState<string[]>(Array.from({ length: OTP_LENGTH }, () => ""));
  const [activeIndex, setActiveIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [debugCode, setDebugCode] = useState(initialDebugCode);
  const [isPasting, setIsPasting] = useState(false);
  const inputsRef = useRef<Array<TextInput | null>>([]);

  const channelLabel = channel === "voice" ? "voice call" : "text message";
  const combinedCode = useMemo(() => digits.join(""), [digits]);

  // Focus first input on mount
  useEffect(() => {
    const focusTimeout = setTimeout(() => {
      inputsRef.current[0]?.focus();
    }, 300);
    return () => clearTimeout(focusTimeout);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (cooldown > 0) timer = setTimeout(() => setCooldown(prev => Math.max(0, prev - 1)), 1000);
    return () => { if (timer) clearTimeout(timer); };
  }, [cooldown]);

  useEffect(() => {
    if (!debugCode) return;
    Clipboard.setStringAsync(debugCode).catch(() => {});
  }, [debugCode]);

  const updateDigit = (index: number, value: string) => {
    const sanitized = value.replace(/\D/g, "");
    if (!sanitized) {
      setDigits(prev => { const next = [...prev]; next[index] = ""; return next; });
      return;
    }
    const characters = sanitized.slice(0, OTP_LENGTH - index).split("");
    setDigits(prev => { const next = [...prev]; characters.forEach((char, offset) => { if (index + offset < OTP_LENGTH) next[index + offset] = char; }); return next; });
    const nextIndex = Math.min(index + characters.length, OTP_LENGTH - 1);
    inputsRef.current[nextIndex]?.focus();
    setActiveIndex(nextIndex);
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === "Backspace" && digits[index] === "" && index > 0) {
      inputsRef.current[index - 1]?.focus();
      setActiveIndex(index - 1);
    }
  };

  const handleVerify = async () => {
    if (combinedCode.length < OTP_LENGTH || isVerifying) return;
    Keyboard.dismiss();
    setIsVerifying(true);
    setErrorMessage(null);
    try {
      const success = await verifyOtp({ phoneE164, code: combinedCode });
      setIsVerifying(false);

      if (success) {
        if (isExistingUser) {
          navigation.reset({ index: 0, routes: [{ name: "Home" }] });
        } else {
          navigation.replace("CompleteProfile", { phoneE164 });
        }
      } else {
        setErrorMessage("Incorrect or expired code. Please try again.");
        setDigits(Array.from({ length: OTP_LENGTH }, () => ""));
        inputsRef.current[0]?.focus();
        setActiveIndex(0);
      }
    } catch (error) {
      console.error(error);
      setIsVerifying(false);
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      const result = await sendOtp({ phoneE164, deviceId, channel: "sms" });
      setDebugCode(result.debugCode);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setErrorMessage(null);
      setDigits(Array.from({ length: OTP_LENGTH }, () => ""));
      inputsRef.current[0]?.focus();
    } catch (error: any) {
      if (error?.code === "RESEND_TOO_SOON") { setCooldown(RESEND_COOLDOWN_SECONDS); return; }
      if (error?.code === "RATE_LIMITED") { Alert.alert("Slow down", "Too many requests. Try again later."); return; }
      Alert.alert("Error", "We could not resend the code. Please try again.");
    }
  };

  const handlePasteFromClipboard = async () => {
    setIsPasting(true);
    try {
      const hasContent = await Clipboard.hasStringAsync();
      if (!hasContent) { setErrorMessage("Clipboard is empty."); return; }
      const clipboardContent = await Clipboard.getStringAsync();
      const sanitized = clipboardContent.replace(/\D/g, "");
      if (sanitized.length !== OTP_LENGTH) { setErrorMessage(`Clipboard must contain a ${OTP_LENGTH}-digit code.`); return; }
      const digitsArray = sanitized.split("").slice(0, OTP_LENGTH);
      setDigits(digitsArray);
      setActiveIndex(OTP_LENGTH - 1);
      setTimeout(() => { inputsRef.current[OTP_LENGTH - 1]?.focus(); }, 0);
      setErrorMessage(null);
    } finally { setIsPasting(false); }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 20 }}>
        <View style={styles.container}>
          <Text style={styles.title}>Verify mobile phone</Text>
          <Text style={styles.subtitle}>
            We sent a {channelLabel} to {phoneE164}.
          </Text>

          <View style={styles.illustrationContainer}>
            <View style={styles.circleBackground}>
              <Image source={require("../../assets/phone.png")} style={{ width: 90, height: 90, resizeMode: "contain" }} />
            </View>
          </View>

          <View style={styles.digitRow}>
            {digits.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => (inputsRef.current[index] = ref)}
                style={[styles.digitInput, activeIndex === index && styles.digitInputActive]}
                keyboardType="number-pad"
                returnKeyType="done"
                maxLength={1}
                value={digit}
                onChangeText={value => updateDigit(index, value)}
                onFocus={() => setActiveIndex(index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
              />
            ))}
          </View>

          {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

          <Button title={isVerifying ? "Verifying..." : "Continue"} onPress={handleVerify} disabled={isVerifying || combinedCode.length < OTP_LENGTH} />

          <TouchableOpacity style={styles.pasteButton} onPress={handlePasteFromClipboard} disabled={isPasting}>
            <Text style={[styles.pasteText, isPasting && styles.resendDisabled]}>{isPasting ? "Reading clipboard..." : "Paste code from clipboard"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resendContainer} onPress={handleResend} disabled={cooldown > 0 || isVerifying}>
            <Text style={[styles.resendText, (cooldown > 0 || isVerifying) && styles.resendDisabled]}>
              {cooldown > 0 ? `Resend SMS in ${cooldown}s` : "Resend SMS"}
            </Text>
          </TouchableOpacity>

          {debugCode && <Text style={styles.debugHint}>Dev only: <Text style={styles.debugCode}>{debugCode}</Text></Text>}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  subtitle: { fontSize: 16, textAlign: "center", marginBottom: 20, color: "#555" },
  illustrationContainer: { alignItems: "center", marginBottom: 20 },
  circleBackground: { width: 140, height: 140, borderRadius: 70, backgroundColor: "#e4f1ff", justifyContent: "center", alignItems: "center" },
  digitRow: { flexDirection: "row", justifyContent: "center", alignSelf: "center", marginBottom: 20 },
  digitInput: { width: 50, height: 55, borderWidth: 1, borderColor: "#ccc", borderRadius: 10, textAlign: "center", fontSize: 20, marginHorizontal: 5 },
  digitInputActive: { borderColor: "#007bff" },
  error: { color: "#D32F2F", marginBottom: 16 },
  resendContainer: { marginTop: 20 },
  resendText: { color: "#007bff", textAlign: "center", fontWeight: "600" },
  resendDisabled: { color: "#90CAF9" },
  pasteButton: { marginTop: 12 },
  pasteText: { color: "#007bff" },
  debugHint: { marginTop: 15, color: "#444" },
  debugCode: { fontWeight: "bold" },
});
