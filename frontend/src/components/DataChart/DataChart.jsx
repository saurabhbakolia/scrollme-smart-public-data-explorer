import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Heading, Text } from '@chakra-ui/react';

function DataChart({ data }) {
    // Format data for the chart
    const chartData = data.map(item => ({
        date: new Date(item.date).toLocaleDateString(),
        temperature: item.temperature,
        precipitation: item.precipitation,
        humidity: item.humidity,
        solar: item.solar,
    }));

    return (
        <Box mt={4} h={300}>
            <Heading as="h3" size="sm" mb={2}>Climate Trends</Heading>
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft' }} />
                        <YAxis yAxisId="right" orientation="right" label={{ value: 'Rain (mm) / Humidity (%) / Solar (W/m²)', angle: 90, position: 'insideRight' }} />
                        <Tooltip />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#1976d2" name="Temperature (°C)" />
                        <Line yAxisId="right" type="monotone" dataKey="precipitation" stroke="#f50057" name="Precipitation (mm)" />
                        <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#388e3c" name="Humidity (%)" />
                        <Line yAxisId="right" type="monotone" dataKey="solar" stroke="#ff9800" name="Solar (W/m²)" />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <Text color="gray.500" fontSize="sm">No data to display. Perform a search to see climate trends.</Text>
            )}
        </Box>
    );
}

export default DataChart;
