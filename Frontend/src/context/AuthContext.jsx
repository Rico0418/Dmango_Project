import { createContext, useContext, useState, useEffect } from "react";
import jwt_decode from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const checkAuth = async () => {
            const token = sessionStorage.getItem("token");
            if (token) {
                try {
                    const decoded = jwt_decode(token);
                    setUser({ id: decoded.user_id, role: decoded.role, token });
                } catch (error) {
                    console.error("Invalid token");
                    sessionStorage.removeItem("token");
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);
    const login = (token) => {
        sessionStorage.setItem("token", token);
        const decoded = jwt_decode(token);
        setUser({ id: decoded.user_id, role: decoded.role, token });
    };
    const logout = () => {
        sessionStorage.removeItem("token");
        setUser(null);
    }
    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
export const useAuth = () => useContext(AuthContext);