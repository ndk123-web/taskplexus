import type { signInType, signInResponse } from "../types/signType";
import { api } from "./globalApi";

// it means after promise the response will be of type signInResponse
const signInUserApi = async (data: signInType): Promise<signInResponse> => {
  // it means AxiosResponse's.data is of type signInResponse
  // const response = await axios.post<signInResponse>(
  //   "http://localhost:8080/api/v1/users/signin",
  //   {
  //     email: data.email,
  //     password: data.password,
  //   },
  //   {
  //     withCredentials: true,
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   }
  // );

  const response = await api.post(`/users/signin`, {
    email: data.email,
    password: data.password,
  });

  // for debug purpose
  console.log("Sing In Api Response", response.data);
  console.log("Only Data", response);

  // Error handling in api
  if (response.status < 200 || response.status >= 300) {
    alert("Error While Sign in: " + JSON.stringify(response.data));
    return response.data; // ya throw error
  }

  return response.data;
};

export default signInUserApi;
