import axios from "axios";

const API = axios.create({
//    baseURL: "http://localhost:5400/api",  
    // baseURL: "http://192.168.5.62:4444/api",  
    baseURL: "https://appointment.pothysswarnamahalapp.com/api",  
    headers: {
        "Content-Type": "application/json"
    }
});

export default API;