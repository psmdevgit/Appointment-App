import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

import CheckIn from "./components/CheckIn";
import CheckOut from "./components/CheckOut";
import Reports from "./components/Reports";
import Login from "./components/Login";
import Approvals from "./components/ApprovalPage";
import UserLogin from "./User/UserLogin";
import Appoint from "./User/Appoint.js";
import Status from "./User/Status.js";
import ErrorPage from "./components/ErrorPage";


function App() {
  return (
    <Router>
      <Routes>

          <Route path="*" element={<ErrorPage />} />
          <Route path="/" element={<UserLogin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/approvals" element={<Approvals />} />

        {/* 🔹 WITHOUT NAVBAR */}
        <Route element={<AuthLayout />}>
          <Route path="/appoint" element={<Appoint />} />
          <Route path="/status" element={<Status />} />
        </Route>

        {/* 🔹 WITH NAVBAR */}
        <Route element={<MainLayout />}>        
          <Route path="/checkin" element={<CheckIn />} />
          <Route path="/checkout" element={<CheckOut />} />
          <Route path="/reports" element={<Reports />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;