// axiosSetup.ts

import axios from 'axios';

// Setting as a constant for now. Move it to an environment file later
export const SIGNADOT_API_DOMAIN = "https://api.signadot.com";

// Set default base URL
axios.defaults.baseURL = SIGNADOT_API_DOMAIN;

// Set default headers
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Cache-Control'] = 'no-cache';

// You can also set other defaults here as needed
