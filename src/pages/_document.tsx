import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="h-full overflow-hidden">
      <Head />
      <body className="h-full border antialiased bg-white dark:bg-gray-900 transition-colors duration-[2s] overflow-hidden">
          <Main />
        <NextScript />
      </body>
    </Html>
  );
}
