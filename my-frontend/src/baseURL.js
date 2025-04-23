import axios from 'axios';

const api = axios.create({
  baseURL: 'http:/django:8000/api/',
});

export default api;
