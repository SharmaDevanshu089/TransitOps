import { useLocation } from "react-router-dom";
import "./Footer.css";

export function Footer() {
    const location = useLocation();
    const isLoginPage = location.pathname === '/' || location.pathname === '/register' || location.pathname === '/vehicle-ops-login';

    if (isLoginPage) return null;

    return (
        <footer className="main-footer">
            <p>
                Developed by <a href="https://github.com/SharmaDevanshu089" target="_blank" rel="noreferrer">Devanshu Sharma</a> & <a href="https://github.com/v-krishna07" target="_blank" rel="noreferrer">Krishna Vijaywargiya</a>
            </p>
            <p>
                <a href="https://github.com/SharmaDevanshu089/TransitOps" target="_blank" rel="noreferrer">View Repository</a>
            </p>
        </footer>
    );
}
