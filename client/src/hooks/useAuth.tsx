import { useEffect, useState } from "react";
import useUserStore from "../store/useUserInfo";

const useZustandAuth = () => {
    const userInfo = useUserStore((state) => state.userInfo);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    useEffect(() => {
        // Check if user has auth token and is properly authenticated
        const auth = userInfo?.auth;
        console.log("Auth status:", auth);
        setIsAuthenticated(!!auth); // Convert to boolean - true if auth exists
    }, [userInfo?.auth])

    return isAuthenticated;
}

export default useZustandAuth