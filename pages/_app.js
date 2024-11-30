// pages/_app.js

import '../styles/globals.css'
import Main from '@/components/layout/main';
import theme from '@/lib/theme';
import { ChakraProvider } from '@chakra-ui/react';

function MyApp({ Component, pageProps, router }) {
  return (
    <ChakraProvider theme={theme}>
      <Main router={router}>
        <Component {...pageProps} />
      </Main>
    </ChakraProvider>
  );
}

export default MyApp;
