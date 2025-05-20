import './index.css'
import ReactDOM from 'react-dom/client';
import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';
import App from './App';
import config from './theme/theme.js';

const system = createSystem(defaultConfig, config)

ReactDOM.createRoot(document.getElementById('root')).render(
  <ChakraProvider value={system}>
    <App />
  </ChakraProvider>
);