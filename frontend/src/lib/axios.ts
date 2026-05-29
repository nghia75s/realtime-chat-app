import axios from "axios"

const URL = "http://localhost:3000"
// const URL = ""

export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "development" ? `${URL}/api` : "/api",
    withCredentials: true,
});
