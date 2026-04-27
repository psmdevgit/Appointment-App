
import React, { useState } from "react";
import logo from "../assets/pos.png";
import "../style/login.css";
import API from "../axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // toast state
  const [toast, setToast] = useState({
    message: "",
    type: "success",
    show: false,
  });

  // const showToast = (msg, type = "success") => {
  //   setToast({ message: msg, type, show: true });

  //   const toastEl = document.getElementById("liveToast");
  //   const bsToast = new window.bootstrap.Toast(toastEl, {
  //     delay: 3000,
  //   });

  //   bsToast.show();
  // };
const showToast = (msg, type = "success", callback = null) => {
  setToast({ message: msg, type, show: true });

  const toastEl = document.getElementById("liveToast");
  const bsToast = new window.bootstrap.Toast(toastEl, {
    delay: 3000,
  });

  bsToast.show();

  // ✅ trigger callback after toast hides
  if (callback) {
    setTimeout(() => {
      callback();
    }, 3000); // same as toast delay
  }
};
const handleLogin = async (e) => {
  e.preventDefault();

  if (!username) return showToast("Enter username", "danger");
  if (!password) return showToast("Enter password", "danger");

  try {
    setLoading(true);

    const res = await API.post("/login", {
      username,
      password,
    });

    localStorage.setItem("user", JSON.stringify(res.data.data));

    // ✅ toast first, THEN redirect after close
    showToast("Login Success", "success", () => {
      navigate("/checkin");
    });

  } catch (err) {
    showToast(
      err?.response?.data?.message || "Invalid login",
      "danger"
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="loginmain d-flex justify-content-center align-items-center vh-100">

      <div className="box shadow rounded-3">

        {/* LOGO */}
        <div className="logo-container">
          <img src={logo} alt="logo" className="login-logo" />
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin}>
          <div className="form-area">

            {/* USERNAME */}
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* PASSWORD */}
            <div className="form-group position-relative">
              <label>Password</label>

              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <i
                className={`bi eye ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                onClick={() => setShowPassword(!showPassword)}
              ></i>
            </div>

            {/* BUTTON */}
            <button
              className="login-btn"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

          </div>
        </form>
      </div>

      {/* TOAST */}
      <div className="toast-container position-fixed top-0 end-0 p-3">
        <div
          id="liveToast"
          className={`toast align-items-center text-bg-${toast.type} border-0`}
          role="alert"
        >
          <div className="d-flex">
            <div className="toast-body">
              {toast.message}
            </div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              data-bs-dismiss="toast"
            ></button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Login;
