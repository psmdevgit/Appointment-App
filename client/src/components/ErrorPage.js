import React from "react";
import { useNavigate } from "react-router-dom";

export default function ErrorPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      background: "#f8f9fa"
    }}>
      <h2 style={{ color: "#c00000" }}>Invalid Page</h2>
      <small>Please login again or check the URL</small>

      <button
        className="btn btn-primary mt-3"
        onClick={() => navigate("/login")}
      >
        Go to Login
      </button>
    </div>
  );
}