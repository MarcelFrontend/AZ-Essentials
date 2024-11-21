import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <body className="antialiased bg-white dark:bg-gray-900 transition-colors duration-[2s] overflow-hidden">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
