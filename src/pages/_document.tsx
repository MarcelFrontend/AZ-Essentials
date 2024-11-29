import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="overflow-hidden">
      <Head />
      <body className="relative h-[94vh] md:max-h-screen flex items-center justify-center border antialiased bg-white dark:bg-gray-900 transition-colors duration-[2s] overflowy-auto overflow-x-hidden">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
