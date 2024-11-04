// components/Header.js

import { Flex, Heading, IconButton, useColorMode } from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';

export default function Header() {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Flex
      as="header"
      width="100%"
      padding="4"
      alignItems="center"
      justifyContent="space-between"
    >
      <Heading as="h1" size="lg" textAlign="center">
        My Photography Gallery
      </Heading>
      <IconButton
        aria-label="Toggle Theme"
        icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
        onClick={toggleColorMode}
      />
    </Flex>
  );
}
