import { useEffect, useState } from "react";
import "./styles/Snowfall.css";

const createFlake = (i) => ({
  id: i,
  left: Math.random() * 100, 
  animationDuration: 5 + Math.random() * 10, 
  opacity: 0.3 + Math.random() * 0.7,
  size: 2 + Math.random() * 4,
  animationDelay: Math.random() * 5, 
});

export const Snowfall = () => {
  const [snowflakes, setSnowflakes] = useState([]);

  useEffect(() => {
    const flakes = Array.from({ length: 50 }, (_, i) => createFlake(i));
    setSnowflakes(flakes);
  }, []);

  return (
    <div className="snowfall-container">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake-item"
          style={{
            left: `${flake.left}%`,
            animationDuration: `${flake.animationDuration}s`,
            opacity: flake.opacity,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            animationDelay: `${flake.animationDelay}s`,
          }}
        />
      ))}
    </div>
  );
};

export default Snowfall;