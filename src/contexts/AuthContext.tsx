import { createContext, useContext, useReducer, useEffect } from "react";
import type { ReactNode } from "react";
import type { UserResponse } from "@/services/auth/authService";
import { authService } from "@/services/auth/authService";

// ================== TYPES ==================
interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  signin: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  signout: () => Promise<void>;
  clearError: () => void;
}

type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: UserResponse }
  | { type: "AUTH_ERROR"; payload: string }
  | { type: "AUTH_LOGOUT" }
  | { type: "CLEAR_ERROR" };

// ================== INITIAL STATE ==================
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// ================== REDUCER ==================
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, isLoading: true, error: null };
    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "AUTH_ERROR":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case "AUTH_LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
};

// ================== CONTEXT ==================
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// ================== PROVIDER ==================
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Kiểm tra token khi load trang
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    // Nếu token tồn tại, có thể gọi API xác minh hoặc decode (tuỳ backend)
    // Tạm thời chỉ setAuthenticated cho nhanh
    dispatch({
      type: "AUTH_SUCCESS",
      payload: JSON.parse(localStorage.getItem("user") || "null"),
    });
  }, []);

  // ================== ACTIONS ==================
  const signin = async (email: string, password: string) => {
    dispatch({ type: "AUTH_START" });
    try {
      const res = await authService.signin({ email, password });
      const { accessToken, user } = res.data;

      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("user", JSON.stringify(user));
      }

      dispatch({ type: "AUTH_SUCCESS", payload: user });
    } catch (error: any) {
      dispatch({
        type: "AUTH_ERROR",
        payload: error?.message || "Đăng nhập thất bại",
      });
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    dispatch({ type: "AUTH_START" });
    try {
      const res = await authService.signup({ name, email, password });
      const { accessToken, user } = res.data;

      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("user", JSON.stringify(user));
      }

      dispatch({ type: "AUTH_SUCCESS", payload: user });
    } catch (error: any) {
      dispatch({
        type: "AUTH_ERROR",
        payload: error?.message || "Đăng ký thất bại",
      });
      throw error;
    }
  };

  const signout = async () => {
    try {
      await authService.signout();
    } catch (err) {
      console.warn("Signout error:", err);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      dispatch({ type: "AUTH_LOGOUT" });
    }
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const value: AuthContextType = {
    ...state,
    signin,
    signup,
    signout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ================== HOOK ==================
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
