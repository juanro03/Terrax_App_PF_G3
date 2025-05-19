// src/axiosConfig.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/', // Asegurate de que el backend expone los endpoints con este prefijo
});

export default axiosInstance;
