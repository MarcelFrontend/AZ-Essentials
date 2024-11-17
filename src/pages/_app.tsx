import { ThemeProvider } from 'next-themes';
import { DevProvider } from '@/contexts/DevContext';
import { DataProvider } from '@/contexts/DataFetchContext';
import DashboardLayout from '@/pages/layout';
import { AppProps } from 'next/app';
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider enableSystem={true} attribute="class" defaultTheme="system">
      <DevProvider>
        <DataProvider>
          <DashboardLayout>
            <Component {...pageProps} />
          </DashboardLayout>
        </DataProvider>
      </DevProvider>
    </ThemeProvider>
  );
}
