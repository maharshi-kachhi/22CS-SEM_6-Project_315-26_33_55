import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, User, Phone, EyeClosed, Eye } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import {CopperLoading} from 'respinner';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ message: "", type: "" });
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);


  const validateForm = () => {
    let newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    } else if (formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters.";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number.";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true); // Start loading spinner
  
      try {
        const res = await axios.post("/api/v1/auth/register", formData);
  
        console.log("API Response:", res.data);
  
        if (res && res.data.success) {
          setNotification({ message: res.data.message, type: "success" });
  
          setTimeout(() => {
            navigate("/login");
          }, 1000); // Navigate after 1 second
        } else {
          setNotification({ message: res.data.message, type: "danger" });
  
          setTimeout(() => {
            setLoading(false); // Stop spinner after 0.5s for failed signup
          }, 500);
        }
      } catch (error) {
        setNotification({
          message: error.response?.data?.message || "Something went wrong!",
          type: "danger",
        });
  
        setTimeout(() => {
          setLoading(false); // Stop spinner after 0.5s if there's an error
        }, 500);
      }
    }
  };
  

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: "#bfc3ce" }}>
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ maxWidth: "900px", width: "100%" }}>
        <div className="row g-0">
          {/* Left Section */}
          <div className="col-md-6 bg-light p-4 d-flex flex-column justify-content-center">
            <div className="mb-3">
              <span className="badge bg-primary p-2 rounded-circle"></span>
            </div>
            <h3 className="fw-bold">
              Let us help you run text to detect Hate speech.
            </h3>
            <p className="text-muted">
              Our registration process is quick and easy, taking no more than 2
              minutes to complete.
            </p>
            <div className="p-3 bg-black text-white rounded-3 mt-3">
              <p className="mb-1">
                <i className="fas fa-quote-left"></i> I'm impressed with the
                results I've seen since starting to use this product, I began
                receiving clients and projects in the first week.
              </p>
              <div className="d-flex align-items-center mt-2">
                <div>
                  <h6 className="mb-0">Jal Patel</h6>
                  <small>Product Designer</small>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="col-md-6 p-4">
          {notification.message && (
            <div className={`alert alert-${notification.type} text-center`}>
              {notification.message}
            </div>
          )}
            <h4 className="fw-bold">Get started</h4>
            <p className="text-muted">Create your account now</p>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Full name</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <User size={16}/>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    placeholder="Alex Parkinson"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                {errors.name && <small className="text-danger">{errors.name}</small>}
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <Mail size={16}/>
                  </span>
                  <input
                    className="form-control"
                    name="email"
                    placeholder="alex@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {errors.email && <small className="text-danger">{errors.email}</small>}
              </div>

              <div className="mb-3">
                <label className="form-label">Phone Number</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <Phone size={16}/>
                  </span>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    placeholder="+91 0123456789"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                {errors.phone && <small className="text-danger">{errors.phone}</small>}
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <Lock size={16}/>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <span
                    className="input-group-text"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ cursor: "pointer" }}
                  >
                    {showPassword ? <Eye/> : <EyeClosed/>}
                  </span>
                </div>
                {errors.password && <small className="text-danger">{errors.password}</small>}
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100"
                style={{ fontWeight: "normal"}}
                onMouseEnter={(e) => (e.target.style.fontWeight = "bold")}
                onMouseLeave={(e) => (e.target.style.fontWeight = "normal")}
                disabled={loading} // Disable button while loading
              >
                {loading ? (
                  <CopperLoading fill="#fff" size={16} strokeWidth={1} duration={1} />
                ) : (
                  "Sign Up"
                )}
              </button>


              <div className="text-center mt-3">
                <small>
                  Have an account?{" "}
                  <a
                    href="/login"
                    className="text-decoration-none"
                    style={{ fontWeight: "normal" }}
                    onMouseEnter={(e) => (e.target.style.fontWeight = "bold")}
                    onMouseLeave={(e) => (e.target.style.fontWeight = "normal")}
                  >
                    Login
                  </a>
                </small>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
