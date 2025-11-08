import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Snowfall } from "../components/Snowfall";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

import "./styles/Register.css";

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); 

    if (password !== confirmPassword) {
      setError("Error: Passwords do not match.");
      return;
    }

    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{12,}$/;
    if (!passwordRegex.test(password)) {
      setError("Password is required to have 12 characters with at least one number and one special character.");
      return;
    }

    setIsLoading(true); 
    const endpoint = 'http://localhost:5000/api/register'; 

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
        console.log("Registration successful:", data);
        
        alert("Registration successful! Please log in."); 
        navigate("/login"); 
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Registration failed. Please try a different email.");
      }
    } catch (err) {
      console.error("Network error during registration:", err);
      setError("A network error occurred. Please try again later.");
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div className="register-container">
      <Snowfall />

      {/* Logo at top */}
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

      {/* Register Card */}
      <div className="register-card-wrapper">
        <div className="register-card">
          <h2 className="welcome-text">
            Create Your Account
          </h2>

          <form onSubmit={handleRegister} className="register-form">
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
                placeholder="Choose a password"
                className="input-field"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                Confirm Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="input-field"
                required
              />
            </div>
            
            {error && (
                <p className="error-message">{error}</p>
            )}

            <Button
              type="submit"
              className="register-button"
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Register"}
            </Button>

            <p className="login-prompt">
              Already have an account?{" "}
              <a href="/login" className="login-link">
                Log in
              </a>
            </p>
          </form>
        </div>
      </div>

      <div className="decorative-background" />
    </div>
  );
};

export default Register;
