import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Snow, { Snowfall } from "../components/Snowfall.jsx";
import "./styles/Payment.css";

const Payment = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.body.classList.add("auth-page");
    document.documentElement.classList.add("auth-page");
    return () => {
      document.body.classList.remove("auth-page");
      document.documentElement.classList.remove("auth-page");
    };
  }, []);

  const [clientAddress, setClientAddress] = useState("");
  const [clientWithdrawAmount, setClientWithdrawAmount] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [mode, setMode] = useState("deposit");

  const [transactionHash, setTransactionHash] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const sitePublicAddress = "0x78845589616dE3Aae6a132968cA9E426fc959F7E";

  useEffect(() => {
    setTransactionHash("");
    setError("");
    if (mode === "deposit") {
      setDepositAmount("");
      setConnectedAccount(null);
    } else {
      setClientAddress("");
      setClientWithdrawAmount("");
    }
  }, [mode]);

  const connectWallet = async () => {
    setError("");
    if (!window.ethereum) {
      setError("MetaMask not detected. Please install MetaMask.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts && accounts[0]) setConnectedAccount(accounts[0]);
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError("Could not connect wallet.");
    }
  };

  const handleDeposit = async (e) => {
    e?.preventDefault?.();
    setError("");
    setTransactionHash("");

    if (!window.ethereum) {
      setError("MetaMask not detected. Please install MetaMask.");
      return;
    }
    if (
      !depositAmount ||
      isNaN(parseFloat(depositAmount)) ||
      parseFloat(depositAmount) < 0.0001
    ) {
      setError("Enter a valid deposit amount. Minimum 0.0001 ETH.");
      return;
    }
    setIsLoading(true);

    try {
      if (!connectedAccount) {
        setError("Please connect your wallet first.");
        setIsLoading(false);
        return;
      }

      // convert ETH amount to wei
      const amountFloat = parseFloat(depositAmount);
      const wei = BigInt(Math.round(amountFloat * 1e18));
      const txParams = {
        from: connectedAccount,
        to: sitePublicAddress,
        value: "0x" + wei.toString(16),
      };

      // send transaction via MetaMask
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [txParams],
      });

      // send txHash to backend with JWT
      const token = window.localStorage.getItem("token");
      const endpoint = "/api/deposit";
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          txHash: txHash,
        }),
        credentials: "include",
      });

      if (resp.ok) {
        // SUCCESS: Set the transaction hash to display
        setTransactionHash(txHash);
        window.localStorage.setItem("balance", ((parseFloat(depositAmount)*10000) || 0) + (parseFloat(window.localStorage.getItem("balance")) || 0));
        // alert("Deposit transaction sent. TX: " + txHash); // Removed alert
      } else {
        const errData = await resp.json().catch(() => ({}));
        setError(errData.message || "Failed to record deposit on server.");
      }
    } catch (err) {
      console.error("Network / tx error during deposit:", err);
      setError("A network or transaction error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e?.preventDefault();
    setError("");
    setTransactionHash(""); // Reset hash on new attempt
    setIsLoading(true);

    const endpoint = "/api/withdraw";
    try {
      const token = window.localStorage.getItem("token");
      if (!token) {
        setError("Not authenticated. Please log in.");
        setIsLoading(false);
        return;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          address: clientAddress,
          amount: parseFloat(clientWithdrawAmount) || 0,
        }),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        if (data && data.txHash) {
          // SUCCESS: Set the transaction hash to display
          setTransactionHash(data.txHash);
          // alert("Payment request sent. TX: " + data.txHash); // Removed alert
        } else {
          // Fallback if no hash returned but success
          alert("Payment request sent.");
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || "Sending Payment failed.");
      }
    } catch (err) {
      console.error("Network error during payment:", err);
      setError("A network error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleCopyHash = async () => {
    try {
      await navigator.clipboard.writeText(transactionHash);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      alert("Failed to copy hash. Please copy it manually.");
    }
  };

  return (
    <div className="casino-container">
      {/* Animated Stars Background */}
      <Snowfall />
      {/* Header */}
      <header className="casino-header" onClick={handleLogoClick}>
        <h1 className="casino-title">
          <span className="snowflake-icon">❄️</span>
          Snowflake Casino
        </h1>
      </header>

      {/* Tab Navigation (Mapped to Mode) */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${mode === "withdraw" ? "active" : ""}`}
          onClick={() => setMode("withdraw")}
        >
          Withdraw
        </button>
        <button
          className={`tab-button ${mode === "deposit" ? "active" : ""}`}
          onClick={() => setMode("deposit")}
        >
          Deposit
        </button>
      </div>

      {/* Main Card */}
      <div className="casino-card">
        <h2 className="card-title">
          {mode === "deposit"
            ? "Need more ammo captain?"
            : "Maybe one more spin?"}
        </h2>

        {/* Wallet Connection Status (Shown if connected) */}
        {connectedAccount && (
          <div className="wallet-status connected">
            <div className="status-text">Wallet Connected</div>
            <div className="connected-address">
              {connectedAccount.slice(0, 6)}...{connectedAccount.slice(-4)}
            </div>
          </div>
        )}

        {/* DEPOSIT MODE */}
        {mode === "deposit" && (
          <>
            <div className="form-group">
              <label className="form-label">Amount to Deposit (ETH)</label>
              <input
                type="number"
                className="form-input"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="1 ETH = 10,000 shards"
                step="0.01"
              />
            </div>

            <div className="button-group">
              {!connectedAccount ? (
                <button
                  className="primary-button"
                  onClick={connectWallet}
                  disabled={isLoading}
                >
                  Connect Wallet
                </button>
              ) : (
                <button
                  className="secondary-button"
                  onClick={() => setConnectedAccount(null)}
                >
                  Disconnect
                </button>
              )}

              <button
                className="primary-button"
                onClick={handleDeposit}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Deposit"}
              </button>
            </div>
          </>
        )}

        {/* WITHDRAW MODE */}
        {mode === "withdraw" && (
          <form onSubmit={handlePayment}>
            <div className="form-group">
              <label className="form-label">Your Wallet Address</label>
              <input
                type="text"
                className="form-input"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                placeholder="Enter your wallet address"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Amount to Withdraw</label>
              <input
                type="number"
                className="form-input"
                value={clientWithdrawAmount}
                onChange={(e) => setClientWithdrawAmount(e.target.value)}
                placeholder="Enter amount to withdraw"
                required
              />
            </div>

            <div className="button-group">
              <button
                type="submit"
                className="primary-button"
                disabled={isLoading}
              >
                {isLoading ? "Sending Payment..." : "Send Payment"}
              </button>
            </div>
          </form>
        )}

        {/* Transaction Hash (Shown after successful transaction) */}
        {transactionHash && (
          <div className="wallet-section">
            <label className="wallet-label">Transaction Hash:</label>
            <div className="wallet-address">{transactionHash}</div>
            <button
              className={`copy-button ${isCopied ? "copied" : ""}`}
              onClick={handleCopyHash}
            >
              {isCopied ? "✓ Copied!" : "Copy Hash"}
            </button>
          </div>
        )}

        {/* Success Message (Shown implicitly if TX hash exists, but we can also add a message) */}
        {transactionHash && (
          <div className="success-message">
            {mode === "deposit"
              ? "✓ Deposit initiated successfully!"
              : "✓ Withdrawal initiated successfully!"}
          </div>
        )}

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default Payment;
