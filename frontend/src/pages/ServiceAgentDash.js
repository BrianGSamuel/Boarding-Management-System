import React from "react";
import { Link } from "react-router-dom";
import '../Componets/CSS/serviceAgentDash.css'; // Import CSS

function Dashboard() {
  return (
    <div className="dashboard">
      

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
            <Link to="/service-provider-list">Log out</Link>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="dashboard-content">
        <h2>Welcome to the Service Agent Dashboard</h2>
        <p>Select a section from the menu to manage service providers and requests.</p>
      </div>
    </div>
  );
}

export default Dashboard;

