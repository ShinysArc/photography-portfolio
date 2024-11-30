import Head from 'next/head'
import Navbar from '../Navbar'
import { Box } from '@chakra-ui/react'
import NoSsr from '../no-ssr'
//import Footer from '../footer'

const Main = ({ children, router }) => {
  return (
    <Box as="main" pb={8}>
      <Head>
        <title>Stéphane Gelibert - Portfolio</title>
      </Head>
      <NoSsr>
      <Navbar path={router.asPath} />
      </NoSsr>
      {children}
    </Box>
  )
}

export default Main