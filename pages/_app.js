// pages/_app.js

import Header from '@/components/Header';
import { ChakraProvider, localStorageManager } from '@chakra-ui/react';

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider colorModeManager={localStorageManager}>
      <Header />
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
