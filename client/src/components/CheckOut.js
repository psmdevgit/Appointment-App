import React, { useState, useEffect } from "react";
import "../style/checkout.css";
import API from "../axios";
import profile from "../assets/profile.png";
import bcard from "../assets/bcard.png";
import userIcon  from '../assets/profile.png'
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

export default function CheckOut() {
  const [selected, setSelected] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const user = JSON.parse(localStorage.getItem("user"));
  
      const [selectedImage, setSelectedImage] = useState(null);
      const [checkoutLoading, setCheckoutLoading] = useState(false);

  // 🔹 Load data from API
  useEffect(() => {
    fetchData();
  }, []);


  const getImageSrc = (path) => {
    if (!path) return userIcon;
  
    const isBase64 = !path.includes(".") && path.length > 100;
  
    if (isBase64) {
      return `data:image/png;base64,${path}`;
    }
  
    // ✅ MUST start with /
    return `/Images/${path}`;
  };

  const getBCardSrc = (path) => {
    if (!path) return bcard;
  
    const isBase64 = !path.includes(".") && path.length > 100;
  
    if (isBase64) {
      return `data:image/png;base64,${path}`;
    }
  
    // ✅ MUST start with /
    return `/Images/${path}`;
  };

const formatDate = (date) => {
  if (!date) return "-";

  const d = new Date(date); // 👈 convert string to Date

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
};

const formatDateTime = (date) => {
  if (!date) return "-";

  try {
    const clean = date.replace("Z", "").split(".")[0];

    const [d, t] = clean.split("T");
    if (!d || !t) return "-";

    const [year, month, day] = d.split("-");
    const [hour, minute] = t.split(":");

    let h = parseInt(hour);
    const ampm = h >= 12 ? "pm" : "am";

    h = h % 12 || 12;

    return `${day}/${month}/${year}, ${String(h).padStart(2, "0")}:${minute} ${ampm}`;
  } catch {
    return "-";
  }
};
   
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await API.get("/checkin-list");

      console.log("result :",res);

      if (res.data.status === "success") {
        setData(res.data.data || []);
        setLoading(false);
      }
      else {
      setData([]);
    }
    } catch (err) {
      console.log("Error fetching checkin list:", err);
      setData([]);
    }
    finally {
    setLoading(false); // 👈 stop loading
  }
  };

const handleCheckOut = async () => {
  if (!selected) {
    alert("Select any check-in list vendor");
    return;
  }


  setCheckoutLoading(true); // 👉 start loader

  try {
    const payload = {
      id: selected.id,
      apptid: selected.apptid
    };

    const res = await API.post("/checkOUT", payload);

    if (res.data.status === "success") {
      const toastEl = document.getElementById("successToast");

      if (toastEl) {
        const toast = new window.bootstrap.Toast(toastEl, {
          delay: 3000
        });
        toast.show();
      }

      // optional improvements
      setSelected(null);
      fetchData();
    }

  } catch (err) {
    console.error(err);
    alert("Error submitting form");
  }
  finally {
    setCheckoutLoading(false); // 👉 stop loader always
  }
};


  return (
    <div className="container-fluid">

         {checkoutLoading && (
            <div className="loader-overlay">
              <div className="spinner-border text-light" role="status"></div>
            </div>
          )}

      <div className="row">

        {/* LEFT LIST */}
        <div className="col-md-4  px-lg-5 py-lg-0">
          <h4 className="text-danger mb-3 mt-3">Recently Check In : </h4>

           {/* 🔄 Loading */}
          {loading && (
            <p style={{ fontSize: "14px", color: "#888" }}>
              Loading...
            </p>
          )}

          {/* ❌ No Data */}
          {!loading && data.length === 0 && (
            <p style={{ fontSize: "14px", color: "#888" }}>
              No vendor check-in found
            </p>
          )}


            <div className="checkin-list px-2">
          {!loading && data.length > 0 &&  data.map((item, i) => (
            

                <div className="list-card" key={i}>
                  <div className="list-left">
                    <div className="avatar" onClick={() => setSelectedImage(item.imagePath)}>
                      <img
                      className="avatar"
                            // src={ item.imagePath ? `data:image/png;base64,${item.imagePath}` : profile                          
                            //   }

                                src={getImageSrc(item.imagePath)}
                                                    onError={(e) => {
                                                      e.target.src = userIcon;
                                                    }}

                            onClick={() => setSelectedImage(item.imagePath)}
                            style={{ cursor: "pointer" , objectFit:"contain"}}
                            />

                    </div>
                    <div>
                      <div className="name">
                        <b>
                          {item.vName}
                        </b>   
                        {" - "}                 
                            {item.companyName}
                      </div>
                    </div>
                  </div>

                  <button
                    className="view-btn"
                    onClick={() => setSelected(item)}
                  >
                    View
                  </button>
                </div>

        

            
          ))}
              </div>
        </div>

        

        {/* RIGHT DETAILS */}
        <div className="col-md-7">
          
            <h4 className="text-center mb-3 mt-3">CHECK OUT</h4>
          {/* {selected && ( */}
            <div className="details-section pt-lg-5 row ">

              <div className="profile-section col-md-3 ">
                <div className="profile-box">
                   {/* <img
                       src={
                            selected?.imagePath
                              ? `data:image/png;base64,${selected.imagePath}`
                              : profile
                          }

                         style={{ cursor: "pointer", width: "100%", height: "100%", objectFit: "cover", borderRadius:"10px" }}
                        /> */}


                        <img
                          src={getImageSrc(selected?.imagePath)}
                          onError={(e) => {
                            e.target.src = userIcon;
                          }}
                          style={{
                            cursor: "pointer",
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "10px"
                          }}
                        />

                       
                </div>
                <p>Vendor</p>

                <div className="card-box">
                   {/* <img
                       src={
                      selected?.bCardPath
                        ? `data:image/png;base64,${selected.bCardPath}`
                        : bcard}

                        style={{ cursor: "pointer", width: "100%", height: "100%", objectFit: "contain",borderRadius:"10px"  }}
                        /> */}

                         <img
                              src={getBCardSrc(selected?.bCardPath)}
                              onError={(e) => {
                                e.target.src = bcard;
                              }}
                              style={{
                                cursor: "pointer",
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                borderRadius: "10px"
                              }}
                            />

                </div>
                <p>Business Card</p>
              </div>

              <div className="info-section col-md-5 ">

                <div className="details">
                  <div className="info-row">
                    <span className="label">Vendor Name</span>
                    <span className="colon">:</span>
                    <span className="value">{selected?.vName || ""}</span>
                  </div>

                  <div className="info-row">
                    <span className="label">Vendor Ph.No</span>
                    <span className="colon">:</span>
                    <span className="value">{selected?.vNumber || ""}</span>
                  </div>

                  <div className="info-row">
                    <span className="label">Company Name</span>
                    <span className="colon">:</span>
                    <span className="value">{selected?.companyName || ""}</span>
                  </div>

                  <div className="info-row">
                    <span className="label">Date</span>
                    <span className="colon">:</span>
                    <span className="value">{formatDate(selected?.apptDate)}</span>
                  </div>

                  <div className="info-row">
                    <span className="label">Check In Time</span>
                    <span className="colon">:</span>
                    <span className="value">{formatDateTime(selected?.inTime)}</span>
                  </div>

                  <div className="info-row">
                    <span className="label">To Meet</span>
                    <span className="colon">:</span>
                    <span className="value">{selected?.toMeet || ""}</span>
                  </div>

                  <div className="info-row">
                    <span className="label">Purpose</span>
                    <span className="colon">:</span>
                    <span className="value">{selected?.purpose || ""}</span>
                  </div>
                </div>
{/* 
                <p><b>Vendor Name</b> : {selected?.vName || ""}</p>
                <p><b>Vendor Ph.No</b> : {selected?.vNumber || ""}</p>
                <p><b>Company Name</b> : {selected?.companyName || ""}</p>
                <p><b>Date</b> : {selected?.apptDate || ""}</p>
                <p><b>Check In Time</b> : {selected?.inTime || ""}</p>
                <p><b>To Meet</b> : {selected?.toMeet || ""}</p>
                <p><b>Purpose</b> : {selected?.purpose || ""}</p> */}

                <button className="checkout-btn" onClick={handleCheckOut}  disabled={checkoutLoading}>
                  {/* Check Out */}

                  {checkoutLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Processing...
                      </>
                    ) : (
                      "Check Out"
                    )}

                </button>
              </div>

            </div>
          {/* )} */}
        </div>

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
                                  onError={(e) => {
                                    e.target.src = userIcon;
                                  }}

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

<div
  id="successToast"
  className="toast align-items-center text-bg-success border-0 position-fixed top-0 end-0  m-3"
  role="alert"
>
  <div className="d-flex">
    <div className="toast-body">
      Check-out successful!
    </div>
    <button
      type="button"
      className="btn-close btn-close-white me-2 m-auto"
      onClick={() => {
        const toastEl = document.getElementById("successToast");
        const toast = window.bootstrap.Toast.getInstance(toastEl);
        toast?.hide();
      }}
    ></button>
  </div>
</div>


    </div>
  );
}