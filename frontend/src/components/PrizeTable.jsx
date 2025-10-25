import "./styles/PrizeTable.css";

export const PrizeTable = () => {
  const prizes = [
    { name: "Snowy Win", symbols: ["☃️", "☃️", "☃️"], multiplier: "x1.5", color: "white" },
    { name: "Cool Win", symbols: ["🧊", "🧊", "🧊"], multiplier: "x2", color: "cyan" },
    { name: "Hot Win", symbols: ["☕","☕","☕"], multiplier: "x5", color: "orange" },
    { name: "Snowflake Mega Big Win", symbols: ["❄️", "❄️", "❄️"], multiplier: "x20", color: "neon" },
  ];

  return (
    <div className="prize-table">
      <h2 className="prize-title">Prize Table</h2>
      
      <div className="prize-list">
        {prizes.map((prize, index) => (
          <div key={index} className="prize-item">
            <div className="prize-symbols">
              {prize.symbols.map((symbol, i) => (
                <div key={i} className="prize-symbol">{symbol}</div>
              ))}
            </div>
            <p className={`prize-name prize-${prize.color}`}>{prize.name}</p>
            <p className="prize-multiplier prize-white">= {prize.multiplier}</p>
          </div>
        ))}
      </div>
    </div>
  );
};