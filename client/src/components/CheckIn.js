import React, { useRef, useState, useEffect } from "react";
import API from "../axios"
import '../style/checkin.css'
import userIcon  from '../assets/profile.png'
// import imagepath from '../Images/'

export default function CheckIn() {
  
  const user = JSON.parse(localStorage.getItem("user"));


  
    const [approvedData, setApprovedData] = useState([]);

    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isManualSelect, setIsManualSelect] = useState(false);
    
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    id:"",
    apptID: "",
    name: "",
    phone: "",
    company: "",
    toMeet: "",
    toMeetId: "",
    date: today,
    time: "",
    purpose: "",
    photo: null,
    card: null
  });

  const initialForm = {
    id:"",
  apptID: "",
  name: "",
  phone: "",
  company: "",
  toMeet: "",
  toMeetId: "",
  date: today,
  time: "",
  purpose: "",
  photo: null,
  card: null
};

 const phoneForm = {
    id:"",
  apptID: "",
  name: "",
  company: "",
  toMeet: "",
  toMeetId: "",
  date: today,
  time: "",
  purpose: "",
  photo: null,
  card: null
};

  const [toMeetList, setToMeetList] = useState([]);

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


const getImageSrc = (path) => {
  if (!path) return userIcon;

  const isBase64 = !path.includes(".") && path.length > 100;

  if (isBase64) {
    return `data:image/png;base64,${path}`;
  }

  // ✅ MUST start with /
  return `/Images/${path}`;
};

    const formatDate = (dateStr) => {
    if (!dateStr) return "";

    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const showErrorToast = (message) => {
  const toastEl = document.getElementById("errorToast");
  const toastMsg = document.getElementById("errorToastMsg");

  toastMsg.innerText = message;

  const toast = new window.bootstrap.Toast(toastEl, {
    delay: 3000
  });

  toast.show();
};


//   useEffect(() => {
//   if (!user) {
//      window.location.href = "/";
//   }
// }, [user]);

  useEffect(() => {
    const fetchApprovedData = async () => {
      try {
        const res = await API.get(`/approved-list`);
        if (res.data.status === "success") {
          setApprovedData(res.data.data || []);
        }
        
      } catch (err) {
        console.log(err);
      }
    };
     if (user) fetchApprovedData();
  }, [user]);


//   useEffect(() => {
//   const fetchVendor = async () => {
//     if (form.phone.length === 10) {
      
//       const phone = form.phone; // ✅ prevent repeat

//       try {
//         const res = await API.get(`/get-vendor-by-phone?phone=${phone}`);

//         console.log("hello : ", res.data);

//         if (res.data.status === "success") {
//           handleView(res.data.data);
//         }

//       } catch (err) {
//         console.log(err);
//       }
//     }
//     else if (form.phone && form.phone.length < 10) {

//       // ✅ reset only when user deletes digits
//       setForm((prev) => ({
//         ...prev,
//         id: "",
//         apptID: "",
//         name: "",
//         company: "",
//         toMeet: "",
//         toMeetId: "",
//         date: today,
//         time: "",
//         purpose: "",
//         photo: "",
//         card: ""
//       }));
//       setPreview({
//     photo: null,
//     card: null,
//   });

//     }
//   };

//   fetchVendor();
// }, [form.phone]);

useEffect(() => {
  const fetchVendor = async () => {

    // 🚫 STOP if manual selection
    if (isManualSelect) {
      setIsManualSelect(false); // reset for next time
      return;
    }

    if (form.phone.length === 10) {
      try {
        const res = await API.get(`/get-vendor-by-phone?phone=${form.phone}`);

        if (res.data.status === "success") {
          handleView(res.data.data);
        }

      } catch (err) {
        console.log(err);
      }
    } 
    else if (form.phone && form.phone.length < 10) {
      setForm((prev) => ({
        ...prev,
        id: "",
        apptID: "",
        name: "",
        company: "",
        toMeet: "",
        toMeetId: "",
        date: today,
        time: "",
        purpose: "",
        photo: "",
        card: ""
      }));

      setPreview({
        photo: null,
        card: null,
      });
    }
  };

  fetchVendor();
}, [form.phone]);

useEffect(() => {
  const fetchToMeet = async () => {
    try {
      const res = await API.get("/to-meet-list");

      if (res.data.status === "success") {
        setToMeetList(res.data.data);
      }
    } catch (err) {
      console.log("Error fetching to-meet list:", err);
    }
  };

  fetchToMeet();
}, []);


  const [preview, setPreview] = useState({
    photo: null,
    card: null
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [cameraType, setCameraType] = useState(""); // photo or card
  const [cameraOn, setCameraOn] = useState(false);

  // 🎯 Time slots
  const generateTimeSlots = () => {
    const slots = [];
    let start = 10 * 60;
    let end = 19 * 60;

    while (start <= end) {
      let h = Math.floor(start / 60);
      let m = start % 60;

      let ampm = h >= 12 ? "PM" : "AM";
      let dh = h > 12 ? h - 12 : h;

      slots.push(`${dh}:${m === 0 ? "00" : m} ${ampm}`);
      start += 30;
    }
    return slots;
  };

//     const generateTimeSlots = () => {
//   const slots = [];
//   let start = 10 * 60; // 10:00 AM
//   let end = 19 * 60;   // 5:00 PM

//   const now = new Date();

//   // current time in minutes
//   const currentMinutes = now.getHours() * 60 + now.getMinutes();

//   const isToday = form.date === new Date().toISOString().split("T")[0];

//   while (start <= end) {
//     let h = Math.floor(start / 60);
//     let m = start % 60;

//     let ampm = h >= 12 ? "PM" : "AM";
//     let dh = h > 12 ? h - 12 : h;

//     const label = `${dh}:${m === 0 ? "00" : m} ${ampm}`;

//     // ✅ Disable logic
//     const isDisabled = isToday && start <= currentMinutes;

//     slots.push({
//       label,
//       value: label,
//       disabled: isDisabled
//     });

//     start += 30;
//   }

//   return slots;
// };


  // 📷 Open Camera
const openCamera = (type) => {
  setCameraType(type);
  setCameraOn(true); // render video first
};

useEffect(() => {
  if (cameraOn && videoRef.current) {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => {
        console.error("Camera error:", err);
      });
  }
}, [cameraOn]);

  // 📸 Capture
// const captureImage = () => {
//   const canvas = canvasRef.current;
//   const video = videoRef.current;

//   canvas.width = video.videoWidth;
//   canvas.height = video.videoHeight;

//   const ctx = canvas.getContext("2d");
//   ctx.drawImage(video, 0, 0);

//   // ✅ Convert to Base64
//   const base64 = canvas.toDataURL("image/png");

//   console.log("captured : ", base64)

//   setForm((prev) => ({
//     ...prev,
//     [cameraType]: base64
//   }));

//   setPreview((prev) => ({
//     ...prev,
//     [cameraType]: base64
//   }));

//   // stop camera
//   const stream = video.srcObject;
//   if (stream) {
//     stream.getTracks().forEach((track) => track.stop());
//   }

//   setCameraOn(false);
// };

const captureImage = () => {
  const canvas = canvasRef.current;
  const video = videoRef.current;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0);

  // ❌ full base64 with prefix
  const fullBase64 = canvas.toDataURL("image/png");

  // ✅ remove prefix
  const rawBase64 = fullBase64.split(",")[1];

  console.log("captured raw:", rawBase64);

  setForm((prev) => ({
    ...prev,
    [cameraType]: rawBase64
  }));

  setPreview((prev) => ({
    ...prev,
    [cameraType]: rawBase64
  }));

  const stream = video.srcObject;
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }

  setCameraOn(false);
};


  // 📁 File Upload
  const handleFile = (e, type) => {
  const file = e.target.files[0];

  const reader = new FileReader();
  reader.readAsDataURL(file);

  reader.onloadend = () => {
    setForm((prev) => ({
      ...prev,
      [type]: reader.result // ✅ Base64 string
    }));

    setPreview((prev) => ({
      ...prev,
      [type]: reader.result
    }));
  };
};

// const handleView = (item) => {
//   const today = new Date().toISOString().split("T")[0];

//   const cleanedId = String(item.toMeetId || "").trim();


//   console.log("item : ",item)

//   // console.log("DB ID:", cleanedId);
//   // console.log("List:", toMeetList);

//   setForm((prev) => ({
//     ...prev,
//     id: item.id || "",
//     apptID: item.apptid || "",
//     name: item.vName || "",
//     company: item.companyName || "",
//     phone: item.vNumber || "",
//     toMeetId: cleanedId, // ✅ directly set
//     toMeet: item.toMeet || "",
//     date: today,
//     time: item.apptTime || "",
//     purpose: item.purpose || "",
//     photo: item.imagePath
//       ? `${item.imagePath}`
//       : null,
//     card: item.bCardPath
//       ? `${item.bCardPath}`
//       : null,
//   }));

//   setPreview({
//     photo: item.imagePath
//       ? `${item.imagePath}`
//       : null,
//     card: item.bCardPath
//       ? `${item.bCardPath}`
//       : null,
//   });

// };

const handleView = (item) => {
  setIsManualSelect(true); // 🚨 IMPORTANT

  const today = new Date().toISOString().split("T")[0];

  setForm((prev) => ({
    ...prev,
    id: item.id || "",
    apptID: item.apptid || "",
    name: item.vName || "",
    company: item.companyName || "",
    phone: item.vNumber || "",
    toMeetId: String(item.toMeetId || ""),
    toMeet: item.toMeet || "",
    date: today,
    time: item.apptTime || "",
    purpose: item.purpose || "",
    photo: item.imagePath || null,
    card: item.bCardPath || null,
  }));

  setPreview({
    photo: item.imagePath || null,
    card: item.bCardPath || null,
  });
};

 const handleSubmit = async () => {
  // validation same as before...
    // ✅ VALIDATION
  if (!form.name) return showErrorToast("Enter Vendor Name");
  if (!form.company) return showErrorToast("Enter Company Name");
  if (!form.phone) return showErrorToast("Mobile missing");
  if (!form.date) return showErrorToast("Select Date");
  if (!form.time || form.time === "") {
    return showErrorToast("Select Time");
  }
  if (!form.toMeet) return showErrorToast("Select To Meet");
  if (!form.purpose) return showErrorToast("Enter Vendor Purpose");
  if (!form.photo) return showErrorToast("Capture/Upload Photo");

  console.log(form.id)


  setLoading(true); // 👉 start loader

  try {

    const cleanBase64 = (base64) => {
  if (!base64) return null;
  return base64.split(",")[1]; // ✅ removes prefix
};

    const payload = {
      id : form.id,
      appt: form.apptID || "new",
      name: form.name,
      phone: form.phone,
      company: form.company,
      toMeet: form.toMeet,
      toMeetId: form.toMeetId,
      date: form.date,
      time: form.time,
      purpose: form.purpose,
      // photo: cleanBase64(form.photo), 
      // card: cleanBase64(form.card)  
      photo: form.photo, 
      card: form.card
    };

    console.log(payload);

    const res = await API.post("/checkIN", payload);

    console.log("check : ",res.data);

    if (res.data.status === "success") {
      const toastEl = document.getElementById("successToast");
      const toast = new window.bootstrap.Toast(toastEl, {
          delay: 3000 // ✅ 3 seconds
        });
        toast.show();
       setForm(initialForm);

      setPreview({
        photo: null,
        card: null
      });

      // setPreview({
      //   // photo: null,
      //   // card: null
      // });
    }
    

  } catch (err) {
    showErrorToast("Error submitting form");
    console.log(err)
  }
  finally {
    setLoading(false); // 👉 stop loader always
  }
};

const clearImage = (type) => {
  setForm((prev) => ({
    ...prev,
    [type]: null
  }));

  setPreview((prev) => ({
    ...prev,
    [type]: null
  }));
};

  return (
    <div className="container-fluid row  ">

      <div className="col-lg-5  px-lg-5">
          <h4 className="text-danger mb-3 mt-3">Approved Vendors :</h4>

          <div className="approved-list">
              {approvedData.length === 0 ? (
                <p style={{ fontSize: "14px", color: "#888" }}>
                No Appointments Found</p>
              ) : (
                approvedData.map((item, index) => (
                  <div className="status-card me-3" key={index}>

                    {/* IMAGE */}
                    {/* <div className="left-img">
                      <img
                        src={`data:image/png;base64,${item.imagePath}`}
                        onClick={() => setSelectedImage(item.imagePath)}
                        style={{ cursor: "pointer" }}
                        />
                    </div> */}

<div className="left-img">
                    <img
                      src={getImageSrc(item.imagePath)}
                      onError={(e) => {
                        e.target.src = userIcon;
                      }}
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelectedImage(item.imagePath)}
                      alt={getImageSrc(item.imagePath)}
                    />
      </div>



                    {/* DETAILS */}
                    <div className="middle">
                      <h5>{item.vName} - {item.companyName}</h5>

                      <p>
                        <b>Date:</b> {item.apptTime}  {formatDate(item.apptDate)}
                      </p>

                      {/* <p><b>To Meet :</b> {item.toMeet}</p> */}

                      <p>
                      <b>To Meet :</b> {item.toMeet}{" "}

                      <span
                        className={`badge ms-2 ${
                          item.status === 0
                            ? "bg-warning text-dark"
                            : item.status === 1
                            ? "bg-danger"
                            : "bg-success"
                        }`}
                      >
                        {item.status === 0
                          ? "Waiting"
                          : item.status === 1
                          ? "Rejected"
                          : "Approved"}
                      </span>
                    </p>
                    </div>

                    {/* STATUS */}
                    {/* <div className={`status-badge ${getStatusClass(item.status)}`}>
                      {getStatusText(item.status)}
                    </div> */}

                    <div
                      className={`rounded-4 px-3 btn btn-sm btn-primary`}
                      onClick={() => handleView(item)}
                    >
                      view
                    </div>


                  </div>
                ))
              )}
            </div>

      </div>
      

      <div className="col-lg-7">

            <h4 className="text-center mb-3 mt-3">CHECK IN</h4>
                  <div className="form-wrapper">

                    {/* LEFT SIDE */}
                    <div className="left">

                     <label>Mobile</label>
                     <input
                          className="input"
                          value={form.phone}
                          onChange={(e) => {
                            const value = e.target.value;
                            // allow only digits and max 10
                            if (/^\d{0,10}$/.test(value)) {
                              setForm((prev) => ({
                                ...prev,
                                phone: value
                              }));
                            }
                          }}
                        />


                      <label  style={{display:"none"}}>ApptID</label>
                      <input style={{display:"none"}}
                        className="input"
                        value={form.apptID}            
                        onChange={(e) => setForm({ ...form, apptID: e.target.value })}
                      />

                      <label>Name</label>
                      <input
                        className="input"
                        value={form.name}            
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />

                      <label>Company</label>
                      <input
                        className="input"
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                      />

                     

                      <label>Date</label>
                      <input
                        type="date"
                        className="input"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                      />

                      <label>Time</label>
                      <select
                          className="input"
                          value={form.time}
                          onChange={(e) => setForm({ ...form, time: e.target.value })}
                        >
                          <option value="">Select Time</option>

                          {generateTimeSlots().map((t, i) => (
                            <option key={i} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                         
                         {/* <select
                className="input"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              >
                <option value="">Select Time</option>

                {generateTimeSlots().map((t, i) => (
                  <option key={i} value={t.value} disabled={t.disabled}>
                    {t.label} {t.disabled ? "(Closed)" : ""}
                  </option>
                ))}
            </select> */}

                    </div>

                    {/* RIGHT SIDE */}
                    <div className="right">
                      <label>To Meet</label>
                  
                        <select
                      className="input"
                      value={String(form.toMeetId || "")}   // ✅ IMPORTANT
                    onChange={(e) => {
                            const selectedOrder = e.target.value;

                            const selected = toMeetList.find(
                              (item) => String(item.desgOrder) === selectedOrder
                            );

                            setForm((prev) => ({
                              ...prev,
                              toMeet: selected?.displayName,
                              toMeetId: selectedOrder // ✅ string
                            }));
                          }}
                  >
                    <option value="">Select</option>

                    {toMeetList.map((item, index) => (
                      // <option key={index} value={item.desgOrder}>
                      //   {item.displayName}
                      // </option>
                      <option key={index} value={String(item.desgOrder)}>
                        {item.displayName}
                      </option>
                    ))}
                        </select>

                        <label>Purpose</label>
                      <textarea
                        className="input"
                        value={form.purpose}
                        onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                      />


                      <div className="row ">
                          <div className=" col-lg-6">

                            {/* CARD */}
                                <label>Business Card</label>
                                  <div className="d-flex align-items-center gap-2 mb-3">

                                    <input
                                      type="file"
                                      hidden
                                      id="card"
                                      onChange={(e) => handleFile(e, "card")}
                                    />

                                    {/* Upload Icon */}
                                    <label htmlFor="card" className="btn btn-light border">
                                      <i className="bi bi-upload"></i>
                                    </label>

                                    {/* Camera Icon */}
                                    <button
                                      type="button"
                                      className="btn btn-light border"
                                      onClick={() => openCamera("card")}
                                    >
                                      <i className="bi bi-camera"></i>
                                    </button>

                                    {preview.card && (
                                      // <img src={preview.card} className="preview" />

                                      <img  src={getImageSrc(preview.card)}
                                        onError={(e) => {
                                          e.target.src = userIcon;
                                        }} className="preview" />

                                    )}
                                  </div>

                                {/* PHOTO */}
                              <label>Photo</label>
                                  <div className="d-flex align-items-center gap-2 mb-3">

                                    <input
                                      type="file"
                                      hidden
                                      id="photo"
                                      onChange={(e) => handleFile(e, "photo")}
                                    />

                                    {/* Upload Icon */}
                                    <label htmlFor="photo" className="btn btn-light border">
                                      <i className="bi bi-upload"></i>
                                    </label>

                                    {/* Camera Icon */}
                                    <button
                                      type="button"
                                      className="btn btn-light border"
                                      onClick={() => openCamera("photo")}
                                    >
                                      <i className="bi bi-camera"></i>
                                    </button>

 {/* {preview.photo && (
    <button
      type="button"
      className="btn btn-danger btn-sm"
      onClick={() => clearImage("photo")}
    >
      Clear
    </button>
  )} */}

                                    {preview.photo && (
                                      // <img src={preview.photo} className="preview" />

                                      
                                      // <img  src={getImageSrc(preview.photo)}
                                      //     onError={(e) => {
                                      //       e.target.src = userIcon;
                                      //     }} className="preview" />

                                      <img
                                        src={preview.photo ? getImageSrc(preview.photo) : userIcon}
                                        onError={(e) => (e.target.src = userIcon)}
                                        className="preview"
                                      />

                                      
                                    )}
                                  </div>


                          </div>
                                  {/* CAMERA VIEW */}
                          {cameraOn && (
                            <div className="camera-box col-lg-6 d-flex flex-column justify-content-center align-items-center gap-2">
                              <video ref={videoRef} autoPlay width="250" />
                              <button onClick={captureImage} className="btn btn-sm btn-primary">Capture</button>
                              <canvas ref={canvasRef} style={{ display: "none" }} />
                            </div>
                          )}

                      </div>
                  

                    </div>
                  </div>

                

                  {/* SUBMIT */}
                <div className="text-center mt-lg-5 my-3">
                  <button className="btn btn-success px-5 w-md-auto" onClick={handleSubmit}  disabled={loading}>
                    {/* Check IN */}

                     {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Processing...
                        </>
                      ) : (
                        "Check IN"
                      )}

                  </button>
                </div>


                <div className="toast-container position-fixed top-0 end-0 p-3">
              <div
                id="successToast"
                className="toast align-items-center text-bg-success border-0"
                role="alert"
              >
                <div className="d-flex">
                  <div className="toast-body">
                    Submitted Successfully!
                  </div>
                  <button
                    type="button"
                    className="btn-close btn-close-white me-2 m-auto"
                    data-bs-dismiss="toast"
                  ></button>
                </div>
              </div>
            </div>


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


      {loading && (
          <div className="loader-overlay">
            <div className="spinner-border text-light" role="status"></div>
          </div>
        )}


      
    
    
    
    </div>
  );
}