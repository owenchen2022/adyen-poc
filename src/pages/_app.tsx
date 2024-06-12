import "../styles/globals.css"
import type { AppProps } from "next/app";
import {  Nunito_Sans } from "next/font/google";

const inter = Nunito_Sans({  subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}>
      <Component {...pageProps} />
    </main>
  );
}
