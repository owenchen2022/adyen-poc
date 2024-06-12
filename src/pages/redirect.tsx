import { useEffect, useRef, useState } from "react";
import AdyenCheckout from "@adyen/adyen-web";
import "@adyen/adyen-web/dist/adyen.css";
import { useRouter } from "next/router";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function Redirect() {
  const executed = useRef<boolean>(false);

  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState("");

  const searchParams = useSearchParams();

  const sessionId = searchParams.get("sessionId");
  const reference = searchParams.get("reference");
  const redirectResult = searchParams.get("redirectResult");

  useEffect(() => {
    if (sessionId) {
      void handleRedirect();
    }
  }, [sessionId]);

  async function handleRedirect() {
    console.log(sessionId, reference, redirectResult);
    
    const session = {id:sessionId};

    const configuration = {
      environment: process.env.NEXT_PUBLIC_Adyen_Environment,
      clientKey: process.env.NEXT_PUBLIC_Adyen_ClientKey,
      session: session,
      onPaymentCompleted: async (result: any) => {
        setErrorMessage("");
        console.info(result);
        if (result.resultCode == "Authorised") {
          router.push(`/confirmation?id=${reference}`);
          return;
        }

        if (result.resultCode == "Refused") {
          setErrorMessage("Your payment method has been rejcted, please try again with other payment method");
        }

        if (result.resultCode == "Error") {
          setErrorMessage("Unable to process the payment, please try again");
        }
      },
      onError: (error: any, component: any) => {
        console.error(error.name, error.message, error.stack, component);
      },
    };

    const checkout = await AdyenCheckout(configuration);
    checkout.submitDetails({ details: { redirectResult: redirectResult } });
  }

  return (
    <>
      {errorMessage && (
        <>
          <div className="p-5 text-red-700 text-center">
            <p>{errorMessage}</p>
          </div>
          <Link href="/">Try again</Link>
        </>
      )}
    </s>
  );
}
