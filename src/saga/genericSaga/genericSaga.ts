import { call, put, cancelled } from "redux-saga/effects";
import type { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { toast } from "sonner";
import { axiosRequest } from "@/service/axiosRequest";
import { clearAuth } from "@/redux/slices/authSlice";

interface GenericSagaAction {
  type: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  endPoint: string;
  body?: object | FormData;
  auth?: boolean;
  getResponse?: (data: unknown) => void;
  getError?: (error: unknown) => void;
  setLoading?: (val: boolean) => void;
  showSuccessMessage?: boolean;
  responseType?: "arraybuffer" | "blob" | "document" | "json" | "text" | "stream";
}

export function* genericSaga(action: GenericSagaAction): Generator {
  const { method, endPoint, body, auth, getResponse, getError, setLoading } =
    action;

  try {
    if (setLoading) setLoading(true);

    const config: AxiosRequestConfig = {
      baseURL: import.meta.env.VITE_API_BASE_URL,
      method,
      url: endPoint,
      data: body,
      responseType: action.responseType,
    };

    if (auth) {
      const loginDataRaw = localStorage.getItem("RecruitOS_Login_Data");
      if (loginDataRaw) {
        try {
          const loginData = JSON.parse(loginDataRaw);
          const token = loginData?.accessToken;
          if (token) {
            config.headers = {
              Authorization: `Bearer ${token}`,
            };
          }
        } catch (e) {
          console.error("Failed to parse login data from local storage", e);
        }
      }
    }

    const response = (yield call(axiosRequest, config)) as AxiosResponse;

    if (action.showSuccessMessage) {
      toast.success(response.data?.message);
    }

    if (getResponse) getResponse(response.data);
    if (setLoading) setLoading(false);
  } catch (error) {
    if (setLoading) setLoading(false);
    if (getError) getError(error);

    const axiosError = error as AxiosError;
    
    // Show toast for error if there's no getError handler, or if we want global error handling anyway
    // For now, let's show a global error toast unless it's handled specifically
    if (!getError) {
      const errorData = axiosError?.response?.data as any;
      const errorMsg = errorData?.detail || errorData?.error || axiosError.message || "Something went wrong";
      toast.error(errorMsg);
    }

    if (axiosError?.response?.status === 401) {
      toast.error("Session expired. Please login again.");
      yield put(clearAuth());
    }

    console.error(error);
  } finally {
    if (yield cancelled()) {
      if (setLoading) setLoading(false);
    }
  }
}
