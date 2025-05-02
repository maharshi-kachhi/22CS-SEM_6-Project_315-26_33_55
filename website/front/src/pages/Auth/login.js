import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Lock, Mail, EyeClosed, Eye } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from './../../context/auth';
import { CopperLoading } from "respinner";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ message: "", type: "" });
  const navigate = useNavigate();
  const [auth, setAuth] = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    let newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required.";
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
      setLoading(true);

      try {
        const res = await axios.post("/api/v1/auth/login", formData);

        if (res && res.data.success) {
          localStorage.setItem('auth', JSON.stringify(res.data));
          setAuth({
            ...auth,
            user: res.data.user,
            token: res.data.token
          });
          setNotification({ message: res.data.message, type: "success" });

          setTimeout(() => {
            navigate("/");
          }, 1000); // Navigate after 1 second
        } else {
          setNotification({ message: res.data.message, type: "danger" });

          setTimeout(() => {
            setLoading(false);
          }, 500); // Stop spinner after 0.5s for incorrect credentials
        }
      } catch (error) {
        setNotification({
          message: error.response?.data?.message || "Something went wrong!",
          type: "danger",
        });

        setTimeout(() => {
          setLoading(false);
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
                <div className="ms-auto text-end"> {/* Moves content to the right */}
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
            <p className="text-muted">Login to your account now</p>

            <form onSubmit={handleSubmit}>
              
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
                style={{ fontWeight: "normal" }}
                onMouseEnter={(e) => (e.target.style.fontWeight = "bold")}
                onMouseLeave={(e) => (e.target.style.fontWeight = "normal")}
                disabled={loading} // Disable button while loading
              >
                {loading ? (
                  <CopperLoading fill="#fff" size={16} strokeWidth={1} duration={1} />
                ) : (
                  "Log in"
                )}
              </button>

              <div className="text-center mt-3">
                <small>
                  Don't have an account?{" "}
                  <a
                    href="/signup"
                    className="text-decoration-none"
                    style={{ fontWeight: "normal" }}
                    onMouseEnter={(e) => (e.target.style.fontWeight = "bold")}
                    onMouseLeave={(e) => (e.target.style.fontWeight = "normal")}
                  >
                    Sign up
                  </a>
                  <hr/>
                  <p className="mt-3 text-center" style={{ fontSize:"10px" }}>
                    Forgot Password? <Link to="/forgot-password" className="text-black text-decoration-none" style={{ fontWeight: "normal" }} onMouseEnter={(e) => e.target.style.fontWeight = "bold"} onMouseLeave={(e) => e.target.style.fontWeight = "normal"}> Click Here to Reset Password</Link>
                  </p>
                </small>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
