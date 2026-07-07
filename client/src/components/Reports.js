import React, { useState, useEffect , useRef  } from "react";
import API from "../axios";
import userIcon from "../assets/profile.png";
import bCard from "../assets/bcard.png";
import "../style/report.css"
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";



export default function Reports() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

const [fromDate, setFromDate] = useState(today);
const [toDate, setToDate] = useState(today);
const [toMeetList, setToMeetList] = useState([]);
const [selectedToMeet, setSelectedToMeet] = useState([]);
const [showDropdown, setShowDropdown] = useState(false);
const [purposeSearch, setPurposeSearch] = useState("");

const [showImageModal, setShowImageModal] = useState(false);
const [modalImage, setModalImage] = useState(null);

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

// useEffect(() => {
//   const handleClickOutside = (event) => {
//     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//       setShowDropdown(false);
//     }
//   };

//   document.addEventListener("mousedown", handleClickOutside);
//   return () => {
//     document.removeEventListener("mousedown", handleClickOutside);
//   };
// }, []);

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

    if (dropdownRef.current && !path.includes(dropdownRef.current)) {
      setShowDropdown(false);
    }
  };

  document.addEventListener("pointerdown", handleClickOutside);

  return () => {
    document.removeEventListener("pointerdown", handleClickOutside);
  };
}, []);


const fetchToMeetList = async () => {
  try {
    const res = await API.get("/to-meet-list");

    if (res.data.status === "success") {
      setToMeetList(res.data.data || []);
    }
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  fetchToMeetList();
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

      const res = await API.get("/reports", {
        params: {
          from: fromDate,
          to: toDate
        }
      });

      if (res.data.status === "success") {
        setData(res.data.data || []);
        console.log(res.data.data);
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

// const formatTime = (date) => {
//   if (!date) return "-";

//   const d = new Date(date);

//   let hours = d.getHours();
//   const minutes = String(d.getMinutes()).padStart(2, "0");

//   const ampm = hours >= 12 ? "PM" : "AM";

//   hours = hours % 12 || 12;

//   return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
// };

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
  const matchToMeet =
    selectedToMeet.length === 0 ||
    selectedToMeet.includes(item.toMeet);

  // Status filter
  const matchStatus =
    selectedStatus.length === 0 ||
    selectedStatus.includes(item.status);

  // Purpose search (contains, case-insensitive)
  const matchPurpose =
    purposeSearch.trim() === "" ||
    (item.purpose ?? "")
      .toLowerCase()
      .includes(purposeSearch.toLowerCase());

  return matchToMeet && matchStatus && matchPurpose;
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


const handleOut = async (vendor) => {
  if (!vendor) {
    showErrorToast("Select any check-in vendor");
    return;
  }

  console.log("vendor : ",vendor)
  try {
    const payload = {
      id: vendor.id,
      apptid: vendor.apptID
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
      
      fetchReports();

    }
     else {
      showErrorToast("Check-out failed");
    }

    

  } catch (err) {
    console.error(err);
    showErrorToast("Error submitting form");
  }
  finally {
    setOutLoadingId(null); // 🔥 stop loader
  }
};

  return (
    <div className="container-fluid ">

      {/* HEADER */}      

      {/* FILTER SECTION */}
      <div className="row mb-3 align-items-center d-flex  filter-small">
        

        <div className="d-flex justify-content-center col-md-2 gap-2 align-items-center">
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
        </div>

     <div className="position-relative  d-flex col-md-2 gap-2 align-items-center "  ref={dropdownRef}>
          <label className="form-label fw-bold">To Meet :</label>

          {/* Dropdown Button */}
          <div
            className="form-control filterdiv d-flex justify-content-between align-items-center"
            style={{ cursor: "pointer" }}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <span>
              {selectedToMeet.length === 0
                ? "All"
                : `${selectedToMeet.length} selected`}
            </span>
            <span>▼</span>
          </div>

          {/* Dropdown */}
          {showDropdown && (
            <div className="custom-dropdown shadow" >

              {/* ✅ SELECT ALL */}
              <label className="dropdown-item fw-bold">
                <input
                  type="checkbox"
                  checked={selectedToMeet.length === toMeetList.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      // select all
                      setSelectedToMeet(
                        toMeetList.map((item) => item.displayName)
                      );
                    } else {
                      // clear all
                      setSelectedToMeet([]);
                    }
                  }}
                />
                <span className="ms-2">All</span>
              </label>

              <hr className="m-1" />

              {/* Individual Options */}
              {toMeetList.map((item, index) => (
                <label key={index} className="dropdown-item">
                  <input
                    type="checkbox"
                    value={item.displayName}
                    checked={selectedToMeet.includes(item.displayName)}
                    onChange={(e) => {
                      const value = e.target.value;

                      if (e.target.checked) {
                        setSelectedToMeet([...selectedToMeet, value]);
                      } else {
                        setSelectedToMeet(
                          selectedToMeet.filter((v) => v !== value)
                        );
                      }
                    }}
                  />
                  <span className="ms-2">{item.displayName}</span>
                </label>
              ))}
            </div>
          )}
        </div>


        <div className="d-flex col-md-2 gap-2 align-items-center position-relative" ref={statusRef}>
            <label className="form-label fw-bold">Status :</label>

            {/* Button */}
            <div
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

<div className="d-flex col-md-2 gap-2 align-items-center">
  <label className="form-label fw-bold">Purpose :</label>

  <input
    type="text"
    className="form-control filterdiv"
    placeholder="Search purpose..."
    value={purposeSearch}
    onChange={(e) => setPurposeSearch(e.target.value)}
  />
</div>

       <div className="d-flex col-lg-2 gap-2">
        <button className="btn btn-primary btn-sm flex-fill" onClick={fetchReports}>
          <i class="bi bi-search me-2"></i>
          View
        </button>

        <button className="btn btn-success btn-sm flex-fill" onClick={exportToExcel}>
          <i class="bi bi-filetype-xls me-2"></i>
          Export
        </button>
      </div>

       

      </div>

      {/* TABLE */}
      <div className="table-wrapper shadow ">
        <table className="table table-bordered align-middle text-center custom-table">

          <thead style={{ backgroundColor: "#c00000", color: "#fff" }}>
            <tr>
              <th>Profile</th>
              <th>Vendor Name</th>
              <th>Vendor Number</th>
              <th>Company Name</th>
              <th>Date</th>
              <th>Check-In Time</th>
              <th>Check-Out Time</th>
              <th>To Meet</th>
              <th>Purpose</th>
              <th>Doc</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            {loading && (
              <tr>
                <td colSpan="10">Loading...</td>
              </tr>
            )}

            {!loading && filteredData.length === 0 && (
              <tr>
                <td colSpan="10">No Data Found</td>
              </tr>
            )}

            {!loading && filteredData.map((item, i) => (
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
                <td>{item.companyName}</td>

                <td>{formatDate(item.apptDate)}</td>
                <td>{item.inTime ? formatTime(item.inTime) : "-----"}</td>
                <td>{item.outTime ? formatTime(item.outTime) : "-----"}</td>
{/* 
                <td>{item.apptDate}</td>
                <td>{item.inTime}</td>
                <td>{item.outTime || "-----"}</td> */}
                <td>{item.toMeet}</td>

                <td>{item.purpose}</td>
                {/* Business Card */}
                <td>
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
                <td>
                    {item.status == 0 && (
                      <span className=" text-success ">Booked</span>
                    )}

                    {item.status == 1 && (
                      <span className=" text-danger ">Rejected</span>
                    )}

                    {item.status == 2 && (
                      <span className=" text-success ">Approved</span>
                    )}

                    {item.status == 3 && (
                      <button className="btn btn-danger btn-sm " onClick={() => handleOut(item)}  disabled={outLoadingId === item.id} >
                        {outLoadingId === item.id ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Processing...
                            </>
                          ) : (
                            "Check-Out"
                          )}
                      </button>
                    )}

                    {item.status == 4 && (
                      <span className="text-success ">Check-Out</span>
                    )}
                </td>

              </tr>
            ))}

          </tbody>

        </table>
      </div>

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
  );
}