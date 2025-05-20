import axios from 'axios';

export const searchClimate = async ({ query, city }) => {
    try {
        const response = await axios.post('/api/search', { query, city });
        return response.data.results;
    } catch (error) {
        console.error('Error fetching search results:', error);
        throw error;
    }
};
