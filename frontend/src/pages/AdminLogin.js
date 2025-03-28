import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import '../Componets/CSS/AdminLogin.css'

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState(""); // For bootstrap alert type
  const navigate = useNavigate(); // Use navigate for redirection

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8070/admin/login", { email, password });
      setMessage(`Welcome back, ${response.data.username}!`);
      setAlertType("success");
      sessionStorage.setItem("token", response.data.token); // Save the admin token in sessionStorage
      navigate("/Admindash", { state: { message: `Welcome, ${response.data.username}!`, alertType: "success" } });
    } catch (err) {
      setMessage(err?.response?.data?.error || "Admin login failed!");
      setAlertType("danger");
    }
  };

  return (
    <>
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg">
        <div className="container">
          <a className="navbar-brand" href="/">Boarding Manager Portal</a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
            aria-controls="navbarContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>
      </nav>

      <div className="Login-container">
        <h2 className="heading">Boarding Manager Login</h2>
        <form onSubmit={handleAdminLogin} className="w-70 mx-auto mt-4">
          <div className="mb-3">
            <label htmlFor="email" className="AdminLoginform-label">Email:</label>
            <input
              type="email"
              className="AdminLoginform-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="AdminLoginform-label">Password:</label>
            <input
              type="password"
              className="AdminLoginform-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="AdminLoginbtn w-100">Login</button>
        </form>

        {/* Show the alert message based on login status */}
        {message && (
          <div className={`alert alert-${alertType} mt-4`} role="alert">
            {message}
          </div>
        )}
        {/*
        <div className="text-center mt-3">
          <p>
            Not an Admin?{" "}
            <Link to="/AdminRegister" className="text-primary">
              Admin Registration
            </Link>
          </p>
        </div>
        */}
      </div>
    </>
  );
};

export default AdminLogin;
