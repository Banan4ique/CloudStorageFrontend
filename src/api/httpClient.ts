import axios from "axios";
import cookies from 'browser-cookies';

const AUTH_TOKEN_KEY = 'auth-token';

const httpClient = axios.create({
    baseURL: process.env.VUE_APP_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true
});

const getAuthToken = () => cookies.get(AUTH_TOKEN_KEY);

const authInterceptor = (config: any) => {
    config.mode = 'no-cors';

    const token = getAuthToken();
    if (token) {
        config.headers[AUTH_TOKEN_KEY] = token;
    }

    return config;
}

export function setupHttpInterceptors(store: any, router: any) {
    httpClient.interceptors.request.use(authInterceptor);

    httpClient.interceptors.response.use(
        response => response,
        function (error) {
            // Избегаем рекурсии при logout
            if (error.response &&
                error.response.status === 401 &&
                error.response.config.url !== '/logout') {

                console.error('401 error, logging out...');

                // Сначала очищаем токен
                cookies.erase(AUTH_TOKEN_KEY);
                store.commit('authToken', '');

                // Затем редирект
                router.push({ name: 'Login' });
            }
            return Promise.reject(error);
        }
    );
}

export default httpClient;
export { AUTH_TOKEN_KEY };