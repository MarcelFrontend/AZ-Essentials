import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="overflow-hidden">
      <Head />
      <body className="relative max-h-[100vh] md:max-h-screen overflow-auto border antialiased bg-white dark:bg-gray-900 transition-colors duration-[2s]">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
