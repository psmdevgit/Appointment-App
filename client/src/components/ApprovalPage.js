import React, { useState, useEffect , useRef  } from "react";
import API from "../axios";
import userIcon from "../assets/profile.png";
import bCard from "../assets/bcard.png";
import logo from "../assets/pos.png"
import "../style/approvals.css"
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useSearchParams, useNavigate } from "react-router-dom";



export default function ApprovalPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const navigate = useNavigate();

  const statusMap = {
  0: "Booked",
  1: "Rejected",
  2: "Approved",
  3: "Check-In",
  4: "Check-Out"
};

  const today = new Date().toISOString().split("T")[0];

const [fromDate, setFromDate] = useState(today);
const [toDate, setToDate] = useState(today);

const [showImageModal, setShowImageModal] = useState(false);
const [modalImage, setModalImage] = useState(null);

const [searchParams] = useSearchParams();
const id = searchParams.get("id");


const [showRejectModal, setShowRejectModal] = useState(false);
const [rejectReason, setRejectReason] = useState("Reschedule the meeting time");
const [selectedVendor, setSelectedVendor] = useState(null);

const [statusList] = useState([
  { label: "Rejected", value: 1 },
  { label: "Approved", value: 2 },
  { label: "Check-In", value: 3 },
  { label: "Check-Out", value: 4 }
]);

const [selectedStatus, setSelectedStatus] = useState([]);
const [showStatusDropdown, setShowStatusDropdown] = useState(false);

const [outLoadingId, setOutLoadingId] = useState(null);

const statusRef = useRef();

const dropdownRef = useRef();


const showErrorToast = (message) => {
  const toastEl = document.getElementById("errorToast");
  const toastMsg = document.getElementById("errorToastMsg");

  if (toastMsg) toastMsg.innerText = message;

  const toast = new window.bootstrap.Toast(toastEl, {
    delay: 3000
  });

  toast.show();
};

useEffect(() => {
  const handleClickOutside = (event) => {
    const path = event.composedPath();

    if (statusRef.current && !path.includes(statusRef.current)) {
      setShowStatusDropdown(false);
    }

    // if (dropdownRef.current && !path.includes(dropdownRef.current)) {
    //   setShowDropdown(false);
    // }
  };

  document.addEventListener("pointerdown", handleClickOutside);

  return () => {
    document.removeEventListener("pointerdown", handleClickOutside);
  };
}, []);




  const getImageSrc = (path) => {
    if (!path) return userIcon;

    const isBase64 = !path.includes(".") && path.length > 100;

    if (isBase64) {
      return `data:image/png;base64,${path}`;
    }

    return `/Images/${path}`;
  };

  const getBCardSrc = (path) => {
    if (!path) return bCard;

    const isBase64 = !path.includes(".") && path.length > 100;

    if (isBase64) {
      return `data:image/png;base64,${path}`;
    }

    return `/Images/${path}`;
  };

  const fetchReports = async () => {
    try {
      setLoading(true);

      const res = await API.get(`/approval-reports`, {
        params: {
          id: id,
          from: fromDate,
          to: toDate
        }
      });

      if (res.data.status === "success") {
        setData(res.data.data || []);
      } else {
        setData([]);
      }

    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
  if (!date) return "-";

  const d = new Date(date);

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
};

const formatTime = (dateStr) => {
  if (!dateStr) return "-";

  // extract time part directly (NO timezone conversion)
  const timePart = dateStr.split("T")[1] || dateStr.split(" ")[1];

  if (!timePart) return "-";

  let [hour, minute] = timePart.split(":");

  hour = parseInt(hour, 10);

  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;

  return `${String(hour).padStart(2, "0")}:${minute} ${ampm}`;
};

const filteredData = data.filter((item) => {

  // To Meet filter
//   const matchToMeet =
//     selectedToMeet.length === 0 ||
//     selectedToMeet.includes(item.toMeet);

  // Status filter
  const matchStatus =
    selectedStatus.length === 0 ||
    selectedStatus.includes(item.status);

  return  matchStatus;
//   matchToMeet &&
});

const exportToExcel = () => {
  if (!filteredData || filteredData.length === 0) {
    alert("No Record Found");
    return;
  }

  const statusMap = {
    0: "Booked",
    1: "Rejected",
    2: "Approved",
    3: "Check-In",
    4: "Check-Out",
  };

  const exportData = filteredData.map((item) => ({
    "Vendor Name": item.vName,
    "Vendor Number": item.vNumber,
    "Company Name": item.companyName,
    "Appt-Date": formatDate(item.apptDate),
    "In-Date": formatDate(item.inTime),
    "Check-In Time": item.inTime ? formatTime(item.inTime) : "",
    "Check-Out Time": item.outTime ? formatTime(item.outTime) : "",
    "To Meet": item.toMeet,
    "Status": statusMap[item.status] || "Unknown",
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const dataBlob = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });

  // ✅ Download time
  const now = new Date();
  const timeStr =
    now.getHours().toString().padStart(2, "0") +
    now.getMinutes().toString().padStart(2, "0") +
    now.getSeconds().toString().padStart(2, "0");

  // optional safe date format
  const dateStr = now.toISOString().split("T")[0];

  const fileName = `appoitReport_from_${fromDate}_to_${toDate}_${dateStr}_${timeStr}.xlsx`;

  saveAs(dataBlob, fileName);
};

useEffect(() => {
  if (fromDate && toDate) {
    fetchReports();
  }
}, [fromDate, toDate]);

const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
}

// const handleUpdate = async (vendor, action, rejReason) => {
//   if (!vendor) {
//     showErrorToast("Select any check-in vendor");
//     return;
//   }

// //   console.log("vendor : ",vendor)

//   try {
//     const payload = {
//       id: vendor.id,
//       apptid: vendor.apptID,
//       action: action,
//       rejReason: rejReason
//     };

//     console.log("load : ",payload)

//     const res = await API.post("/appoint-action", payload);

//     if (res.data.status === "success") {
//       const toastEl = document.getElementById("successToast");

//       if (toastEl) {
//         const toast = new window.bootstrap.Toast(toastEl, {
//           delay: 3000
//         });
//         toast.show();
//       }
      
//       fetchReports();

//     }
//      else {
//       showErrorToast("Check-out failed");
//     }

    

//   } catch (err) {
//     console.error(err);
//     showErrorToast("Error submitting form");
//   }
//   finally {
//     setOutLoadingId(null); // 🔥 stop loader
//   }
// };

const handleUpdate = async (vendor, action, rejReason) => {
  if (!vendor) {
    showErrorToast("Select any check-in vendor");
    return;
  }

  try {
    setOutLoadingId(vendor.id);

    const payload = {
      id: vendor.id,
      apptid: vendor.apptID,
      action: action,
      rejReason: rejReason
    };

    const res = await API.post("/appoint-action", payload);

    if (res.data.status === "success") {

      // ✅ CLOSE MODAL ONLY FOR REJECT
      if (action === "reject") {
        setShowRejectModal(false);
        setRejectReason("");       // optional reset
        setSelectedVendor(null);   // optional cleanup
      }

      const toastEl = document.getElementById("successToast");
      if (toastEl) {
        const toast = new window.bootstrap.Toast(toastEl, {
          delay: 3000
        });
        toast.show();
      }

      fetchReports();

    } else {
      showErrorToast("Action failed");
    }

  } catch (err) {
    console.error(err);
    showErrorToast("Error submitting form");
  } finally {
    setOutLoadingId(null);
  }
};

useEffect(() => {
  if (!id || id === "null" || id === "undefined") {
    navigate("/login");
  }
}, [id, navigate]);


useEffect(() => {
  if (!fromDate || !toDate) return;

  const from = new Date(fromDate);
  const to = new Date(toDate);

  if (from > to) {
    showErrorToast("From Date cannot be greater than To Date");

    const todayDate = new Date().toISOString().split("T")[0];
    setFromDate(todayDate);
    setToDate(todayDate);
  }

}, [fromDate, toDate]);

  return (

    <>
     <div className="navbar-main shadow-sm d-flex justify-content-between align-items-center p-2">

      {/* LEFT */}
      <div className="navbar-left">
       
        <span className="nav-title fw-bold">Appointment System</span>
      </div>

      <div className="navbar-center">
        <img src={logo} alt="logo" className="nav-logo" />
        {/* <span className="nav-title">Appointment System</span> */}
      </div>

      {/* RIGHT */}
      <div className="navbar-right d-flex align-items-center">
        <button className="btn btm-sm  fw-bold" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right me-2"></i>
          Logout
        </button>
      </div>

    </div>
    
    <div className="container-fluid ">
        

      {/* HEADER */}      

      {/* FILTER SECTION */}
      <div className="row mb-3 align-items-center d-flex gap-lg-3 filter-small mt-3">
        

        {/* <div className="d-flex justify-content-center col-md-2 gap-2 align-items-center">
          <label className="form-label fw-bold">From :</label>
          <input
            type="date"
            className="form-control filterdiv"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="d-flex col-md-2 gap-2 align-items-center">
          <label className="form-label fw-bold">To :</label>
          <input
            type="date"
            className="form-control filterdiv"
            value={toDate}
            style={{ width: "100%" }}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div> */}

      <div className="col-md-2 d-flex gap-2 align-items-center filter-box">
        <label className="form-label fw-bold filter-label">From :</label>
        <input
          type="date"
          className="form-control filterdiv"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
      </div>

      <div className="col-md-2 d-flex gap-2 align-items-center filter-box">
        <label className="form-label fw-bold filter-label">To :</label>
        <input
          type="date"
          className="form-control filterdiv"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
      </div>


        {/* <div className="d-flex col-md-2 gap-2 align-items-center position-relative" ref={statusRef}>
            <label className="form-label fw-bold">Status :</label> */}

            {/* Button */}
            {/* <div
              className="form-control filterdiv d-flex justify-content-between align-items-center"
              style={{ cursor: "pointer", width:"100%" }}
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            >
              <span>
                {selectedStatus.length === 0
                  ? "All"
                  : `${selectedStatus.length} selected`}
              </span>
              <span>▼</span>
            </div> */}

            <div className="col-md-2 d-flex gap-2 align-items-center position-relative filter-box" ref={statusRef}>
            <label className="form-label fw-bold filter-label">Status :</label>
            <div
              className="form-control filterdiv d-flex justify-content-between align-items-center"
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            >
              <span>
                {selectedStatus.length === 0
                  ? "All"
                  : `${selectedStatus.length} selected`}
              </span>
              <span>▼</span>
            </div>


            {/* Dropdown */}
            {showStatusDropdown && (
              <div className="custom-dropdown shadow">

                {/* ALL */}
                <label className="dropdown-item fw-bold">
                  <input
                    type="checkbox"
                    checked={selectedStatus.length === statusList.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStatus(statusList.map(s => s.value));
                      } else {
                        setSelectedStatus([]);
                      }
                    }}
                  />
                  <span className="ms-2">All</span>
                </label>

                <hr className="m-1" />

                {statusList.map((item, i) => (
                  <label key={i} className="dropdown-item">
                    <input
                      type="checkbox"
                      value={item.value}
                      checked={selectedStatus.includes(item.value)}
                      onChange={(e) => {
                        const value = Number(e.target.value);

                        if (e.target.checked) {
                          setSelectedStatus([...selectedStatus, value]);
                        } else {
                          setSelectedStatus(
                            selectedStatus.filter(v => v !== value)
                          );
                        }
                      }}
                    />
                    <span className="ms-2">{item.label}</span>
                  </label>
                ))}
              </div>
            )}
        </div>



       {/* <div className="d-flex col-lg-2 gap-2">
        <button className="btn btn-primary btn-sm flex-fill" onClick={fetchReports}>
          <i class="bi bi-search me-2"></i>
          View
        </button>

        <button className="btn btn-success btn-sm flex-fill" onClick={exportToExcel}>
          <i class="bi bi-filetype-xls me-2"></i>
          Export
        </button>
      </div> */}

       

      </div>
{loading ? (
  <div className="text-center p-5 fw-bold">Loading...</div>
) : filteredData.length === 0 ? (
  <div className="text-center p-5 fw-bold text-danger">
    No Data Found
  </div>
) : (
  <>
    {/* TABLE */}
    <div className="table-wrapper shadow ">
      <table className="table table-bordered align-middle text-center custom-table">

        <thead>
          <tr>
            <th>Profile</th>
            <th>Name</th>
            <th>Number</th>
            <th className="hide-mobile">Company Name</th>
            <th className="hide-mobile">Date</th>
            <th className="hide-mobile">Time</th>
            <th className="hide-mobile">Doc</th>
            <th className="hide-mobile">Status</th>
            <th className="d-lg-none">More</th>              
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

          {filteredData.map((item, i) => (
            <tr key={i}>

              {/* Profile */}
              <td>
                <img
                  src={getImageSrc(item.imagePath)}
                  onError={(e) => (e.target.src = userIcon)}
                  style={{
                    width: "45px",
                    height: "45px",
                    objectFit: "cover",
                    borderRadius: "6px"
                  }}
                  onClick={() => {
                    setModalImage(getImageSrc(item.imagePath));
                    setShowImageModal(true);
                  }}
                />
              </td>

              <td>{item.vName}</td>
              <td>{item.vNumber}</td>
              <td className="hide-mobile">{item.companyName}</td>

              <td className="hide-mobile">{formatDate(item.apptDate)}</td>
              <td className="hide-mobile">{item.apptTime}</td>

              {/* Business Card */}
              <td className="hide-mobile">
                <img
                  src={getBCardSrc(item.bCardPath)}
                  onError={(e) => (e.target.src = bCard)}
                  style={{
                    width: "45px",
                    height: "45px",
                    objectFit: "contain",
                    borderRadius: "6px"
                  }}
                  onClick={() => {
                    setModalImage(getBCardSrc(item.bCardPath));
                    setShowImageModal(true);
                  }}
                />
              </td>

              {/* Status */}
              <td className="hide-mobile">
                {item.status == 0 && <span className="text-success">Booked</span>}
                {item.status == 1 && <span className="text-danger">Rejected</span>}
                {item.status == 2 && <span className="text-success">Approved</span>}
                {item.status == 3 && <span className="text-success">Check-In</span>}
                {item.status == 4 && <span className="text-success">Check-Out</span>}
              </td>

              {/* Mobile View */}
              <td className="d-lg-none">
                <button
                  className="btn btn-sm btn-primary more-btn"
                  onClick={() => {
                    setSelectedVendor(item);
                    setShowDetailModal(true);
                  }}
                >
                  View
                </button>
              </td>

              {/* Action */}
              <td className="actionbtndiv">
                {item.status == 0 && (
                  <>
                    <button
                      className="btn btn-success btn-sm approvebtn"
                      onClick={() => handleUpdate(item, "approve", "")}
                      disabled={outLoadingId === item.id}
                    >
                      {outLoadingId === item.id ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Processing...
                        </>
                      ) : "Approve"}
                    </button>

                    <button
                      className="btn btn-danger btn-sm ms-1 approvebtn"
                      onClick={() => {
                        setSelectedVendor(item);
                        setShowRejectModal(true);
                      }}
                      disabled={outLoadingId === item.id}
                    >
                      {outLoadingId === item.id ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Processing...
                        </>
                      ) : "Reject"}
                    </button>
                  </>
                )}

                {item.status == 1 && (
                  <span className="badge bg-danger">Rejected</span>
                )}

                {item.status >= 2 && (
                  <span className="badge bg-success">Approved</span>
                )}
              </td>

            </tr>
          ))}

        </tbody>

      </table>
    </div>
  </>
)}
   

        {showImageModal && (
          <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.6)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">

                <div className="modal-header">
                  <h5 className="modal-title">Image Preview</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowImageModal(false)}
                  ></button>
                </div>

                <div className="modal-body text-center">
                  <img
                    src={modalImage}
                    alt="preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "70vh",
                      borderRadius: "8px"
                    }}
                  />
                </div>

              </div>
            </div>
          </div>
        )}

            {showRejectModal && (
                <div className="modal d-block" style={{ background: "rgba(0,0,0,0.6)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">

                        <div className="modal-header">
                        <h5 className="modal-title">Reject Reason</h5>
                        <button
                            className="btn-close"
                            onClick={() => setShowRejectModal(false)}
                        ></button>
                        </div>

                        <div className="modal-body">
                        <textarea
                            className="form-control"
                            rows="4"
                            placeholder={rejectReason}
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                        </div>

                        <div className="modal-footer">
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowRejectModal(false)}
                        >
                            Cancel
                        </button>

                        <button
                            className="btn btn-danger"
                            onClick={() => {
                            if (!rejectReason.trim()) {
                                showErrorToast("Please enter reason");
                                return;
                            }

                            handleUpdate(selectedVendor, "reject", rejectReason);
                            }}
                        >
                            Submit Reject
                        </button>
                        </div>

                    </div>
                    </div>
                </div>
                )}

                    {showDetailModal && selectedVendor && (
                    <div className="modal d-block" style={{ background: "rgba(0,0,0,0.6)" }}>
                      <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">

                          <div className="modal-header">
                            <h5 className="modal-title">Vendor Details</h5>
                            <button
                              className="btn-close"
                              onClick={() => setShowDetailModal(false)}
                            ></button>
                          </div>

                          <div className="modal-body">

                            <p><b>Name:</b> {selectedVendor.vName}</p>
                            <p><b>Number:</b> {selectedVendor.vNumber}</p>
                            <p><b>Company:</b> {selectedVendor.companyName}</p>
                            <p><b>Date:</b> {formatDate(selectedVendor.apptDate)}</p>
                            <p><b>Time:</b> {selectedVendor.apptTime}</p>
                            {/* <p><b>Status:</b> {selectedVendor.status}</p> */}
                            <p><b>Status:</b> {statusMap[selectedVendor.status] || "Unknown"}</p>

                            <div className="d-flex gap-2">
                              <div className="d-flex flex-column">
                                <small>Profile</small>
                                <img
                                  src={getImageSrc(selectedVendor.imagePath)}
                                  style={{ width: "80px", borderRadius: "6px" }}
                                />
                              </div>

                              <div className="d-flex flex-column">
                                <small>Business Card</small>
                                <img
                                  src={getBCardSrc(selectedVendor.bCardPath)}
                                  style={{ width: "80px", borderRadius: "6px" }}
                                />
                              </div>

                              
                              
                              
                            </div>

                          </div>

                        </div>
                      </div>
                    </div>
                  )}


      <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
        <div id="errorToast" className="toast align-items-center text-white bg-danger border-0">
          <div className="d-flex">
            <div className="toast-body" id="errorToastMsg">
              Error message
            </div>
            <button type="button" className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
          </div>
        </div>
      </div>


    </div>


    </>
    
  );
}