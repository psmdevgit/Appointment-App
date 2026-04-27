import React, { useEffect, useState } from "react";
import API from "../axios";
import logo from "../assets/pos.png"
import userIcon  from '../assets/profile.png'

const Status = () => {
  const mobile = localStorage.getItem("mobile");
  const [data, setData] = useState([]);
const [selectedImage, setSelectedImage] = useState(null);

  // ✅ MOVE HERE (GLOBAL inside component)
  const formatDate = (dateStr) => {
    if (!dateStr) return "";

    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const getImageSrc = (path) => {
    if (!path) return userIcon;
  
    const isBase64 = !path.includes(".") && path.length > 100;
  
    if (isBase64) {
      return `data:image/png;base64,${path}`;
    }
  
    // ✅ MUST start with /
    return `/Images/${path}`;
  };
  


  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get(`/appointment-status/${mobile}`);
        if (res.data.status === "success") {
          setData(res.data.data || []);
        }

        
      } catch (err) {
        console.log(err);
      }
    };



    if (mobile) fetchData();
  }, [mobile]);

    useEffect(() => {
    if (!mobile) {
       window.location.href = "/";
    }
  }, [mobile]);


  const getStatusText = (status) => {
    switch (status) {
      case 0: return "Pending";
      case 1: return "Rejected";
      case 2:
      case 3:
      case 4: return "Approved";
      default: return "Pending";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 0: return "pending";
      case 1: return "rejected";
      default: return "approved";
    }
  };

  return (
    <div className="status-container">

            <div className="d-flex row top-bar  justify-content-between ">

            <div className=" col-6 ">
            <img src={logo} className="logo"></img>

            </div>

            <div className="d-flex gap-2 col-6 justify-content-end align-items-center">
                {/* STATUS ICON */}
                <div className="icon-btn status-btn" title="Appointment" onClick={() => window.location.href = "/appoint"}>
               
                <i class="bi bi-journal-check"></i>
                </div>

                {/* LOGOUT ICON */}
                <div
                className="icon-btn logout-btn"
                title="Logout"
                onClick={() => {
                    localStorage.removeItem("mobile");
                    window.location.href = "/";
                }}
                >
                <i className="bi bi-box-arrow-right"></i>
                </div>
            </div>
            

        </div>

      {/* STYLE INSIDE SAME FILE */}
      <style>{`
        .status-container {
          min-height: 100vh;
        }

        .title {
          text-align: center;
          margin-bottom: 20px;
          font-weight: bold;
        }

        .status-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fff;
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 12px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }

        .left-img img {
          width: 70px;
          height: 70px;
          border-radius: 10px;
          object-fit: cover;
        }

        .middle {
          flex: 1;
          padding: 0 15px;
        }

        .middle h5 {
          margin: 0;
          font-size: 16px;
        }

        .middle p {
          margin: 2px 0;
          font-size: 13px;
          color: #555;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          min-width: 90px;
          text-align: center;
        }

        .pending {
          background: #fff3cd;
          color: #856404;
        }

        .rejected {
          background: #f8d7da;
          color: #721c24;
        }

        .approved {
          background: #d4edda;
          color: #155724;
        }
          .logo{
                width: 120px;
            }

            .status-list {
            max-height: 800px;
            overflow-y: auto;
            padding-right: 5px;
            }

            /* Optional smooth scroll */
            .status-list::-webkit-scrollbar {
            width: 6px;
            }

            .status-list::-webkit-scrollbar-thumb {
            background: #ccc;
            border-radius: 10px;
            }


        @media (max-width: 600px) {
          .status-card {
            flex-direction: row;
          }
              .status-list {
            max-height: 550px;
            }

          .middle p {
            font-size: 12px;
          }
            .top-bar{
                margin-top: -5px !important;
            }
                
                .logo{
                width: 100px;
                height: 50px !important;
            }
            
            .middle h5 {
                font-size: 14px;
            }

            .middle p {
                font-size: 11px;
            }

            .status-badge {
                font-size: 10px;
                min-width: 70px;
                padding: 5px 8px;
            }

            .status-card {
                padding: 10px;
            }
  
        }
      `}</style>

      <h4 className="text-center mb-3">My Appointments</h4>

   
<div className="status-list">
  {data.length === 0 ? (
    <p>No Appointments Found</p>
  ) : (
    data.map((item, index) => (
      <div className="status-card" key={index}>

        {/* IMAGE */}
        <div className="left-img">
          {/* <img src={`data:image/png;base64,${item.imagePath}`} /> */}
          <img
            // src={`data:image/png;base64,${item.imagePath}`}
            src={getImageSrc(item.imagePath)}
            onClick={() => setSelectedImage(item.imagePath)}
            style={{ cursor: "pointer" }}
            />
        </div>

        {/* DETAILS */}
        <div className="middle">
          <h5>{item.vName} - {item.companyName}</h5>

          <p>
            <b>Date:</b> {item.apptTime}  {formatDate(item.apptDate)}
          </p>

          <p><b>To Meet :</b> {item.toMeet}</p>
        </div>

        {/* STATUS */}
        <div className={`status-badge ${getStatusClass(item.status)}`}>
          {getStatusText(item.status)}
        </div>

      </div>
    ))
  )}
</div>


{selectedImage && (
  <div
    className="modal fade show d-block"
    tabIndex="-1"
    style={{ background: "rgba(0,0,0,0.7)" }}
  >
    <div className="modal-dialog modal-dialog-centered modal-lg">
      <div className="modal-content">

        <div className="modal-header">
          <h5 className="modal-title">Image Preview</h5>
          <button
            className="btn-close"
            onClick={() => setSelectedImage(null)}
          ></button>
        </div>

        <div className="modal-body text-center">
          <img
            // src={`data:image/png;base64,${selectedImage}`}
            
            src={getImageSrc(selectedImage)}
            className="img-fluid rounded"
            style={{
              maxHeight: "70vh",
              objectFit: "contain"
            }}
          />
        </div>

      </div>
    </div>
  </div>
)}



    </div>
  );
};

export default Status;