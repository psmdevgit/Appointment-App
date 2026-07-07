import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/pos.png";
import "../style/navbar.css";

export default function Navbar() {
  const location = useLocation();
  // const user = JSON.parse(localStorage.getItem("user"));

  let user = null;

    try {
      const stored = localStorage.getItem("user");

      if (stored && stored !== "undefined" && stored !== "[object Object]") {
        user = JSON.parse(stored);
      }
    } catch (err) {
      console.error("Invalid user data");
      localStorage.removeItem("user");
    }


  const [time, setTime] = useState(new Date());

  // live clock
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

//    useEffect(() => {
//   if (!user) {
//     window.location.href = "/login";
//   }
// }, [user]);

  const navigate = useNavigate();

    useEffect(() => {
      if (!user) {
        localStorage.removeItem("user");
        navigate("/login");
      }
    }, [user, navigate]);


  return (
    <>
      {/* TOP BAR */}
      <div className="navbar-top border-bottom px-3 py-1" style={{background:"#9FCB98"}}>
        <div className="d-flex align-items-center justify-content-between w-100">

          {/* LEFT TITLE (hide on mobile) */}
          <div className="left-title">
            <h6 className="m-0">Appointment System</h6>
          </div>

          {/* CENTER LOGO */}
          <div className="logo-center">
            <img src={logo} className="logo" alt="logo" />
          </div>

          {/* RIGHT USER INFO */}
          <div className="right-user d-flex align-items-center gap-2" onClick={() => navigate("/login")}>

            <i className="bi bi-person-circle user-icon"></i>

            <div className="text-start">
              <div className="user-name text-black ">
                {user?.empName}
              </div>

              <div className="user-time text-black fw-bold">
                {time.toLocaleDateString()} {time.toLocaleTimeString()}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* MENU */}
      <div className="bg-light px-lg-5 py-lg-2 menu-bar d-flex justify-content-between">

        <div>

            <Link
                className={`btn btn-sm me-2 menubtn ${
                  location.pathname === "/checkin" ? "btn-success" : "btn-outline-success"
                }`}
                to="/checkin"
              >
                Check In
              </Link>

              <Link
                className={`btn btn-sm me-2 menubtn ${
                  location.pathname === "/checkout"
                    ? "btn-success"
                    : "btn-outline-success"
                }`}
                to="/checkout"
              >
                Check Out
              </Link>

              <Link
                className={`btn btn-sm menubtn ${
                  location.pathname === "/reports"
                    ? "btn-success"
                    : "btn-outline-success"
                }`}
                to="/reports"
              >
                Reports
              </Link>

        </div>
        

        <div>
           <Link
            className={`btn btn-sm menubtn ${
              location.pathname === "/visiterlist"
                ? "btn-success"
                : "btn-outline-success"
            }`}
            to="/visiterlist"
          >
            Visiter List
          </Link>
        </div>
      </div>
    </>
  );
}