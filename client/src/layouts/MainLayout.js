import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
import mainbg from '../assets/dr11.jpg'

export default function MainLayout() {
  return (
  

    <div className="main-layout-bg"
    style={{
        minHeight: "100vh",
        backgroundImage: `url(${mainbg})`, // 👈 use imported image
        backgroundSize: "cover",
        backgroundPosition: "center right",
        backgroundRepeat: "no-repeat"
      }}
      >
      <Navbar />
      <div className="container-fluid w-100 mt-3">
        <Outlet />
      </div>
    </div>
  
  );
}