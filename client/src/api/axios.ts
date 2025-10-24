import axios from "axios";

axios.defaults.withCredentials = true;

const api = axios.create({
	baseURL: import.meta.env.VITE_APP_BASE_URL,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
		"Access-Control-Allow-Origin": "*",
	},	

});

api.interceptors.request.use((config) => {
	const token = localStorage.getItem("token");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

api.interceptors.response.use(
	(res) => {
		return res;
	},
	async (err) => {
		if (err.response.status === 401) {
			localStorage.removeItem("token");
			window.location.href = "/login";
		}
		return Promise.reject(err);
	}
);

export default api;
