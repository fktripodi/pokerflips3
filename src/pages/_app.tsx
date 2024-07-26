import '../Styles/globals.css'; // Correct import path for globals.css
import type { AppProps } from 'next/app';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    console.log('App initialized');
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
