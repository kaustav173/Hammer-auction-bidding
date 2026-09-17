import crypto from "node:crypto";
import type { Request, Response } from "express";
import Razorpay from "razorpay";

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

function getRazorpayClient() {
  if (!razorpayKeyId || !razorpayKeySecret) {
    throw new Error("Razorpay credentials are not configured");
  }

  return new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret,
  });
}

export async function createOrder(req: Request, res: Response) {
  const parsedAmount = Number(req.body?.amount);
  const { currency = "INR", receipt } = req.body as {
    amount?: number;
    currency?: string;
    receipt?: string;
  };

  if (!Number.isInteger(parsedAmount) || parsedAmount < 100) {
    return res.status(400).json({
      success: false,
      message: "Amount must be at least 100 paise",
    });
  }

  try {
    const order: any = await getRazorpayClient().orders.create({
      amount: parsedAmount,
      currency,
      receipt: receipt || `hammr_${Date.now()}`,
    });

    return res.status(201).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode;

    console.error("Create Razorpay order error:", error);
    return res.status(statusCode === 401 ? 401 : 500).json({
      success: false,
      message:
        statusCode === 401 ? "Razorpay authentication failed" : "Unable to create payment order",
    });
  }
}

export function verifyPayment(req: Request, res: Response) {
  const {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
  } = req.body as {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  };

  if (!orderId || !paymentId || !signature) {
    return res.status(400).json({
      success: false,
      message: "Missing payment verification fields",
    });
  }

  if (!razorpayKeySecret) {
    console.error("Razorpay credentials are not configured");
    return res.status(500).json({
      success: false,
      message: "Payment verification is not configured",
    });
  }

  const expectedSignature = crypto
    .createHmac("sha256", razorpayKeySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  const expectedBuffer = Buffer.from(expectedSignature);
  const receivedBuffer = Buffer.from(signature);
  const isValid =
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: "Payment signature verification failed",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Payment verified successfully",
  });
}
