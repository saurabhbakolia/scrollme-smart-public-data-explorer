import React, { useState } from 'react';
import {
  Box,
  VStack,
  Input,
  Select,
  Button,
  Text,
  Stack,
} from '@chakra-ui/react';
import { searchClimate } from '../../api/climateApi';
import DataChart from '../DataChart/DataChart';

const CITY_OPTIONS = ['New York City'];

export default function ChatWidget({ setResults, setLoading }) {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState(CITY_OPTIONS[0]);
  const [localResults, setLocalResults] = useState([]);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await searchClimate({ query, city });
      setLocalResults(data);
      setResults(data);
    } catch {
      setError('Failed to fetch results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack spacing={4} align="stretch" h="100%">
      {/* Search panel */}
      <Box p={4} bg="white" borderRadius="md" shadow="md">
        <Box mb={3}>
          <Text mb={1} fontWeight="medium">City</Text>
          <Input
            placeholder="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </Box>

        <Box mb={3}>
          <Text mb={1} fontWeight="medium">Search Query</Text>
          <Input
            placeholder="e.g., coldest days in January 2023"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {error && !query.trim() && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {error}
            </Text>
          )}
        </Box>

        <Button colorScheme="brand" width="100%" onClick={handleSearch}>
          Search
        </Button>
        {error && query.trim() && (
          <Text color="red.500" fontSize="sm" mt={2}>
            {error}
          </Text>
        )}
      </Box>

      {/* Results list */}
      <Box flex="1" p={4} bg="white" borderRadius="md" shadow="md" overflowY="auto">
        <Text fontSize="lg" mb={3}>Results</Text>
        {localResults.length === 0 ? (
          <Text color="gray.500">
            No results yet. Enter a query to search climate data.
          </Text>
        ) : (
          <Stack spacing={3}>
            {localResults.map((r, i) => (
              <Box key={i}>
                <Text fontWeight="bold">
                  {new Date(r.date).toLocaleDateString()}
                </Text>
                <Text>Temp: {r.temperature}°C</Text>
                <Text>Rain: {r.precipitation} mm</Text>
                <Text>Humidity: {r.humidity}%</Text>
                <Text>Solar: {r.solar} W/m²</Text>
                {i < localResults.length - 1 && (
                  <Box h="1px" bg="gray.200" my={2} />
                )}
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      {/* Chart */}
      <Box p={4} bg="white" borderRadius="md" shadow="md">
        <Text fontSize="lg" mb={3}>Climate Trends</Text>
        <DataChart data={localResults} />
      </Box>
    </VStack>
  );
}
