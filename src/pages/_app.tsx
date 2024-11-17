import { ThemeProvider } from 'next-themes';
import { DevProvider } from '@/contexts/DevContext';
import { DataProvider } from '@/contexts/DataFetchContext';
import { AppProps } from 'next/app';
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider enableSystem={true} attribute="class" defaultTheme="system">
      <DevProvider>
        <DataProvider>
          <Component {...pageProps} />
        </DataProvider>
      </DevProvider>
    </ThemeProvider>
  );
}
