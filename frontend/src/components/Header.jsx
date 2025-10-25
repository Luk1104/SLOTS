import './styles/Header.css';
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from 'react';

function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const [token, setToken] = useState(() => window.localStorage.getItem('token'));
    const [balance, setBalance] = useState(() => window.localStorage.getItem('balance') || '0');

    useEffect(() => {
        const onStorage = () => {
            setToken(window.localStorage.getItem('token'));
            setBalance(window.localStorage.getItem('balance') || '0');
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    useEffect(() => {
        setToken(window.localStorage.getItem('token'));
        setBalance(window.localStorage.getItem('balance') || '0');
    }, [location]);

    const handleWalletClick = () => {
        if (token) {
            try {
                window.localStorage.removeItem('token');
                window.localStorage.removeItem('balance');
                window.location.reload();
            } catch (e) {
                console.warn('Failed to clear localStorage', e);
            }
            setToken(null);
            setBalance('0');
            return;
        } else {
            navigate('/login');
        }
    };

    const formattedBalance = (() => {
        const val = parseFloat(balance);
        if (Number.isFinite(val)) return val.toFixed(2);
        return '0.00';
    })();

    return (
        <header className="game-header">
            <div className="container">
                <div className="header-left">
                    <div className="snowflake-icon">❄️</div>
                    <h1 className="casino-name">
                        Snowflake Casino
                    </h1>
                </div>
                
                <div className="header-right">
                    {token && (
                        <div className="balance-info">
                            <span className="balance-icon">💎</span>
                            <span className="balance-text">Balance: {formattedBalance}</span>
                        </div>
                    )}
                    <button 
                        onClick={handleWalletClick}
                        className="wallet-button"
                    >
                        {token ? 'Disconnect' : 'Connect'}
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Header;