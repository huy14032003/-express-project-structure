// const {
//     registerGetEndpoint,
//     registerPostEndpoint,
//     registerPatchEndpoint,
//     registerPutEndpoint,
//     registerDeleteEndpoint,
//     interceptors,
// } = DataSync;

// const SERVICE_URL ='http://localhost:3000'

// registerPostEndpoint("postUser", `${SERVICE_URL}/api/auth/login`);
// registerPostEndpoint("postUserRegister", `${SERVICE_URL}/api/auth/register`);

import { ApiClient } from "/libs/js/applib.js";

const api = new ApiClient("http://localhost:3000");

api.registerPostEndpoint("postUserLogin", "api/auth/login");
api.registerPostEndpoint("postUserRegister", "api/auth/register");

export default api.endpoints;