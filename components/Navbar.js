// components/Navbar.js
import {
    Container,
    Box,
    Stack,
    Heading,
    Flex,
    Link,
    Menu,
    MenuItem,
    MenuList,
    MenuButton,
    IconButton,
    useColorModeValue
  } from '@chakra-ui/react';
  import { HamburgerIcon } from '@chakra-ui/icons';
  import NextLink from 'next/link'
  import ThemeToggleButton from './ThemeToggleButton';

  const LinkItem = ({ href, path, target, children, ...props }) => {
    const active = path === href
    const inactiveColor = useColorModeValue('gray200', 'whiteAlpha.900')
    return (
        <NextLink href={href} passHref scroll={false}>
            <Link
                p={2}
                bg={active ? 'glassTeal' : undefined}
                color={active ? '#202023' : inactiveColor}
                target={target}
                {...props}
            >
                {children}
            </Link>
        </NextLink>
    )
}
  
  const Navbar = (props) => {
    const { path } = props;
  
    return (
      <Box
        position="fixed"
        as="nav"
        w="100%"
        bg={useColorModeValue('#ffffff40', '#20202380')}
        css={{ backdropFilter: 'blur(6px)' }}
        zIndex={1}
        {...props}
      >
        <Container
          display="flex"
          p={2}
          maxW="container.md"
          wrap="wrap"
          align="center"
          justify="space-between"
        >
          <Flex align="center" mr={5}>
            <Heading as="h1" size="lg" letterSpacing={'tighter'}>
              stephanegelibert
            </Heading>
          </Flex>
  
          <Stack
            direction={{ base: 'column', md: 'row' }}
            display={{ base: 'none', md: 'flex' }}
            width={{ base: 'full', md: 'auto' }}
            alignItems="center"
            flexGrow={1}
            mt={{ base: 4, md: 0 }} // Fixed typo: 'nmd' to 'md'
          >
            <LinkItem href="/" path={path}>
              About
            </LinkItem>
            <LinkItem href="https://photo.stephanegelibert.com/" path={path}>
              Photo
            </LinkItem>
            <LinkItem
              href="https://github.com/shinysarc/homepage"
              path={path}
              display="inline-flex"
              alignItems="center"
              style={{ gap: 4 }}
              pl={2}
            >
              Source
            </LinkItem>
          </Stack>
  
          <Box flex={1} align="right">
            <ThemeToggleButton />
  
            <Box ml={2} display={{ base: 'inline-block', md: 'none' }}>
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<HamburgerIcon />}
                  variant="outline"
                  aria-label="Options"
                />
                <MenuList>
                  <MenuItem>
                    <LinkItem href="/" path={path}>
                      About
                    </LinkItem>
                  </MenuItem>
                  <MenuItem>
                    <LinkItem href="https://photo.stephanegelibert.com/" path={path}>
                      Photo
                    </LinkItem>
                  </MenuItem>
                  <MenuItem>
                    <LinkItem href="https://github.com/shinysarc/homepage" path={path}>
                      Source
                    </LinkItem>
                  </MenuItem>
                </MenuList>
              </Menu>
            </Box>
          </Box>
        </Container>
      </Box>
    );
  };
  
  export default Navbar;
  