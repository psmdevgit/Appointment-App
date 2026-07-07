import React, { useEffect, useState } from "react";
import API from "../axios";

const VisitorList = () => {

  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    empcode: "",
    designation: "",
    active: "y",
    department: "",
    desgorder: visitors.length + 1,
    phoneno: "",
  });

  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    loadVisitors();
  }, []);

  // LOAD VISITORS
  const loadVisitors = async () => {

    try {

      setLoading(true);

      const res = await API.get("/visitorlist");

      const data = res.data;

      if (data.status === "success") {
        setVisitors(data.data);
         setFormData((prev) => ({
    ...prev,
    desgorder: data.count[0].count
  }));
      }

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);
    }
  };

  // INPUT CHANGE
  const handleChange = (e) => {


  let value = e.target.value;

   // ONLY NUMBER FOR PHONE
  if (e.target.name === "phoneno") {
    value = value.replace(/\D/g, "");
  } else {
    value = value.toUpperCase();
  }

    setFormData({
      ...formData,
      [e.target.name]: e.target.value.toUpperCase(),
    });
  };

  // CLEAR FORM
  const clearForm = () => {

    setFormData({
      id: "",
      name: "",
      empcode: "",
      designation: "",
      active: "y",
      department: "",
      desgorder: visitors.length + 1,
      phoneno: "",
    });

    setIsEdit(false);
  };

  // SAVE / UPDATE
  const handleSubmit = async (e) => {

    e.preventDefault();

     // VALIDATIONS
  if (!formData.name.trim()) {
    alert("Enter Name");
    return;
  }

  if (!formData.empcode.toString().trim()) {
    alert("Enter Employee Code");
    return;
  }

  if (!formData.designation.trim()) {
    alert("Enter Designation");
    return;
  }

  if (!formData.department.trim()) {
    alert("Enter Department");
    return;
  }

  if (!formData.phoneno.trim()) {
    alert("Enter Phone Number");
    return;
  }

  const mobileRegex = /^[0-9]{10}$/;

  if (!mobileRegex.test(formData.phoneno)) {
    alert("Phone Number must be 10 digits");
    return;
  }


    try {

      let res;

      if (isEdit) {

        res = await API.put(
          "/visitorlist/update",
          formData
        );

      } else {

        res = await API.post(
          "/visitorlist/add",
          formData
        );
      }

      const data = res.data;

      if (data.status === "success") {

        alert(
          isEdit
            ? "Updated Successfully"
            : "Added Successfully"
        );

        clearForm();

        loadVisitors();
      }

    } catch (err) {

      console.log(err);
    }
  };

  // EDIT
  const handleEdit = (row) => {

    setFormData({
      id: row.id,
      name: row.name,
      empcode: row.empcode,
      designation: row.designation,
      active: row.active,
      department: row.department,
      desgorder: row.desgorder,
      phoneno: row.phoneno,
    });

    setIsEdit(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // HIDE / ACTIVE
  const handleHide = async (id) => {

    const confirmBox = window.confirm(
      "Change active status?"
    );

    if (!confirmBox) return;

    try {

      const res = await API.put(
        `/visitorlist/hide/${id}`
      );

      const data = res.data;

      if (data.status === "success") {

        alert("Status Updated");

        loadVisitors();
      }

    } catch (err) {

      console.log(err);
    }
  };

  // DELETE
  const handleDelete = async (id) => {

    const confirmBox = window.confirm(
      "Are you sure want delete?"
    );

    if (!confirmBox) return;

    try {

      const res = await API.delete(
        `/visitorlist/delete/${id}`
      );

      const data = res.data;

      if (data.status === "success") {

        alert("Deleted Successfully");

        loadVisitors();
      }

    } catch (err) {

      console.log(err);
    }
  };

  const tableContainerStyle = {
    
  marginTop:"20px",
  maxHeight: "680px",
  overflowY: "auto",
  position: "relative",
};

const tableHeaderStyle = {
  backgroundColor: "#D5EDDB",
  color: "#000",
  // position: "sticky",
  top: 0,
  zIndex: 1,
};


  return (

    <div className="container-fluid pb-3">

      <div className="row">

        {/* LEFT SIDE FORM */}

        <div className="col-lg-4 mb-3">

          <div className="card shadow border-0">

            <div className="card-header text-black" style={{background:'#ccc'}}>

              <h5 className="mb-0">
                {isEdit
                  ? "Edit"
                  : "Add New"}
              </h5>

            </div>

            <div className="card-body">

              <form onSubmit={handleSubmit}>

                {/* NAME */}

                <div className="mb-3">

                  <label className="form-label">
                    Name
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />

                </div>

                {/* EMP CODE */}

                <div className="mb-3">

                  <label className="form-label">
                    Employee Code
                  </label>

                  <input
                    type="number"
                    className="form-control"
                    name="empcode"
                    value={formData.empcode}
                    onChange={handleChange}
                  />

                </div>

                {/* DESIGNATION */}

                <div className="mb-3">

                  <label className="form-label">
                    Designation
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                  />

                </div>

                {/* DEPARTMENT */}

                <div className="mb-3">

                  <label className="form-label">
                    Department
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                  />

                </div>

                {/* ORDER */}

                <div className="mb-3">

                  <label className="form-label">
                    Designation Order
                  </label>

                  <input
                    type="number"
                    className="form-control"
                    name="desgorder"
                    value={formData.desgorder}
                    onChange={handleChange}
                  />

                </div>

                {/* PHONE */}

                <div className="mb-3">

                  <label className="form-label">
                    Phone Number
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    name="phoneno"
                    value={formData.phoneno}
                    onChange={handleChange}
                      maxLength="10"
                  />

                </div>

                {/* ACTIVE */}

                <div className="mb-3">

                  <label className="form-label">
                    Active
                  </label>

                  <select
                    className="form-select"
                    name="active"
                    value={formData.active}
                    onChange={handleChange}
                  >
                    <option value="y">
                      Active
                    </option>

                    <option value="n">
                      Hidden
                    </option>
                  </select>

                </div>

                {/* BUTTONS */}

                <div className="d-flex gap-2">

                  <button
                    type="submit"
                    className={`btn ${
                      isEdit
                        ? "btn-warning"
                        : "btn-success"
                    }`}
                  >
                    {isEdit
                      ? "Update"
                      : "Save"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={clearForm}
                  >
                    Clear
                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>

        {/* RIGHT SIDE TABLE */}

        <div className="col-lg-8">

          <div className="card shadow border-0">

            <div className="card-header text-black d-flex justify-content-between align-items-center"  style={{background:'#ccc'}}>

              <h5 className="mb-0">
                Visitor List
              </h5>

              <span className="badge bg-light text-dark">
                Total : {visitors.length}
              </span>

            </div>

            <div className="card-body table-responsive"   style={tableContainerStyle}>

              {loading ? (

                <div className="text-center py-5">
                  Loading...
                </div>

              ) : (

                <table className="table table-bordered table-hover table-striped" style={{fontSize:'.8rem',borderCollapse: "separate", borderSpacing: 0, }}>

                  <thead >

                    <tr className="text-center">

                      {/* <th>ID</th> */}
                      <th style={tableHeaderStyle}>Name</th>
                      <th style={tableHeaderStyle}>EmpCode</th>
                      <th style={tableHeaderStyle}>Designation</th>
                      <th style={tableHeaderStyle}>Department</th>
                      <th style={tableHeaderStyle}>Phone</th>
                      <th style={tableHeaderStyle}>Status</th>
                      <th style={tableHeaderStyle} width="220">
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {visitors.length > 0 ? (

                      visitors.map((item) => (

                        <tr key={item.id} className="text-center">

                          {/* <td>{item.id}</td> */}

                          <td>{item.name}</td>

                          <td>{item.empcode}</td>

                          <td>{item.designation}</td>

                          <td>{item.department}</td>

                          <td>{item.phoneno}</td>

                          <td >

                            <span
                              className={`badge ${
                                item.active === "y"
                                  ? "bg-success"
                                  : "bg-danger"
                              }`}
                            >
                              {item.active === "y"
                                ? "Active"
                                : "Hidden"}
                            </span>

                          </td>

                          <td>

                            <div className="d-flex gap-1 justify-content-center">

                              <button
                                className="btn  btn-sm"
                                onClick={() =>
                                  handleEdit(item)
                                }
                              >
                                {/* Edit */}
                                <i class="bi bi-pencil-square "></i>
                              </button>

                              <button
                                className={`btn btn-sm ${
                                  item.active === "y"
                                    ? "text-danger"
                                    : "text-success"
                                }`}
                                onClick={() =>
                                  handleHide(item.id)
                                }
                              >
                                {item.active === "y"
                                  ? <i class="bi bi-eye-slash"></i>
                                  : <i class="bi bi-eye"></i>}
                              </button>

                              <button
                                className="btn btn-dager btn-sm"
                                onClick={() =>
                                  handleDelete(item.id)
                                }
                              >
                                {/* Delete */}
                                <i class="bi bi-trash text-danger"></i>
                              </button>

                            </div>

                          </td>

                        </tr>

                      ))

                    ) : (

                      <tr>

                        <td
                          colSpan="8"
                          className="text-center"
                        >
                          No Data Found
                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default VisitorList;