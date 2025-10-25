import React from "react";
import "./Components.css";

const Input = React.forwardRef(({ className = "", type = "text", ...props }, ref) => {
  return (
    <input
      type={type}
      className={`input-base ${className}`}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";

// Use named export to resolve the "doesn't provide an export named: 'Input'" error.
export { Input };
