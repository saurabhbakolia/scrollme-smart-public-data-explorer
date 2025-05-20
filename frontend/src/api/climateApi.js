import axios from 'axios';
export const searchClimate = async (query) => {
    const res = await axios.post('/api/search', { query });
    return res.data;
};
