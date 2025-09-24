import React from "react";
// ...existing code...

export default function AccountPage({ children }) {
  return (
  <div className="account-container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="w-100" style={{ maxWidth: "400px" }}>
        {children}
      </div>
    </div>
  );
}
