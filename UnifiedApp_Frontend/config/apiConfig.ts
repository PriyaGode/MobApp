// config/apiConfig.ts
import { CUSTOMER_API_BASE_URL } from '../config';

// Customer portal backend - now using Unified Backend with /api/customer prefix
const BASE_URL = CUSTOMER_API_BASE_URL;

console.log('Customer API BASE_URL:', BASE_URL);


export const API = {
  LOGIN: `${BASE_URL}/auth/login`,
    REGISTER: `${BASE_URL}/auth/register`,
    VERIFY_EMAIL: `${BASE_URL}/auth/verify-otp`,
    RESEND_OTP: `${BASE_URL}/auth/resend-otp`,
    CHECK_EMAIL: `${BASE_URL}/auth/check-email`,
    FORGOT_PASSWORD: `${BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${BASE_URL}/auth/reset-password`,
    SEND_RESET_OTP: `${BASE_URL}/auth/send-reset-otp`,
    VERIFY_RESET_EMAIL_OTP: `${BASE_URL}/auth/verify-reset-email-otp`,
    UPDATE_PASSWORD: `${BASE_URL}/auth/update-password`,
    send_phone_otp: `${BASE_URL}/auth/send-phone-otp`,
    verify_phone_otp: `${BASE_URL}/auth/verify-phone-otp`,
    UPDATE_PROFILE: `${BASE_URL}/auth/update-profile`,

  
  // Product endpoints
  GET_PRODUCTS: `${BASE_URL}/products`,
  
  // User profile endpoints
  GET_USER_PROFILE: (userId: number) => `${BASE_URL}/users/profile/${userId}`,
  UPDATE_USER_PROFILE: (userId: number) => `${BASE_URL}/users/profile/${userId}`,
  
  // Address endpoints
  GET_USER_ADDRESSES: (userId: number) => `${BASE_URL}/addresses/user/${userId}`,
  GET_DEFAULT_ADDRESS: (userId: number) => `${BASE_URL}/addresses/user/${userId}/default`,
  CREATE_ADDRESS: (userId: number) => `${BASE_URL}/addresses/user/${userId}`,
  UPDATE_ADDRESS: (userId: number, addressId: number) => `${BASE_URL}/addresses/user/${userId}/${addressId}`,
  DELETE_ADDRESS: (userId: number, addressId: number) => `${BASE_URL}/addresses/user/${userId}/${addressId}`,
  SET_DEFAULT_ADDRESS: (userId: number, addressId: number) => `${BASE_URL}/addresses/user/${userId}/${addressId}/default`,
  
  // Favorites endpoints
  GET_USER_FAVORITES: (userId: number) => `${BASE_URL}/favorites/user/${userId}`,
  ADD_FAVORITE: (userId: number) => `${BASE_URL}/favorites/user/${userId}`,
  REMOVE_FAVORITE: (userId: number, productId: number) => `${BASE_URL}/favorites/user/${userId}/product/${productId}`,
  CHECK_FAVORITE: (userId: number, productId: number) => `${BASE_URL}/favorites/user/${userId}/product/${productId}/check`,
  
  // Order endpoints
  CREATE_ORDER: `${BASE_URL}/orders`,
  GET_ORDER: (orderId: string) => `${BASE_URL}/orders/${orderId}`,
  GET_ORDER_TRACKING: (orderId: string) => `${BASE_URL}/orders/${orderId}/tracking`,
  GET_USER_ORDERS: (userId: number) => `${BASE_URL}/orders/user/${userId}`,
  UPDATE_ORDER_STATUS: (orderId: string) => `${BASE_URL}/orders/${orderId}/status`,
  
  // Payment endpoints
  PROCESS_PAYMENT: `${BASE_URL}/payments/process`,
  GET_PAYMENT_STATUS: (orderId: string) => `${BASE_URL}/payments/status/${orderId}`,
  REFUND_PAYMENT: (orderId: string) => `${BASE_URL}/payments/refund/${orderId}`,
  
  // Review endpoints
  CREATE_REVIEW: (userId: number) => `${BASE_URL}/reviews/user/${userId}`,
  GET_PRODUCT_REVIEWS: (productId: number) => `${BASE_URL}/reviews/product/${productId}`,
  
  // Promo code endpoints
  VALIDATE_PROMO: `${BASE_URL}/promo/validate`,
  
  // User-specific product discount endpoints
  GET_USER_PRODUCT_DISCOUNTS: (userId: number) => `${BASE_URL}/discounts/user/${userId}`,
};
