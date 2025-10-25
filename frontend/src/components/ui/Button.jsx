import React from "react";
import "./Components.css";

// Now defined as a constant and exported below to support named imports.
const Button = React.forwardRef(({ className = "", children, ...props }, ref) => {
  return (
    <button 
      ref={ref}
      className={`btn-base ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

// Changed to named export to fix the error in Login.jsx
export { Button };
