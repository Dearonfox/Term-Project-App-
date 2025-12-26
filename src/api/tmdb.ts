import axios from "axios";

export const tmdb = axios.create({
    baseURL: "http://113.198.66.75:18139",
    timeout: 10000,
});
