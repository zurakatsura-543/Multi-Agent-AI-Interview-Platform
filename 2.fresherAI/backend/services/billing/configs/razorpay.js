import dotenv from "dotenv"
dotenv.config()
import Razorpay from "razorpay"

const cleanEnv = (value = "") => value.trim().replace(/^["']|["']$/g, "");

export const getRazorpayCredentials = () => ({
  keyId: cleanEnv(process.env.RAZORPAY_KEY_ID),
  keySecret: cleanEnv(process.env.RAZORPAY_KEY_SECRET),
});

export const getRazorpayConfigError = () => {
  const { keyId, keySecret } = getRazorpayCredentials();

  if (!keyId || !keySecret) {
    return "Razorpay backend credentials are missing.";
  }

  if (!keyId.startsWith("rzp_")) {
    return "Razorpay key id is invalid.";
  }

  return "";
};

const { keyId, keySecret } = getRazorpayCredentials();

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret
})

export default razorpay
