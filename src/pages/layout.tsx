import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode[] }) {
  return (
    <>
      <main
        className={`z-10 max-w-5xl w-full items-center justify-between text-sm lg:flex lg:flex-col`}
      >
        {children}
      </main>
    </>
  );
}
