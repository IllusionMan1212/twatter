import axios from "axios";

const baseUrl = `http://${process.env.NEXT_PUBLIC_DOMAIN ?? "localhost"}:${
    process.env.NEXT_PUBLIC_PORT ?? "3000"
}/api/`;
export const axiosAuth = axios.create({
    baseURL: baseUrl,
    timeout: 15000,
    withCredentials: true,
});

axiosAuth.interceptors.request.use(
    async (config) => {
        await axios.get(`${baseUrl}users/validate-token`, {
            withCredentials: true,
        });
        return config;
    },
    (err) => {
        return Promise.reject(err);
    },
);

export const axiosNoAuth = axios.create({
    baseURL: baseUrl,
    timeout: 15000,
});
