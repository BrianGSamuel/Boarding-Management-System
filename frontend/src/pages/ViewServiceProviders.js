import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Componets/CSS/ViewServiceProvider.css"; // Import CSS for styling

function ViewServiceProviders() {
  const [serviceProviders, setServiceProviders] = useState([]);

  useEffect(() => {
    fetchServiceProviders();
  }, []);

  const fetchServiceProviders = async () => {
    try {
      const response = await axios.get("http://localhost:8070/ServiceProvider");
      setServiceProviders(response.data);
    } catch (error) {
      console.error("Error fetching service providers", error);
      alert("Failed to load service providers.");
    }
  };

  const handleAccept = async (id) => {
    try {
      await axios.put(`http://localhost:8070/ServiceProvider/accept/${id}`);
      alert("Service Provider Verified!");
  
      // Remove the accepted provider from the list
      setServiceProviders(serviceProviders.filter(provider => provider._id !== id));
    } catch (error) {
      console.error("Error verifying service provider", error);
      alert("Failed to verify service provider.");
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.delete(`http://localhost:8070/ServiceProvider/reject/${id}`);
      setServiceProviders(serviceProviders.filter(provider => provider._id !== id)); // Remove from list
    } catch (error) {
      console.error("Error rejecting service provider", error);
      alert("Failed to reject service provider.");
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <nav className="dashboard-menu">
        <ul>
          <li>
            <Link to="/service-agent-dash">Dashboard</Link>
          </li>
          <li>
            <Link to="/service-provider-list">Unverified Service Providers</Link>
          </li>
          <li>
            <Link to="/service-provider-verify">Verified Service Providers</Link>
          </li>
          <li>
            <Link to="/service-requests">Service Requests</Link>
          </li>
          <li>
            <Link to="/">Logout</Link>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="content-container">
        <h2 className="mb-3 text-center">Registered Service Providers</h2>
        <div className="row">
          {serviceProviders.length > 0 ? (
            serviceProviders.map((provider) => (
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
                    {/* Accept & Reject Buttons */}
                    <div className="btn-group">
                      <button className="btn btn-success" onClick={() => handleAccept(provider._id)}>Accept</button>
                      <button className="btn btn-danger" onClick={() => handleReject(provider._id)}>Reject</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center">
              <p>No service providers found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewServiceProviders;

