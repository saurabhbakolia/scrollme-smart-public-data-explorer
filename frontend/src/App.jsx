import React, { useState } from 'react';
import {
  Box,
  Flex,
  Spinner,
  Heading,
  Text,
  Center
} from '@chakra-ui/react';
import ChatWidget from './components/ChatWidget/ChatWidget';
import MapComponent from './components/MapComponent/MapComponent';

export default function App() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <Box
      bg="background.light"
      minH="100vh"
      height="100vh"
      display="flex"
      flexDirection="column">
      {/* Eye-catching header with gradient */}
      <Box
        bgGradient="linear(to-r, primary.500, secondary.700)"
        px={{ base: 4, md: 8 }}
        py={{ base: 4, md: 6 }}
        boxShadow="md"
      >
        <Heading as="h1" size="xl" color="secondary.900">
          Climate Search Explorer
        </Heading>
        <Text color="secondary.900" fontSize="md" mt={2}>
          Discover and visualize climate data around the world
        </Text>
      </Box>

      {/* Main content area */}
      <Flex
        flex="1"
        direction={{ base: 'column', md: 'row' }}
        p={{ base: 2, md: 4 }}
        gap={6}
        mx="auto"
        width="100%"
        height="100%"
      >
        {/* Sidebar */}
        <Box
          w={{ base: '100%', md: '30%' }}
          bg="white"
          p={6}
          borderRadius="lg"
          boxShadow="lg"
          overflowY="auto"
        >
          <ChatWidget setResults={setResults} setLoading={setLoading} />
        </Box>

        {/* Map container */}
        <Box
          flex="1"
          bg="white"
          p={6}
          borderRadius="lg"
          boxShadow="lg"
          position="relative"
          height="100%"
        >
          {loading ? (
            <Center h="100%">
              <Spinner size="lg" thickness="4px" color="accent.500" />
            </Center>
          ) : (
            <Box height="98%">
              <MapComponent data={results} />
            </Box>
          )}
        </Box>
      </Flex>
    </Box>
  );
}
