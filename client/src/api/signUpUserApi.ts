import type { SignUpRequest, signUpResponse } from "../types/signUpType";
import { api } from "./globalApi";

const signUpUserApi = async (data: SignUpRequest): Promise<signUpResponse> => {
  // const response = await axios.post(
  //   "http://localhost:8080/api/v1/users/signup",
  //   {
  //     email: data.email,
  //     password: data.password,
  //     fullName: data.fullName,
  //   },
  //   {
  //     withCredentials: true,
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   }
  // );

  const response = await api.post(`/users/signup`, {
    email: data.email,
    password: data.password,
    fullname: data.fullName,
  });

  if (response.status < 200 || response.status >= 300) {
    alert("Sign Up Failed: " + JSON.stringify(response.data));
    return response.data;
  }

  return response.data;
};

export default signUpUserApi;
