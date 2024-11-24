import { ThemeProvider } from 'next-themes';
import { DevProvider } from '@/contexts/DevContext';
import { DataProvider } from '@/contexts/DataFetchContext';
import { AppProps } from 'next/app';
import "@/styles/globals.css";
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <ThemeProvider enableSystem={true} attribute="class" defaultTheme="system">
        <DevProvider>
          <DataProvider>
            <Component {...pageProps} />
          </DataProvider>
        </DevProvider>
      </ThemeProvider>
    </>
  );
}
