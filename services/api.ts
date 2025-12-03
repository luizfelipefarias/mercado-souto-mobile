import axios from 'axios';

const api = axios.create({
  baseURL: 'http://162.243.70.61:8080',
  
  
  timeout: 10000, 
});

export default api;