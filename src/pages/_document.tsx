import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="overflow-hidden">
      <Head />
      <body className="border antialiased bg-white dark:bg-gray-900 transition-colors duration-[2s] overflow-hidden">
          <Main />
        <NextScript />
      </body>
    </Html>
  );
}
