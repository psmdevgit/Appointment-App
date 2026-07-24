const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

/* =======================
   ✅ MIDDLEWARE
======================= */

// CORS (adjust if needed)
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://192.168.5.62:4444"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  }
}));

// Body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));


/* =======================
   ✅ API ROUTES (FIRST)
======================= */

const apiRoutes = require("./routes/api");
app.use("/api", apiRoutes);


/* =======================
   ✅ STATIC FILES (React build)
======================= */

app.use(express.static(path.join(__dirname, "build")));


/* =======================
   ✅ REACT ROUTER FIX
======================= */
// This handles all frontend routes like:
// /status, /appoint, /checkin, etc.

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});


/* =======================
   ✅ SERVER START
======================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});