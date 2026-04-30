const express = require("express");
const router = express.Router();
const { sql, getConnection, getDb2Connection } = require("../db");
const axios = require("axios");
const { DateTime, pool } = require("mssql");
const API_KEY = "F7Mk-ZmpH-mrgN";


// ============  User Login   ====================================================================================

router.post("/user-login", async (req, res) => {
  try {
    const { mobilenumber } = req.body;

    // console.log(mobilenumber)

    const pool = await getDb2Connection();

    const result = await pool.request()
      .input("mobilenumber", sql.VarChar, mobilenumber)
      .query(`
        SELECT * FROM Appointments
        WHERE vNumber = @mobilenumber
      `);

    if (result.recordset.length > 0) {
      res.json({
        status: "exists",
        data: result.recordset[0]
      });
    } else {
      res.json({
        status: "new"
      });
    }

  } catch (error) {
    // console.log(error)
    res.status(500).json({
      status: "error",
      message: "technical issue"
    });
  }
});

// GET To Meet Dropdown List =====================================================================================
router.get("/to-meet-list", async (req, res) => {
  try {
    const pool = await getDb2Connection();

    const result = await pool.request().query(`
      SELECT 
        CONCAT(name, ' (', Designation,')') AS displayName,
        desgOrder
      FROM VistorList
      ORDER BY desgOrder ASC
    `);

    res.json({
      status: "success",
      data: result.recordset
    });

  } catch (error) {
    // console.log(error);
    res.status(500).json({
      status: "error",
      message: "Technical issue"
    });
  }
});

//  =======================     last entry      ==================================================================

const getNextApptId = async (pool) => {
  const result = await pool.request().query(`
    SELECT TOP 1 apptid 
    FROM Appointments 
    ORDER BY Id DESC
  `);

  if (result.recordset.length > 0) {
    const lastId = result.recordset[0].apptid; // e.g. "v112"

    // ✅ extract number
    const numberPart = parseInt(lastId.replace("V", ""), 10);

    // ✅ increment
    const nextNumber = numberPart + 1;

    // ✅ return new id
    return "V" + nextNumber;
  }

  // ✅ first record case
  return "V1";
};

//  =======================     get meeting person Name by id     ================================================

const getMeetPerson = async (pool, id) => {
  const result = await pool.request()
  .input("id", sql.Int, id)
  .query(`
      SELECT phoneNo,Name FROM VistorList WHERE desgOrder = @id
  `);

  if (result.recordset.length > 0) {
    const Name = result.recordset[0].Name; // e.g. "v112"
    // ✅ return new id
    return Name;
  }

  // ✅ first record case
  return "Pothys Swarna Mahal";
};

//  =======================     Whatsapp Message for approve/reject   ============================================

const sendResponseWtMessage = async (action , vNumber, vName, toMeet, apptDate, apptTime ) => {
  try {

    // console.log("strated   ", action, toMeet, vNumber, vName, apptTime, apptDate)

    const formatDate = (dateStr) => {
      const date = new Date(dateStr);

      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      return `${day}-${month}-${year}`;
    };

     const templateName = action === "approve" 
      ? "appoint_approved" 
      : "appoint_rejected";

    const parameter = action === "approve" 
      ? [
          { type: "text", text: vName },
          { type: "text", text: toMeet },
          { type: "text", text: formatDate(apptDate) },
          { type: "text", text: apptTime }
        ]
      : [
          { type: "text", text: `${vName} - ${formatDate(apptDate)}` },
          { type: "text", text: toMeet }
        ];

        console.log("parameters : ========== ",parameter);

    const response = await fetch("https://api.qikchat.in/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // "Authorization": "Bearer F7Mk-ZmpH-mrgN"
        "QIKCHAT-API-KEY": API_KEY,
      },
      body: JSON.stringify({
        to: vNumber,
        type: "template",
        channel: "whatsapp",
        template: {
          name: templateName,
          language:  "en" ,
          components: [
            {
              type: "body",
              parameters: parameter
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

//  =======================     Whatsapp Message for Check Out   ============================================

const sendCheckoutWtMessage = async ( vNumber ) => {
  try {

    const response = await fetch("https://api.qikchat.in/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // "Authorization": "Bearer F7Mk-ZmpH-mrgN"
        "QIKCHAT-API-KEY": API_KEY,
      },
      body: JSON.stringify({
        to: vNumber,
        type: "template",
        channel: "whatsapp",
        template: {
          name: "appoint_checkout",
          language:  "en" ,
          components: [
            {
              type: "body"
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

//  =======================     exist user      ==================================================================

router.get("/appointment-by-mobile/:mobile", async (req, res) => {
  try {
    const { mobile } = req.params;
    const pool = await getDb2Connection();

    const result = await pool.request()
      .input("mobile", sql.VarChar, mobile)
      .query(`
        SELECT TOP 1 *
        FROM Appointments
        WHERE vNumber = @mobile
        ORDER BY id DESC
      `);

    //   console.log(result);

    if (result.recordset.length > 0) {
      res.json({
        status: "success",
        data: result.recordset[0]
      });
    } else {
      res.json({ status: "success", data: null });
    }

  } catch (err) {
    // console.log(err);
    res.json({ status: "error" });
  }
});

//  =======================     GET APPOINTMENT STATUS BY MOBILE    ==============================================

router.get("/appointment-status/:mobile", async (req, res) => {
  const mobile = req.params.mobile;

  try {
    const pool = await getDb2Connection();

    const result = await pool.request()
      .input("mobile", sql.VarChar, mobile)
      .query(`
        SELECT 
          vName,
          companyName,
          apptTime,
          apptDate,
          toMeet,
          status,
          imagePath
        FROM Appointments
        WHERE vNumber = @mobile
        ORDER BY id DESC
      `);

    // If no data
    if (result.recordset.length === 0) {
      return res.json({
        status: "success",
        data: []
      });
    }

    res.json({
      status: "success",
      data: result.recordset
    });

  } catch (err) {
    // console.log("ERROR:", err);
    res.json({
      status: "error",
      message: err.message
    });
  }
});


//  ========================        Appointments insert     =====================================================

router.post("/appoint", async (req, res) => {
  try {
    const { name, phone, company, toMeet, toMeetId, date, time, photo, card } = req.body;

  

    const pool = await getDb2Connection();

      // 🔹 1. CHECK EXISTING
      const check = await pool.request()
        .input("phone", sql.VarChar, phone)
        .input("date", sql.Date, date)
        .input("time", sql.VarChar, time)
        .query(`
          SELECT status 
          FROM Appointments
          WHERE vNumber = @phone 
            AND apptDate = @date 
            AND apptTime = @time
        `);

        // console.log("check : ",check);


      if (check.recordset.length > 0) {
        const existing = check.recordset[0];

        return res.json({
          status: "exists",
          message: "Appointment already exists",
          currentStatus: existing.status
        });
      }

      // 2. INSERT NEW

    const newApptId = await getNextApptId(pool); // ✅ FIXED

    await pool.request()
      .input("apptid", sql.VarChar, newApptId)
      .input("name", sql.VarChar, name)
      .input("phone", sql.VarChar, phone)
      .input("company", sql.VarChar, company)
      .input("toMeet", sql.VarChar, toMeet)
    //   .input("toMeetId", sql.NChar, toMeetId)
      .input("toMeetId", sql.NChar, String(toMeetId)) // quick fix
      .input("date", sql.Date, date)
      .input("time", sql.VarChar, time)
      .input("photo", sql.NVarChar, photo) // ✅ base64
      .input("card", sql.NVarChar, card)   // ✅ base64
      .query(`
        INSERT INTO Appointments
        (apptID, vName, vNumber, subDate, apptDate, apptTime, ToMeet, CompanyName, imagePath, bCardPath, status, toMeetID)
        VALUES
        (@apptid, @name, @phone, getdate(), @date, @time,  @toMeet, @company, @photo, @card, 0, @toMeetId)
      `);

     return res.json({
      status: "success",
      apptid: newApptId,
      message: "Appointment created"
    });

    // console.log(res);

  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "error" });
  }
});

// ============   Login   ====================================================================================

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // console.log("LOGIN:", username, password);

    const pool = await getDb2Connection();

    const query = `
      SELECT empName,empid,empBranch,type, desgorder, desgcode
      FROM Users
      WHERE empid COLLATE SQL_Latin1_General_CP1_CS_AS = @username
        AND Password COLLATE SQL_Latin1_General_CP1_CS_AS = @password
        AND (type = 'appt' or desgOrder = 'y')
    `;

    const result = await pool.request()
      .input("username", sql.VarChar, username)
      .input("password", sql.VarChar, password)
      .query(query);

      // console.log(query)

    if (result.recordset.length > 0) {
      return res.json({
        status: "success",
        data: result.recordset[0]
      });
    } else {
      return res.status(401).json({
        status: "fail",
        message: "Invalid username or password"
      });
    }

  } catch (error) {
    console.log("LOGIN ERROR:", error);

    res.status(500).json({
      status: "error",
      message: "technical issue"
    });
  }
});

// ============   Approved Lists   ====================================================================================

router.get("/approved-list", async (req, res) => {

  try {
    const pool = await getDb2Connection();

    const result = await pool.request()
      .query(`
        SELECT 
        id,
        apptid,
          vName,
          vNumber,
          companyName,
          apptTime,
          apptDate,
          toMeet,
          LTRIM(RTRIM(toMeetID)) AS toMeetId,
          status,
          imagePath,
          bCardPath
        FROM Appointments
        WHERE status in (0,2)
		and cast(apptDate as date) >= cast(getdate() as date)
        ORDER BY id ASC
      `);

    // If no data
    if (result.recordset.length === 0) {
      return res.json({
        status: "success",
        data: []
      });
    }

    res.json({
      status: "success",
      data: result.recordset
    });

  } catch (err) {
    // console.log("ERROR:", err);
    res.json({
      status: "error",
      message: err.message
    });
  }
});


// ============   check IN   ====================================================================================

router.post("/checkIN", async (req, res) => {
  try {
    const { id, appt, name, phone, company, toMeet, toMeetId, date, time, purpose, photo, card } = req.body;



    // console.log("incoming : ",req.body);

    const pool = await getDb2Connection();

    if(appt == "new"){
      
       const newApptId = await getNextApptId(pool); 
        await pool.request()
          .input("apptid", sql.VarChar, newApptId)
          .input("name", sql.VarChar, name)
          .input("phone", sql.VarChar, phone)
          .input("company", sql.VarChar, company)
          .input("toMeet", sql.VarChar, toMeet)
          .input("toMeetId", sql.NChar, String(toMeetId)) // quick fix
          .input("date", sql.Date, date)
          .input("time", sql.VarChar, time)
          .input("photo", sql.NVarChar, photo) 
          .input("card", sql.NVarChar, card)   
          .input("purpose", sql.NVarChar, purpose)   
          .query(`
            INSERT INTO Appointments
            (apptID, vName, vNumber, subDate, apptDate, apptTime, ToMeet, Purpose, visitDate, inTime, CompanyName, imagePath, bCardPath, status, rejORapproDate, toMeetID)
            VALUES
            (@apptid, @name, @phone, getdate(), @date, @time,  @toMeet, @purpose, getdate(), getdate(), @company, @photo, @card, 3, getdate(), @toMeetId)
          `);

        res.json({ status: "success" });

    }
    else{

        await pool.request()
          .input("id", sql.Int, id)
          .input("apptid", sql.VarChar, appt)
          .input("toMeet", sql.VarChar, toMeet)
          .input("toMeetId", sql.NChar, String(toMeetId)) // quick fix
          .input("time", sql.VarChar, time)
          .input("photo", sql.NVarChar, photo) // ✅ base64
          .input("card", sql.NVarChar, card)   // ✅ base64
          .input("purpose", sql.NVarChar, purpose)   
          .query(`
            update Appointments
            set apptTime = @time, toMeet = @toMeet, toMeetID = @toMeetId, purpose = @purpose, visitDate = getdate(), inTime = getdate(), status = 3, imagePath = @photo, bCardPath = @card
            where id = @id and apptID = @apptid
          `);

        res.json({ status: "success" });

    }

   

  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "error" });
  }
});

// ============   Check-In Lists  ====================================================================================

router.get("/checkin-list", async (req, res) => {

  try {
    const pool = await getDb2Connection();

    const result = await pool.request()
      .query(`
        SELECT 
        id,
        apptid,
          vName,
          vNumber,
          companyName,
          apptTime,
          apptDate,
          inTime,
          toMeet,
          LTRIM(RTRIM(toMeetID)) AS toMeetId,
          status,
          imagePath,
          bCardPath,
          purpose
        FROM Appointments
        WHERE status = 3
        ORDER BY id ASC
      `);

      // console.log(result)
    // If no data
    if (result.recordset.length === 0) {
      return res.json({
        status: "success",
        data: []
      });
    }

    res.json({
      status: "success",
      data: result.recordset
    });

  } catch (err) {
    // console.log("ERROR:", err);
    res.json({
      status: "error",
      message: err.message
    });
  }
});


// ============   Check-Out Lists  ====================================================================================

router.post("/checkOUT", async (req, res) => {
  try {
    const { id, apptid } = req.body;

    if (!id || !apptid) {
      return res.status(400).json({ status: "error", message: "Missing data" });
    }

    const pool = await getDb2Connection();

    await pool.request()
      .input("id", sql.Int, id)
      .input("apptid", sql.VarChar, apptid)
      .query(`
        UPDATE Appointments
        SET outTime = GETDATE(), status = 4
        WHERE id = @id AND apptID = @apptid
      `);

      const vendorDetails = await pool.request()
      .input("id", sql.Int, id)
      .input("apptid", sql.VarChar, apptid)
      .query(`
        SELECT id, apptID, vName, vNumber, apptDate, apptTime, toMeetID
        FROM Appointments
        WHERE id = @id AND apptID = @apptid
      `);

    // ✅ Check if data exists
    if (vendorDetails.recordset.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Appointment not found"
      });
    }

    const vDetails = vendorDetails.recordset[0];

    // 🔹 Send WhatsApp Message
    await sendCheckoutWtMessage(
      vDetails.vNumber      
    );

    res.json({ status: "success" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "error" });
  }
});


// ==============   Reports   =========================================================================================

router.get("/reports", async (req, res) => {
  try {
    const { from, to } = req.query;

    const pool = await getDb2Connection();

    const result = await pool.request()
      .input("from", sql.Date, from)
      .input("to", sql.Date, to)
      .query(`
        SELECT
        id,
        apptID, 
          vName,
          vNumber,
          companyName,
          apptDate,
          inTime,
          outTime,
          toMeet,
          imagePath,
          bCardPath,
          status
        FROM Appointments
        WHERE CAST(apptDate AS DATE) BETWEEN @from AND @to
        ORDER BY apptDate DESC
      `);

    res.json({
      status: "success",
      data: result.recordset
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "error" });
  }
});

//  ============================    get to-meet person mobile number  ================================================

router.get("/get-meet-number", async (req, res) => {
  const { toMeetId } = req.query;

  
    const pool = await getDb2Connection();


  try {
    const result = await pool.request()
      .input("id", sql.VarChar, toMeetId)
      .query("SELECT phoneNo,Name FROM VistorList WHERE desgOrder = @id");

    if (result.recordset.length > 0) {
      let mobile = result.recordset[0].phoneNo;
      let Name = result.recordset[0].Name;

      // ✅ Remove spaces, +91, special chars if any
      mobile = mobile ? mobile.replace(/\D/g, "") : "";

      // ✅ Check length
      if (mobile.length < 10) {
        return res.json({
          status: "invalid - Mobile Number",
          message: "Phone number is less than 10 digits"
        });
      }

      res.json({
        status: "success",
        mobile: mobile,
        name: Name
      });

    } else {
      res.json({ status: "not_found" });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error" });
  }
});

// ==============  Approvals Reports   =========================================================================================

router.get("/approval-reports", async (req, res) => {
  try {
    const { id, from, to } = req.query;

    const pool = await getDb2Connection();

    const result = await pool.request()    
      .input("id", sql.NVarChar, id)
      .input("from", sql.Date, from)
      .input("to", sql.Date, to)
      .query(`
        SELECT
        id,
        apptID, 
          vName,
          vNumber,
          companyName,
          apptDate,
          apptTime,
          inTime,
          outTime,
          toMeet,
          imagePath,
          bCardPath,
          status
        FROM Appointments
        WHERE toMeetID = @id AND CAST(apptDate AS DATE) BETWEEN @from AND @to
        ORDER BY id DESC
      `);

    res.json({
      status: "success",
      data: result.recordset
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "error" });
  }
});

// ============   Appointment approve / reject  ====================================================================================

router.post("/appoint-action", async (req, res) => {
  try {
    const { id, apptid, action , rejReason} = req.body;

    if (!id || !apptid || !action ) {
      return res.status(400).json({ status: "error", message: "Missing data" });
    }

    const pool = await getDb2Connection();

    const status = action === "approve" ? 2 : 1;

    await pool.request()
      .input("id", sql.Int, id)
      .input("status", sql.Int, status)
      .input("apptid", sql.VarChar, apptid)
      .input("rejReason", sql.VarChar, rejReason)
      .query(`
        UPDATE Appointments
        SET outTime = GETDATE(), status = @status, rejReason = @rejReason
        WHERE id = @id AND apptID = @apptid
      `);

      // 🔹 Get Vendor Details
    const vendorDetails = await pool.request()
      .input("id", sql.Int, id)
      .input("apptid", sql.VarChar, apptid)
      .query(`
        SELECT id, apptID, vName, vNumber, apptDate, apptTime, toMeetID
        FROM Appointments
        WHERE id = @id AND apptID = @apptid
      `);

    // ✅ Check if data exists
    if (vendorDetails.recordset.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Appointment not found"
      });
    }

    const vDetails = vendorDetails.recordset[0];

    // 🔹 Get Meet Person Name (IMPORTANT: await)
    const toMeet = await getMeetPerson(pool, vDetails.toMeetID);

    // 🔹 Send WhatsApp Message
    await sendResponseWtMessage(
      action,
      vDetails.vNumber,
      vDetails.vName,
      toMeet,
      vDetails.apptDate,
      vDetails.apptTime
    );

    res.json({ status: "success" });

      
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "error" });
  }
});

//  ============================  approve or reject status change via whatsapp  ================================================

router.get("/approve", async (req, res) => {
  try {
    const { apptid, action } = req.query;
    
    const pool = await getDb2Connection();

    console.log("ApptID:", apptid);
    console.log("Action:", action);

    const [part1, part2] = apptid.split("_");
    // example like part1 = v123 & part2 = 3 ( meetperson id)


    console.log(part1,part2);

    res.redirect(`https://appointment.pothysswarnamahalapp.com/approvals?id=${part2}`);

  } catch (err) {
    console.error(err);
    res.send("<h3>❌ Server Error</h3>");
  }
});

//  ===============================================================================================================

module.exports = router;