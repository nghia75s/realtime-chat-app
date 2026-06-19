import axios from "axios"
import toast from "react-hot-toast"

// const URL = "http://localhost:3000"
const URL = ""

export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "development" ? `${URL}/api` : "/api",
    withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 413) {
      toast.error("File tải lên quá lớn. Vui lòng chọn file nhỏ hơn.");
    } else if (error.response?.status === 401) {
      const message = error.response?.data?.message;
      if (message === "Phiên đăng nhập đã hết hạn hoặc bạn đã đăng nhập ở thiết bị khác") {
        toast.error(message);
        try {
          const { useAuthStore } = await import("@/store/useAuthStore");
          useAuthStore.getState().forceLogout();
        } catch (e) {
          console.error("Failed to force logout:", e);
        }
      }
    }
    return Promise.reject(error);
  }
);
