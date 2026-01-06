// frontend/lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "https://open.api.nexon.com/fconline/v1",
  headers: {
    "x-nxopen-api-key": process.env.NEXON_API_KEY,
  },
});

export default api;