import { useEffect, useRef, useState } from "react";
import AdyenCheckout from "@adyen/adyen-web";
import "@adyen/adyen-web/dist/adyen.css";
import { useRouter } from "next/router";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const executed = useRef<boolean>(false);

  const [adyenCheckout, setAdyenCheckout] = useState<any>(null);

  const cardSelectorRef = useRef<HTMLSelectElement>(null);
  const cardElementRef = useRef<HTMLDivElement>(null);
  const paypalElementRef = useRef<HTMLDivElement>(null);

  const cardElement = useRef<any>(null);

  const [selectedPayment, setSelectedPayment] = useState(-1);

  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState("");

  const [amount, setAmount] = useState(0);

  const searchParams = useSearchParams();

  const sessionId = searchParams.get("sessionId");
  const reference = searchParams.get("reference");
  const redirectResult = searchParams.get("redirectResult");

  console.log(sessionId, reference, redirectResult);

  useEffect(() => {
    if (executed.current) {
      return;
    }
    executed.current = true;

    async function initial() {
      const data = await fetch("/api/commerce/initial").then((rsp) =>
        rsp.json()
      );

      setAmount(data.amount.value / 100.0);

      const configuration = {
        environment: process.env.NEXT_PUBLIC_Adyen_Environment,
        clientKey: process.env.NEXT_PUBLIC_Adyen_ClientKey,
        session: data,
        onPaymentCompleted: async (result: any) => {
          setErrorMessage("");
          console.info(result);

          if (result.resultCode == "Authorised") {
            router.push(`/confirmation?id=${data.reference}`);
            return;
          }

          if (result.resultCode == "Refused") {
            setErrorMessage("Unable to process the payment, please try again");
          }
        },
        onError: (error: any, component: any) => {
          console.error(error.name, error.message, error.stack, component);
        },

        paymentMethodsConfiguration: {
          card: {
            brands: ["visa", "mc", "amex"],
            hasHolderName: true,
            holderNameRequired: true,
            billingAddressRequired: false,
            showStoredPaymentMethods: true,
          },
          paypal: {
            blockPayPalCreditButton: true,
            blockPayPalPayLaterButton: true,
          },
        },
        translations: {
          "en-US": {
            payButton: "Pay",
          },
        },
      };

      const checkout = await AdyenCheckout(configuration);

      setAdyenCheckout(checkout);

      cardElement.current = checkout
        .create("card", {
          showPayButton: true,
        })
        .mount(cardElementRef.current!);

      const paypalComponent = checkout
        .create("paypal", {})
        .mount(paypalElementRef.current!);
    }

    void initial();
  }, []);

  function selectPaymentMethod(index: number) {
    setSelectedPayment(index);
  }

  function changeCardType() {
    cardElement.current?.unmount();

    const savedPaymentId = cardSelectorRef.current?.value;
    const savedPaymentMethod =
      adyenCheckout.paymentMethodsResponse.storedPaymentMethods.find(
        (item: any) => item.storedPaymentMethodId == savedPaymentId
      );

    const options = savedPaymentMethod
      ? { ...savedPaymentMethod, showPayButton: true }
      : { showPayButton: true };

    cardElement.current = adyenCheckout
      .create("card", options)
      .mount(cardElementRef.current);
  }

  return (
    <div className="z-10 max-w-2xl w-full items-center justify-between text-sm lg:flex lg:flex-col">
      {errorMessage && <div className="p-5 text-red-700">{errorMessage}</div>}
      <ul className="w-full">
        <li className="border-l-amber-950">
          <div className="flex flex-row gap-2">
            <input
              type="radio"
              className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600 mt-3 basis-5"
              onChange={() => selectPaymentMethod(0)}
              checked={selectedPayment == 0}
            />
            <div className="flex flex-row flex-1">
              <div className="basis-96">
                <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">
                  Debit or Credit card
                </h2>
                <p className="text-xs">Surcharge A${amount / 100.0} applies</p>
              </div>
              <div className="flex-grow flex justify-end">
                <img
                  src="https://cdf6519016.cdn.adyen.com/checkoutshopper/images/logos/visa.svg"
                  alt="Visa"
                  className="h-8 w-8"
                />
              </div>
            </div>
          </div>
          <div
            className={
              "m-6 rounded-lg ring-1 ring-slate-900/10 p-5" +
              (selectedPayment == 0 ? "" : " hidden")
            }
          >
            {adyenCheckout?.paymentMethodsResponse?.storedPaymentMethods
              .length > 0 && (
              <select
                onChange={changeCardType}
                ref={cardSelectorRef}
                className="bg-gray-50 rounded-lg border border-gray-300 text-gray-900 text-smrounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              >
                <option>Add a new card</option>
                {adyenCheckout?.paymentMethodsResponse?.storedPaymentMethods.map(
                  (storedPaymentMethod: any) => {
                    return (
                      <option
                        key={storedPaymentMethod.id}
                        value={storedPaymentMethod.storedPaymentMethodId}
                      >
                        {storedPaymentMethod.holderName}{" "}
                        {storedPaymentMethod.expiryMonth} / 20
                        {storedPaymentMethod.expiryYear}
                      </option>
                    );
                  }
                )}
              </select>
            )}
            <div ref={cardElementRef}></div>
          </div>
        </li>
        <li>
          <div className="flex flex-row items-start gap-2">
            <input
              type="radio"
              className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600 mt-3"
              onChange={() => selectPaymentMethod(1)}
              checked={selectedPayment == 1}
            />
            <div>
              <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">
                Paypal
              </h2>
              <p className="text-xs">Surcharge A${amount / 100.0} applies</p>
            </div>
          </div>
          <div
            ref={paypalElementRef}
            className={
              "m-6 rounded-lg p-5 w-96 " +
              (selectedPayment == 1 ? "" : "hidden")
            }
          ></div>
        </li>
        <li>
          <div className="flex flex-row items-start gap-2">
            <input
              type="radio"
              className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600 mt-3"
              onChange={() => selectPaymentMethod(2)}
              checked={selectedPayment == 2}
            />
            <div>
              <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">
                Pay on account
              </h2>
            </div>
          </div>
          <div
            className={
              "m-6 rounded-lg p-5  w-96 " +
              (selectedPayment == 2 ? "" : "hidden")
            }
          >
            <button className="rounded-full min-w-80 max-w-full py-4 px-8 bg-blue-900 text-white">
              Pay
            </button>
          </div>
        </li>
      </ul>
    </div>
  );
}
