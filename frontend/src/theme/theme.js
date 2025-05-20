import { defineConfig } from "@chakra-ui/react";

const config = defineConfig({
    theme: {
        tokens: {
            colors: {
                primary: {
                    50: '#EDE9FE',
                    100: '#C4B5FD',
                    200: '#A78BFA',
                    300: '#8B5CF6',
                    400: '#7C3AED',
                    500: '#6D28D9', // your “brand” blue-purple
                    600: '#5B21B6',
                    700: '#4C1D95',
                    800: '#3D1579',
                    900: '#2E1064',
                },
                secondary: {
                    50: '#D6FCF7',
                    100: '#A2F7EF',
                    200: '#6EF0E6',
                    300: '#3BE9DE',
                    400: '#08E2D5',
                    500: '#0BC5EA', // bright teal
                    600: '#039E9E',
                    700: '#027373',
                    800: '#024F4F',
                    900: '#013333',
                },
                accent: {
                    500: '#F59E0B', // amber for highlights
                },
                background: {
                    light: '#F7FAFC', // a gentle gray
                    dark: '#1A202C',
                },
            },
            styles: {
                global: {
                    body: {
                        bg: 'background.light',
                        color: 'gray.800',
                    },
                },
            },
        },
    },
});

export default config;