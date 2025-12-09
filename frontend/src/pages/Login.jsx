import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Snowfall } from "../components/Snowfall";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Link } from "react-router-dom";

import "./styles/Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('auth-page');
    document.body.classList.add('auth-page');
    return () => {
      document.documentElement.classList.remove('auth-page');
      document.body.classList.remove('auth-page');
    };
  }, []);

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const endpoint = '/api/login';
  
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Login successful:", data);
        try {
          if (data.token) {
            window.localStorage.setItem('token', data.token);
          }
          if (data.balance !== undefined) {
            window.localStorage.setItem('balance', String(data.balance));
          }
        } catch (e) {
          console.warn('Failed to save auth data to localStorage', e);
        }

        navigate("/");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Network error during login:", err);
      setError("A network error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Snowfall />

      <div className="logo-section">
        <div className="logo-icon">❄️</div>
        <h1 
          className="logo-text"
          onClick={handleLogoClick}
          style={{ cursor: 'pointer' }}
        >
          Snowflake Casino
        </h1>
      </div>

      <div className="login-card-wrapper">
        <div className="login-card">
          <h2 className="welcome-text">
            Welcome Back
          </h2>

          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <label className="input-label">
                Email or Username
              </label>
              <Input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="input-field"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input-field"
                required
              />
            </div>
            
            {error && (
                <p className="error-message">{error}</p>
            )}

            <Button
              type="submit"
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>

            <p className="signup-prompt">
              Don't have an account?{" "}
              <Link to="/register" className="signup-link">
              Register
              </Link>
            </p>
          </form>
        </div>
      </div>

      <div className="decorative-background" />
    </div>
  );
};

export default Login;