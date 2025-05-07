import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Componets/CSS/CustomerServiceProvider.css";

// Import images for each service type
import plumberImg from "../Componets/assets/plumber.jpg";
import electricianImg from "../Componets/assets/electric.jpg";
import laundryImg from "../Componets/assets/laundry.jpg";
import cleaningImg from "../Componets/assets/clean.jpg";
import pestControlImg from "../Componets/assets/pest.jpg";
import mechanicImg from "../Componets/assets/mechanic.jpg";
import painterImg from "../Componets/assets/painter.jpg";
import masonImg from "../Componets/assets/mason.jpg";
import otherImg from "../Componets/assets/courier.jpg";

function CustomerServiceProviders() {
  const [verifiedProviders, setVerifiedProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [searchArea, setSearchArea] = useState("");
  const [searchType, setSearchType] = useState("");

  // Image mapping for each service type
  const serviceTypeImages = {
    Plumber: plumberImg,
    Electrician: electricianImg,
    Laundry: laundryImg,
    Cleaning: cleaningImg,
    "Pest Control": pestControlImg,
    Mechanic: mechanicImg,
    Painter: painterImg,
    Mason: masonImg,
    Other: otherImg,
  };

  useEffect(() => {
    fetchVerifiedProviders();
  }, []);

  const fetchVerifiedProviders = async () => {
    try {
      const response = await axios.get("http://localhost:8070/ServiceProvider/verified");
      setVerifiedProviders(response.data);
      setFilteredProviders(response.data); // Initially display all verified providers
    } catch (error) {
      console.error("Error fetching verified providers", error);
      alert("Failed to load verified service providers.");
    }
  };

  const handleSearch = () => {
    let filtered = verifiedProviders;

    if (searchArea) {
      filtered = filtered.filter((provider) =>
        provider.serviceArea.toLowerCase().includes(searchArea.toLowerCase())
      );
    }

    if (searchType) {
      filtered = filtered.filter((provider) =>
        provider.serviceType.toLowerCase().includes(searchType.toLowerCase())
      );
    }

    setFilteredProviders(filtered);
  };

  return (
    <div className="customer-service-container">
      {/* Search Bar */}
      <div className="search-bar-container mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search by Service Area (e.g., Kataragama)"
              value={searchArea}
              onChange={(e) => setSearchArea(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search by Service Type (e.g., Plumbing)"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <button className="btn btn-primary w-100" onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Service Providers List */}
      <div className="service-providers-list">
        <h2 className="mb-4">Verified Service Providers: {filteredProviders.length} found</h2>
        {filteredProviders.length > 0 ? (
          filteredProviders.map((provider) => (
            <div className="provider-card mb-3 p-3 border rounded d-flex" key={provider._id}>
              <div className="provider-image me-3">
                <img
                  src={serviceTypeImages[provider.serviceType] || "https://via.placeholder.com/150?text=No+Image"}
                  alt={`${provider.serviceType} Image`}
                  style={{ width: "150px", height: "150px", objectFit: "cover", borderRadius: "8px" }}
                />
              </div>
              <div className="provider-details flex-grow-1">
                <h5>{provider.name}</h5>
                <p className="mb-1">
                  <strong>Service Area:</strong> {provider.serviceArea}
                </p>
                <p className="mb-1">
                  <strong>Service Type:</strong> {provider.serviceType}
                </p>
                <p className="mb-1">
                  <strong>Description:</strong> {provider.description || "N/A"}
                </p>
                <p className="mb-1">
                  <strong>Contact:</strong> {provider.phoneNumber} | {provider.email}
                </p>
              </div>
              <div className="provider-rating d-flex flex-column align-items-end">
                <span className="badge bg-success mb-2">Verified</span>
                <button className="btn btn-primary btn-sm">Contact Provider</button>
              </div>
            </div>
          ))
        ) : (
          <p>No verified service providers found matching your criteria.</p>
        )}
      </div>
    </div>
  );
}

export default CustomerServiceProviders;