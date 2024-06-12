import { CheckoutAPI, Client, Types } from "@adyen/api-library";
import { randomInt } from "crypto";
import { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";

export default async function handler(
  req: NextApiRequest,
  rsp: NextApiResponse
): Promise<void> {
  const client = new Client({
    apiKey: process.env.Adyen_ApiKey!,
    environment: "TEST",
  });
  const checkout = new CheckoutAPI(client);

  const headers = new Headers(req.headers as HeadersInit);

  const amount = randomInt(25, 1000);

  const reference = `Bioc-${uuidv4()}`;

  const session = await checkout.PaymentsApi.sessions({
    amount: { currency: "AUD", value: amount * 100 },
    reference: reference as string,
    returnUrl: `${process.env.PUBLIC_URL}/redirect?reference=${reference}`,
    merchantAccount: process.env.Adyen_MerchantName!,
    allowedPaymentMethods: ["scheme", "paypal"],
    countryCode: "AU",
    shopperEmail: process.env.Shopper_Email,
    shopperReference: process.env.Shopper_Reference,
    storePaymentMethod: true,
    storePaymentMethodMode:
      Types.checkout.CreateCheckoutSessionRequest.StorePaymentMethodModeEnum
        .AskForConsent,
    recurringProcessingModel:
      Types.checkout.CreateCheckoutSessionRequest.RecurringProcessingModelEnum
        .CardOnFile,
  });

  rsp.status(200).json(session);
}
