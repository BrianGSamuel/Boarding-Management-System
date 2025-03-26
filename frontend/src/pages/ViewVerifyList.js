import React, { useEffect, useState } from "react"; //ViewVerifyList.js
import axios from "axios";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Componets/CSS/ViewServiceProvider.css";

function ViewVerifyList() {
  const [verifiedProviders, setVerifiedProviders] = useState([]);

  useEffect(() => {
    fetchVerifiedProviders();
  }, []);

  const fetchVerifiedProviders = async () => {
    try {
      const response = await axios.get("http://localhost:8070/ServiceProvider/verified");
      setVerifiedProviders(response.data);
    } catch (error) {
      console.error("Error fetching verified providers", error);
      alert("Failed to load verified service providers.");
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-menu">
        <ul>
          <li><Link to="/service-agent-dash">Dashboard</Link></li>
          <li><Link to="/service-provider-list">Unverified Service Providers</Link></li>
          <li><Link to="/verified-providers">Verified Service Providers</Link></li>
          <li><Link to="/service-requests">Service Requests</Link></li>
          <li><Link to="/">Logout</Link></li>
        </ul>
      </nav>

      <div className="content-container">
        <h2 className="mb-3 text-center">Verified Service Providers</h2>
        <div className="row">
          {verifiedProviders.length > 0 ? (
            verifiedProviders.map((provider) => (
              <div className="col-md-6" key={provider._id}>
                <div className="card service-card">
                  <div className="card-body">
                    <h5 className="card-title">{provider.name}</h5>
                    <p className="card-text"><strong>Email:</strong> {provider.email}</p>
                    <p className="card-text"><strong>Phone:</strong> {provider.phoneNumber}</p>
                    <p className="card-text"><strong>Service Area:</strong> {provider.serviceArea}</p>
                    <p className="card-text"><strong>Service Type:</strong> {provider.serviceType}</p>
                    <p className="card-text"><strong>Description:</strong> {provider.description || "N/A"}</p>
                    <p className="card-text"><strong>Created At:</strong> {provider.createdAt}</p>
                    <p className="card-text"><strong>Status:</strong> {provider.status}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No verified providers found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewVerifyList;
