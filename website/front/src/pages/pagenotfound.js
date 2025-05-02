import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
      <div className="d-flex flex-column align-items-center justify-content-center vh-100 text-center bg-light">
        <h1 className="display-1 fw-bold text-primary">404</h1>
        <h2 className="fs-3 fw-semibold mt-3">Page Not Found</h2>
        <p className="text-muted mt-2">Something went wrong, this page is broken.</p>
        <div className="mt-4 d-flex gap-3">
          <button className="btn btn-primary px-4 py-2" onClick={() => navigate('/')}>Return to homepage</button>
          <button className="btn btn-outline-primary px-4 py-2" onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
  );
};

export default NotFoundPage;
