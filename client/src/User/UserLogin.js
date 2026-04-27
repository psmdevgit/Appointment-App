import React, { useState } from "react";
import "../style/userLogin.css";
import logo from "../assets/pos.png";
import API from "../axios";
import { useNavigate } from "react-router-dom";

export default function UserLogin() {
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

     const [toast, setToast] = useState({
    message: "",
    type: "", // success | danger
    show: false
  });

  const handleLogin = async () => {
    if (!phone) {
      alert("Enter phone number");
      return;
    }

    // ✅ 10 digit validation
  if (!/^[0-9]{10}$/.test(phone)) {
    showToast("Enter valid 10-digit mobile number", "danger");
    return;
  }

    try {
      const res = await API.post("/user-login", {
        mobilenumber: phone
      });

      // ✅ Save mobile always
      localStorage.setItem("mobile", phone);

      if (res.data.status === "exists") {
        
        localStorage.setItem("user", res.data.data);
        // alert("Welcome Back");
         showToast("Welcome Back", "success");
      } else {
        // alert("Login Successfully");
         showToast("Login Successfully", "success");
      }

      // ✅ Go to appoint page
      // navigate("/appoint");
        setTimeout(() => {
      navigate("/appoint");
    }, 3000);

    } catch (err) {
      // alert("Server Error");
        showToast("Server Error", "danger");
    }
  };

 const showToast = (msg, type) => {
  setToast({ message: msg, type, show: true });

  setTimeout(() => {
    const toastEl = document.getElementById("liveToast");
    if (toastEl) {
      const bsToast = new window.bootstrap.Toast(toastEl, {
        delay: 3000
      });
      bsToast.show();
    }
  }, 100); // small delay to ensure DOM render
};

  return (
    <div className="login-container d-flex justify-content-center align-items-center">
      <div className="text-center login-box">

        <img src={logo} alt="logo" className="logo" />

        <h2 className="welcome-text">Welcome</h2>

        <div className="text-start w-100 mt-4">
          <label className="form-label">Phone Number</label>
          <input
            type="tel"
            className="form-control phone-input"
            value={phone}
            // onChange={(e) => setPhone(e.target.value)}
             onChange={(e) => {
              const value = e.target.value;

              // ✅ allow only numbers & max 10 digits
              if (/^\d{0,10}$/.test(value)) {
                setPhone(value);
              }
            }}
          />
        </div>

        <button className=" login-btn mt-4" onClick={handleLogin}>
          Login
        </button>
      </div>

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