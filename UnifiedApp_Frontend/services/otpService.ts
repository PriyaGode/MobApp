
import { API } from "../config/apiConfig";



interface SendOtpRequest {
  phoneE164: string;
  deviceId?: string;
  channel?: "sms" | "voice";
}

interface SendOtpResponse {
  status: number;
  message: string;
  channel?: string;
  debugCode?: string; // Keep for development/debug
}

export async function sendOtp({ phoneE164, deviceId, channel = "sms" }: SendOtpRequest): Promise<SendOtpResponse> {
  try {
    const response = await fetch(API.send_phone_otp, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone: phoneE164 }), // backend expects { "phone": "+11234567890" }
    });

    if (!response.ok) {
      // Try to parse error message if returned by backend
      const errorData = await response.json().catch(() => null);
      throw { code: errorData?.code || "SERVER_ERROR", message: errorData?.message || "Server error" };
    }

    const data = await response.json();

    // Merge old debugCode logic if backend returns it
    return {
      status: data.status,
      message: data.message,
      channel: channel.toUpperCase(),
      debugCode: data?.data?.otp || undefined,
    };
  } catch (error: any) {
    console.error("❌ Error sending OTP:", error);
    throw error;
  }
}

interface VerifyOtpRequest {
  phoneE164: string;
  code: string;
  deviceId?: string;
}

export async function verifyOtp({ phoneE164, code }: VerifyOtpRequest) {
  try {
      alert("6 digit code :  "+code)
    const response = await fetch(API.verify_phone_otp, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phoneE164, otp: code }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("❌ OTP verification failed:", errorData);
      return false;
    }

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("❌ OTP verification error:", error);
    return false;
  }







}
