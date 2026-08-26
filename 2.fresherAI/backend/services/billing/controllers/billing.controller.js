import razorpay from "../configs/razorpay.js";
import Billing from "../models/billing.model.js";
import crypto from "crypto"
import mongoose from "mongoose";
import redis from "../../../shared/redis/redis.js";
import SharedUser from "../../auth/model/user.model.js";



const PLANS = {
    launch: {
        title: "Launch",
        amount: 99,
        interviewCoins: 200,
    },
    growth: {
        title: "Growth",
        amount: 199,
        interviewCoins: 500,
    },
    pro: {
        title: "Pro",
        amount: 349,
        interviewCoins: 1000,
    },
    scale: {
        title: "Scale",
        amount: 599,
        interviewCoins: 2000,
    },
};

let userConnection;
let UserModel;

const getUserMongoUrl = () => {
    if (process.env.USER_MONGODB_URL) return process.env.USER_MONGODB_URL;
    if (process.env.AUTH_MONGODB_URL) return process.env.AUTH_MONGODB_URL;

    return "";
}

const getUserModel = async () => {
    if (UserModel) return UserModel;

    const userMongoUrl = getUserMongoUrl();

    if (!userMongoUrl) {
        UserModel = SharedUser;
        return UserModel;
    }

    userConnection = mongoose.createConnection(userMongoUrl);
    await userConnection.asPromise();

    const userSchema = new mongoose.Schema({
        firebaseUid: String,
        name: String,
        email: String,
        interviewCoin: {
            type: Number,
            default: 150,
        },
    }, { timestamps: true });

    UserModel = userConnection.model("User", userSchema);
    return UserModel;
}

const updateSessionCoins = async (sessionId, user) => {
    if (!sessionId) return;

    await redis.set(`session:${sessionId}`, JSON.stringify({
        userId: user._id,
        name: user.name,
        email: user.email,
        interviewCoin: user.interviewCoin,
    }), "EX", 60 * 60 * 24 * 7);
}

export const createOrder = async (req, res) => {
    try {
        const { planId } = req.body
        const userId = req.headers["x-user-id"]
        const plan = PLANS[planId]

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized billing request",
            });
        }

        if (!plan) {
            return res.status(400).json({
                success: false,
                message: "Invalid plan",
            });
        }

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return res.status(503).json({
                success: false,
                message: "Razorpay keys are missing in billing service .env",
            });
        }

        const order = await razorpay.orders.create({
            amount: plan.amount * 100,
            currency: "INR",
            receipt: `${planId}_${Date.now()}`.slice(0, 40),
            notes: {
                planId,
                coins: String(plan.interviewCoins),
                userId: String(userId),
            },
        })

        await Billing.create({
            userId,
            planId,
            planTitle: plan.title,
            amount: plan.amount,
            interviewCoins: plan.interviewCoins,
            razorpayOrderId: order.id,
            status: "created",
        })

        return res.status(201).json({
            success: true,
            order,
        })

    } catch (error) {
        console.log(error)
        const message = error?.error?.description === "Authentication failed"
            ? "Razorpay authentication failed. Check backend/services/billing/.env key_id and key_secret."
            : "Failed to create order";

        return res.status(500).json({
            success: false,
            message,
        });
    }
}

export const verifyPayment = async (req, res) => {
    try {

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body

        const userId = req.headers["x-user-id"];
        const sessionId = req.headers["x-session-id"];

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Missing Razorpay verification fields",
            });
        }

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized billing request",
            });
        }

        const payment = await Billing.findOne({
            razorpayOrderId:razorpay_order_id
        })
        if(!payment){
             return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
        }

        if (String(payment.userId) !== String(userId)) {
            return res.status(403).json({
                success: false,
                message: "Payment does not belong to this user",
            });
        }

        const genSign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
        .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex")

        if(genSign !== razorpay_signature){
            await Billing.updateOne(
                { _id: payment._id },
                { $set: { status: "failed" } }
            );
            return res.status(400).json({
        success: false,
        message: "Payment signature mismatch. Use the Razorpay key secret from the same key pair as your frontend key id.",
      });
        }

        const User = await getUserModel();

        if (payment.status === "paid") {
      const user = await User.findById(userId);
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        interviewCoin: user?.interviewCoin,
        coinsAdded: 0,
      });
    }

    if (!payment.interviewCoins || payment.interviewCoins <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid coin pack on payment record",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.interviewCoin += payment.interviewCoins;
    await user.save();
    await updateSessionCoins(sessionId, user);

    await Billing.updateOne(
      { _id: payment._id },
      {
        $set: {
          status: "paid",
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Payment successful",
      interviewCoin: user.interviewCoin,
      coinsAdded: payment.interviewCoins,
    });
    } catch (error) {

        console.log(error);

    if (req.body?.razorpay_order_id) {
      await Billing.findOneAndUpdate(
        {
          razorpayOrderId: req.body.razorpay_order_id,
        },
        {
          status: "failed",
        }
      );
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Payment verification failed",
    });

    }
}
