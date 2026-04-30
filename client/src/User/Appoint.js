import React, { useRef, useState, useEffect } from "react";
import "../style/appoint.css";
import API from "../axios"
import logo from "../assets/pos.png"
import { data, useNavigate } from "react-router-dom";

export default function Appoint() {

  
    const navigate = useNavigate();

      const API_KEY = "F7Mk-ZmpH-mrgN";
  
  const mobile = localStorage.getItem("mobile");
  const today = new Date().toISOString().split("T")[0];
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: mobile,
    company: "",
    toMeet: "",
    toMeetId: "",
    date: today,
    time: "",
    photo: null,
    card: null
  });
  const [toMeetList, setToMeetList] = useState([]);



  useEffect(() => {
  if (!mobile) {
     window.location.href = "/";
  }
}, [mobile]);

  const showErrorToast = (message) => {
  const toastEl = document.getElementById("errorToast");
  const toastMsg = document.getElementById("errorToastMsg");

  toastMsg.innerText = message;

  const toast = new window.bootstrap.Toast(toastEl, {
    delay: 3000
  });

  toast.show();
};



useEffect(() => {
  const fetchExistingData = async () => {
    try {
      const res = await API.get(`/appointment-by-mobile/${mobile}`);

      // console.log("response : ",res.data.data.imagePath)

      if (res.data.status === "success" && res.data.data) {
        const d = res.data.data;

         const photoBase64 = d.imagePath
          ? `data:image/png;base64,${d.imagePath}`
          : null;

        const cardBase64 = d.bCardPath
          ? `data:image/png;base64,${d.bCardPath}`
          : null;

        // ✅ Set form
        setForm((prev) => ({
          ...prev,
          name: d.vName || "",
          company: d.companyName || "",
          photo: photoBase64,
          card: cardBase64
        }));

        // ✅ Set preview
        setPreview({
          photo: photoBase64,
          card: cardBase64
        });
      }

    } catch (err) {
      console.log("No existing data");
    }
  };

  if (mobile) {
    fetchExistingData();
  }
}, [mobile]);


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
  // const generateTimeSlots = () => {
  //   const slots = [];
  //   let start = 10 * 60;
  //   let end = 17 * 60;

  //   while (start <= end) {
  //     let h = Math.floor(start / 60);
  //     let m = start % 60;

  //     let ampm = h >= 12 ? "PM" : "AM";
  //     let dh = h > 12 ? h - 12 : h;

  //     slots.push(`${dh}:${m === 0 ? "00" : m} ${ampm}`);
  //     start += 30;
  //   }
  //   return slots;
  // };

  const generateTimeSlots = () => {
  const slots = [];
  let start = 10 * 60; // 10:00 AM
  let end = 17 * 60;   // 5:00 PM

  const now = new Date();

  // current time in minutes
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const isToday = form.date === new Date().toISOString().split("T")[0];

  while (start <= end) {
    let h = Math.floor(start / 60);
    let m = start % 60;

    let ampm = h >= 12 ? "PM" : "AM";
    let dh = h > 12 ? h - 12 : h;

    const label = `${dh}:${m === 0 ? "00" : m} ${ampm}`;

    // ✅ Disable logic
    const isDisabled = isToday && start <= currentMinutes;

    slots.push({
      label,
      value: label,
      disabled: isDisabled
    });

    start += 30;
  }

  return slots;
};

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
const captureImage = () => {
  const canvas = canvasRef.current;
  const video = videoRef.current;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0);

  // ✅ Convert to Base64
  const base64 = canvas.toDataURL("image/png");

  setForm((prev) => ({
    ...prev,
    [cameraType]: base64
  }));

  setPreview((prev) => ({
    ...prev,
    [cameraType]: base64
  }));

  // stop camera
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


const sendMessage = async (phone, meetName, vName, company, date, time, id ) => {
  try {

       const formatDate = (dateStr) => {
      const date = new Date(dateStr);

      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      return `${day}-${month}-${year}`;
    };


    const approve = `https://appointment.pothysswarnamahalapp.com/approvals?id=${id}`

    const response = await fetch("https://api.qikchat.in/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // "Authorization": "Bearer F7Mk-ZmpH-mrgN"
        "QIKCHAT-API-KEY": API_KEY,
      },
      body: JSON.stringify({
        to: phone,
        type: "template",
        channel: "whatsapp",
        template: {
          name: "appoint_req",
          language:  "en" ,
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: meetName },
                { type: "text", text: vName },
                { type: "text", text: company },
                { type: "text", text: formatDate(date) },
                { type: "text", text: time },
                { type: "text", text: approve }
              ]
            }
          ]
        }
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Message Sent Successfully!");
    } else {
      console.log("Error: " + JSON.stringify(data));
    }

    console.log(data);

  } catch (error) {
    console.error(error);
    console.log("Error sending message");
  }
};

 const handleSubmit = async () => {
  // validation same as before...
    // ✅ VALIDATION
  if (!form.name) return showErrorToast("Enter Vendor Name");
  if (!form.company) return showErrorToast("Enter Company Name");
  if (!mobile) return showErrorToast("Mobile missing");
  if (!form.date) return showErrorToast("Select Date");
  if (!form.time || form.time === "") {
    return showErrorToast("Select Time");
  }
  if (!form.toMeet) return showErrorToast("Select To Meet");
  if (!form.photo) return showErrorToast("Capture/Upload Photo");

   setLoading(true);

  try {

    const cleanBase64 = (base64) => {
  if (!base64) return null;
  return base64.split(",")[1]; // ✅ removes prefix
};

    const payload = {
      name: form.name.toUpperCase(),
      phone: mobile,
      company: form.company.toUpperCase(),
      toMeet: form.toMeet,
      toMeetId: form.toMeetId,
      date: form.date,
      time: form.time,
      photo: cleanBase64(form.photo), // ✅ cleaned
      card: cleanBase64(form.card)    // ✅ cleaned (optional)
    };

    console.log(payload);

    const res = await API.post("/appoint", payload);

    if (res.data.status === "success") {

      const apptid = res.data.apptid;

      // console.log("Appointment", res.data)

      const toastEl = document.getElementById("successToast");
      const toast = new window.bootstrap.Toast(toastEl, {
          delay: 3000 // ✅ 3 seconds
        });
        
        toast.show();

          setTimeout(() => {
            navigate("/status");
          }, 2500);

        setForm({
        name: form.name,
        phone: form.phone,
        company: form.company,
        toMeet: "",
        toMeetId: "",
        date: today,
        time: "",
        photo: form.photo,
        card: form.card
      });

      const toMeetId = form.toMeetId.trim();

      if (toMeetId) {
        try {
          const mNumberRes = await API.get(`/get-meet-number?toMeetId=${toMeetId}`);
          
          if (mNumberRes.data.status === "success") {
            const mobileNumber = mNumberRes.data.mobile;
            const meetName = mNumberRes.data.name.toUpperCase();
            const id = `${form.toMeetId}`
            console.log("To Meet Mobile:", mobileNumber, meetName);
            sendMessage(mobileNumber, meetName, form.name, form.company.toUpperCase(), form.date, form.time, id  )
          } else {
            console.log(mNumberRes.data.status);
          }

        } catch (err) {
          console.error("Error fetching mobile number", err);
        }
      }

    

      // setPreview({
      //   // photo: null,
      //   // card: null
      // });
    }

    if(res.data.status === "exists"){
      showErrorToast("Appointment already Booked, Reschedule the time.");
    }
    

  } catch (err) {
    alert("Error submitting form");
  }
  finally {
    setLoading(false); 
  }
};
  return (
    <div className="container">

      {loading && (
        <div className="loader-overlay">
          <div className="spinner-border text-light" role="status"></div>
        </div>
      )}

      <div className="d-flex row top-bar  justify-content-between ">

        <div className=" col-6 ">
          <img src={logo} className="logo"></img>

        </div>

        <div className="d-flex gap-2 col-6 justify-content-end align-items-center">
            {/* STATUS ICON */}
            <div className="icon-btn status-btn" title="Status" onClick={() => navigate("/status")}>
              <i className="bi bi-check-circle-fill"></i>
            </div>

            {/* LOGOUT ICON */}
            <div
              className="icon-btn logout-btn"
              title="Logout"
              onClick={() => {
                localStorage.removeItem("mobile");
                navigate("/");
              }}
            >
              <i className="bi bi-box-arrow-right"></i>
            </div>
        </div>
        

      </div>

      
      <h4 className="text-center mb-2 mt-3">Appointments</h4>
      <div className="form-wrapper">

        {/* LEFT SIDE */}
        <div className="left">
          <label>Vendor Name</label>
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

          <label>Date</label>
          {/* <input
            type="date"
            className="input"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          /> */}

          <input
            type="date"
            className="input"
            value={form.date}
            min={new Date().toISOString().split("T")[0]}   // ✅ disables past dates
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />


          <label>Time</label>
          {/* <select
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
            </select> */}

            <select
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
              </select>

        </div>

        {/* RIGHT SIDE */}
        <div className="right">
          <label>To Meet</label>
       
      {/* <select
  className="input"
  value={form.toMeet}
  onChange={(e) => {
    const selectedOrder = e.target.value;

    const selected = toMeetList.find(
      (item) => item.desgOrder == selectedOrder
    );

    setForm({
      ...form,
      toMeet: selected?.displayName,
      toMeetId: selected?.desgOrder
    });

    // setToMeetID(selected?.desgOrder); // ✅ only store ID
  }}
>
  <option value="">Select</option>

  {toMeetList.map((item, index) => (
    <option key={index} value={item.desgOrder}>
      {item.displayName}
    </option>
  ))}
      </select> */}

          <select
              className="input"
              value={String(form.toMeetId || "")}
              onChange={(e) => {
                const selectedOrder = e.target.value;

                const selected = toMeetList.find(
                  (item) => String(item.desgOrder) === selectedOrder
                );

                setForm((prev) => ({
                  ...prev,
                  toMeetId: selectedOrder,
                  toMeet: selected?.displayName || ""
                }));
              }}
            >
              <option value="">Select</option>

              {toMeetList.map((item, index) => (
                <option key={index} value={String(item.desgOrder)}>
                  {item.displayName}
                </option>
              ))}
            </select>


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
                          <img src={preview.card} className="preview" />
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

                        {preview.photo && (
                          <img src={preview.photo} className="preview" />
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
      <button className="btn btn-success px-5 w-md-auto" onClick={handleSubmit} disabled={loading}>
        {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Processing...
              </>
            ) : (
              "Submit"
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
  );
}