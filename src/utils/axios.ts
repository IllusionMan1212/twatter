import axios from "axios";

const baseURL =
    process.env.NODE_ENV === "production"
        ? "https://twatter.social/api/"
        : `http://${process.env.NEXT_PUBLIC_DOMAIN ?? "localhost"}:${
            process.env.NEXT_PUBLIC_PORT ?? "3000"
        }/api/`;


axios.defaults.baseURL = baseURL;

export const axiosInstance = axios.create({
    baseURL,
    timeout: 60000,
    withCredentials: true,
});

export const fetcher = <T,>(url: string) => axiosInstance.get<T>(url).then(res => res.data);
