import axios from "axios"
import toast from "react-hot-toast"

const URL = "http://localhost:3000"
// const URL = ""

export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "development" ? `${URL}/api` : "/api",
    withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 413) {
      toast.error("File tải lên quá lớn. Vui lòng chọn file nhỏ hơn.");
    }
    return Promise.reject(error);
  }
);
