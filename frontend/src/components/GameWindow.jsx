import { useState, useEffect } from "react";
import "./styles/GameWindow.css";

const SYMBOLS = ["❄️", "☃️", "🧊", "☕"];

const WIN_MULTIPLIERS = {
  "☃️": { message: "🎉 Snowy Win! x1.5" },
  "🧊": { message: "🎉 Cool Win! x2" },
  "☕": { message: "🎉 Hot Win! x5" },
  "❄️": { message: "🎊 SNOWFLAKE MEGA BIG WIN! x20" },
};

export const GameWindow = () => {
  const [spinResult, setSpinResult] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState([SYMBOLS[0], SYMBOLS[0], SYMBOLS[0]]);
  const [betAmount, setBetAmount] = useState("0.00");
  const [buttonText, setButtonText] = useState("Spin");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!window.localStorage.getItem('token'));

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'token') setIsLoggedIn(!!e.newValue);
    };
    window.addEventListener('storage', onStorage);
    setIsLoggedIn(!!window.localStorage.getItem('token'));
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (isSpinning) {
      setButtonText('Spinning...');
      return;
    }
    setButtonText(isLoggedIn ? 'Spin' : 'demo spin');
  }, [isLoggedIn, isSpinning]);

  const handleBetChange = (e) => {
    let value = e.target.value;
    let normalizedValue = value.replace(",", ".");
    const regex = /^\d*\.?\d*$/;
    if (!regex.test(normalizedValue) && normalizedValue !== "" && normalizedValue !== ".")
      return;

    const digitsOnly = normalizedValue.replace(".", "");
    if (digitsOnly.length > 6) return;

    setBetAmount(value);
  };

  const getWinMessage = (result) => {
    if (result[0] === result[1] && result[1] === result[2]) {
      return WIN_MULTIPLIERS[result[0]].message;
    }
    return "Try again!";
  };

  const startAnimation = (resultIndices, finalBalance) => {
    const finalResult = resultIndices.map((i) => SYMBOLS[i]);

    const reelDurations = [2500, 3500, 4500];

    reelDurations.forEach((duration, reelIndex) => {
      let currentSymbolIndex = 0;
      const intervalSpeed = 100;

      const interval = setInterval(() => {
        setReels((prev) => {
          const newReels = [...prev];
          newReels[reelIndex] = SYMBOLS[currentSymbolIndex % SYMBOLS.length];
          return newReels;
        });
        currentSymbolIndex++;
      }, intervalSpeed);

      setTimeout(() => {
        clearInterval(interval);
        setReels((prev) => {
          const newReels = [...prev];
          newReels[reelIndex] = finalResult[reelIndex];
          return newReels;
        });

        if (reelIndex === 2) {
          setTimeout(() => {
            setIsSpinning(false);
            if (finalBalance !== undefined) {
              window.localStorage.setItem('balance', finalBalance.toString());
              window.dispatchEvent(new Event('storage'));
            }
            const message = getWinMessage(finalResult);

            if (message !== "Try again!") {
              const overlay = document.createElement("div");
              overlay.className = "win-overlay";

              for (let i = 0; i < 30; i++) {
                const particle = document.createElement("div");
                particle.className = "win-particle";
                particle.style.background = `hsl(${
                  Math.random() * 60 + 170
                } 100% 60%)`;
                particle.style.left = `${Math.random() * 100}%`;
                particle.style.top = `${Math.random() * 100}%`;
                particle.style.animationDelay = `${
                  Math.random() * 0.5
                }s, ${Math.random()}s`;
                overlay.appendChild(particle);
              }

              const toast = document.createElement("div");
              toast.className = "win-toast";
              toast.textContent = message;

              overlay.appendChild(toast);
              document.body.appendChild(overlay);

              overlay.addEventListener("click", () => overlay.remove());
              setTimeout(() => overlay.remove(), 6000);
            }
          }, 200);
        }
      }, duration);
    });
  };

  const spin = () => {
    if (isSpinning) return;
    setErrorMessage("");
    const token = window.localStorage.getItem('token');
    const bet = parseFloat(betAmount.toString().replace(',', '.')) || 0;
    if (token) {
      const storedBalance = parseFloat(window.localStorage.getItem('balance')) || 0;
      if (bet > storedBalance) {
        setErrorMessage('broke ass');
        return;
      }
    }

    setIsSpinning(true);
    if (token) {
      try {
        const headers = { 'Content-Type': 'application/json' };
        headers['Authorization'] = `Bearer ${token}`;
        fetch('http://localhost:5000/api/spin', {
          method: 'POST',
          headers,
          body: JSON.stringify({ token, bet }),
        })
          .then((r) => r.json().catch(() => ({ error: "Invalid JSON response" })))
          .then((data) => {
            console.log('spin response', data);
            if (data.result) {
              const storedBalance = parseFloat(window.localStorage.getItem('balance')) || 0;
              const newBalance = storedBalance - bet;
              window.localStorage.setItem('balance', newBalance.toString());
              window.dispatchEvent(new Event('storage'));

              const backendToFrontendMapping = { 0: 1, 1: 2, 2: 3, 3: 0 };
              const resultIndices = Array.from(data.result, (s) => parseInt(s, 10));
              const frontendIndices = resultIndices.map(i => backendToFrontendMapping[i]);
              
              setSpinResult(frontendIndices);
              startAnimation(frontendIndices, data.balance);
            } else {
              setErrorMessage(data.error || 'Something went wrong');
              setIsSpinning(false);
            }
          })
          .catch((err) => {
            console.error('spin request failed', err);
            setErrorMessage('Something went wrong');
            setIsSpinning(false);
          });
      } catch (e) {
        console.error('failed to send spin request', e);
        setErrorMessage('Something went wrong');
        setIsSpinning(false);
      }
    } else {
      const randomResults = Array.from({ length: 3 }, () => Math.floor(Math.random() * SYMBOLS.length));
      setSpinResult(randomResults);
      startAnimation(randomResults);
    }
  };

  return (
    <div className="slot-machine-container">
    <div className="slot-machine">
      <div className="reels-container">
          {reels.map((symbol, index) => (
            <div key={index} className="reel">
              <div className={`reel-symbol ${isSpinning ? "spinning" : ""}`}>
                {symbol}
              </div>
            </div>
          ))}
        </div>

        {errorMessage && (
          <div className="error-banner" role="status">
            <div className="error-icon">💥</div>
            <div className="error-text">{errorMessage}</div>
          </div>
        )}

        <div className="spin-controls">
          {isLoggedIn && (
            <div className="bet-input-group">
              <label htmlFor="bet-amount">Bet:</label>
              <input
                id="bet-amount"
                type="text"
                inputMode="decimal"
                value={betAmount}
                onChange={handleBetChange}
                disabled={isSpinning}
                placeholder="0.00"
              />
            </div>
          )}

          <button
            onClick={spin}
            disabled={isSpinning}
            className="spin-button"
            onMouseEnter={() => {
              if (isSpinning) return;
              if (isLoggedIn) setButtonText('Spin 🤑');
            }}
            onMouseLeave={() => {
              if (isSpinning) return;
              setButtonText(isLoggedIn ? 'Spin' : 'demo spin');
            }}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameWindow;