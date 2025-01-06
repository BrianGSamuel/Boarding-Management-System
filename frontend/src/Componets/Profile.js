import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./CSS/Profile.css";

function LoggedCustomer() {
  const [customer, setCustomer] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [updatedRoomData, setUpdatedRoomData] = useState({
    roomType: "",
    roomAddress: "",
    price: "",
    description: "",
    images: [],
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const navigate = useNavigate();

  // Fetch customer details
  useEffect(() => {
    async function fetchDetails() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          alert("You are not logged in!");
          navigate("/login");
          return;
        }

        const customerResponse = await axios.get("http://localhost:8070/customer/display", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCustomer(customerResponse.data);
      } catch (err) {
        console.error("Error fetching details:", err.message);
        if (err.response && err.response.status === 401) {
          alert("Session expired. Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          alert("An error occurred while fetching your details.");
        }
      }
    }

    fetchDetails();
    fetchRooms(); // Call fetchRooms to load rooms
  }, [navigate]);

  // Fetch rooms function
  const fetchRooms = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Please log in to access your rooms.");
      setAlertType("danger");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get("http://localhost:8070/myrooms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(response.data);
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to load rooms.");
      setAlertType("danger");
    }
  };

  // Handle customer update
  const handleCustomerUpdate = () => {
    if (customer && customer._id) {
      navigate(`/update-customer/${customer._id}`);
    } else {
      alert("Customer details not found.");
    }
  };

  // Handle customer delete
  const handleCustomerDelete = () => {
    if (customer && window.confirm("Are you sure you want to delete your account?")) {
      axios
        .delete(`http://localhost:8070/customer/delete/${customer._id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then(() => {
          alert("Account deleted successfully!");
          localStorage.removeItem("token");
          navigate("/register");
        })
        .catch((err) => {
          console.error("Error deleting account:", err.message);
          alert("Error deleting account: " + err.message);
        });
    }
  };

  // Delete room
  const deleteRoom = async (roomId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Please log in to delete a room.");
      setAlertType("danger");
      return;
    }

    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        const response = await axios.delete(`http://localhost:8070/deleteroom/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setRooms((prevRooms) => prevRooms.filter((room) => room._id !== roomId));
        setMessage(response.data.message || "Room deleted successfully.");
        setAlertType("success");
      } catch (err) {
        setMessage(err.response?.data?.error || "Failed to delete room.");
        setAlertType("danger");
      }
    }
  };

  // Update room
  const updateRoom = async (roomId, formData) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Please log in to update a room.");
      setAlertType("danger");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8070/updateroom/${roomId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData, // Send FormData object containing updated room data
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Room updated:", data);
        alert("Room updated successfully!");
        fetchRooms(); // Reload rooms after update
        setSelectedRoom(null); // Close the update form by resetting selectedRoom
      } else {
        console.error("Update failed:", data.error);
        alert(`Failed to update room: ${data.error}`);
      }
    } catch (error) {
      console.error("Error during update:", error);
      alert("An error occurred while updating the room.");
    }
  };

  // Handle room update
  const handleRoomUpdate = (room) => {
    setSelectedRoom(room);
    setUpdatedRoomData({
      roomType: room.roomType,
      roomAddress: room.roomAddress,
      price: room.price,
      description: room.description,
      images: room.images, // Keep track of existing images
    });
    setImagePreviews([]); // Start with no previews for new uploads
  };
  
  // Handle room form submit
  const handleRoomFormSubmit = (e) => {
    e.preventDefault();
  
    const formData = new FormData();
  
    // Add new image files to FormData
    imagePreviews.forEach((preview) => {
      if (preview.file) {
        formData.append("images", preview.file);
      }
    });
  
    // Include a list of existing images to keep
    const imagesToKeep = updatedRoomData.images;
    formData.append("keepImages", JSON.stringify(imagesToKeep));
  
    // Include other room data
    for (const key in updatedRoomData) {
      if (key !== "images") {
        formData.append(key, updatedRoomData[key]);
      }
    }
  
    updateRoom(selectedRoom._id, formData);
  };
  
  
  
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImagePreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file), // Object URL for new image preview
    }));
  
    // Ensure total images (existing + new) do not exceed 10
    if (updatedRoomData.images.length + imagePreviews.length + newImagePreviews.length > 10) {
      alert("You can upload up to 10 images only.");
      return;
    }
  
    setImagePreviews((prev) => [...prev, ...newImagePreviews]);
  };
  
  
  const handleImageDelete = (index, isExisting) => {
    if (isExisting) {
      // Remove from existing images
      const updatedImages = updatedRoomData.images.filter((_, i) => i !== index);
      setUpdatedRoomData((prevData) => ({ ...prevData, images: updatedImages }));
    } else {
      // Remove from new image previews
      setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    }
  };
  
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container">
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

          <div className="collapse navbar-collapse" id="navbarContent">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item"><a className="nav-link" href="/dash">Dashboard</a></li>
              <li className="nav-item"><a className="nav-link" href="/Rooms">Rooms</a></li>
              <li className="nav-item"><a className="nav-link" href="/staff">Staff</a></li>
              <li className="nav-item"><a className="nav-link" href="/maintenance">Maintenance</a></li>
              <li className="nav-item"><a className="nav-link" href="/profile">Profile</a></li>
              <li className="nav-item"><a className="nav-link" href="/login">Logout</a></li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="LoggedCustomer-container d-flex flex-wrap justify-content-between p-3">
        <div className="customer-details-container w-45 p-3">
          <h2>My Details</h2>
          {customer ? (
            <form>
              <div className="row mb-3">
                <div className="col">
                  <label htmlFor="firstname" className="form-label">First Name</label>
                  <input type="text" className="form-control" id="firstname" value={customer.name} readOnly />
                </div>
                <div className="col">
                  <label htmlFor="lastname" className="form-label">Last Name</label>
                  <input type="text" className="form-control" id="lastname" value={customer.Lname || "N/A"} readOnly />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col">
                  <label htmlFor="dob" className="form-label">Date of Birth</label>
                  <input type="text" className="form-control" id="dob" value={customer.DOB || "N/A"} readOnly />
                </div>
                <div className="col">
                  <label htmlFor="gender" className="form-label">Gender</label>
                  <input type="text" className="form-control" id="gender" value={customer.Gender || "N/A"} readOnly />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col">
                  <label htmlFor="phone1" className="form-label">Phone Number 1</label>
                  <input type="text" className="form-control" id="phone1" value={customer.Phonenumber1 || "N/A"} readOnly />
                </div>
                <div className="col">
                  <label htmlFor="phone2" className="form-label">Phone Number 2</label>
                  <input type="text" className="form-control" id="phone2" value={customer.Phonenumber2 || "N/A"} readOnly />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input type="email" className="form-control" id="email" value={customer.email || "N/A"} readOnly />
              </div>
              <div className="mb-3">
                <label htmlFor="address" className="form-label">Address</label>
                <input type="text" className="form-control" id="address" value={customer.Address || "N/A"} readOnly />
              </div>

              <button type="button" className="btn btn-primary" onClick={handleCustomerUpdate}>Update</button>
              <button type="button" className="btn btn-danger" onClick={handleCustomerDelete}>Delete Account</button>
            </form>
          ) : (
            <p>Loading...</p>
          )}
        </div>

        <div className="my-rooms-container w-45 p-3">
          <h2>My Rooms</h2>
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <div key={room._id} className="room-card p-3 mb-3 border rounded d-flex align-items-center">
                {/* Image Carousel */}
                <div className="image-carousel me-3" style={{ width: "200px" }}>
                  <div className="image-display">
                    <img
                      src={`http://localhost:8070${room.images[0]}`} // Display the first image initially
                      alt="Room"
                      className="card-img-top"
                      style={{ height: "200px", width: "200px", objectFit: "cover", borderRadius:"10px" }}
                    />
                  </div>
                </div>

                <div className="room-details">
                  <h3>A <strong>{room.roomType}</strong> Listed - {room.roomAddress}</h3>
                  <p><strong>Rs.{room.price} /month</strong></p>
                  <p>{room.description}</p>
                  <div className="d-flex justify-content-start">
                    <button className="btn btn-warning me-2" onClick={() => handleRoomUpdate(room)}>Update Room</button>
                    <button className="btn btn-danger" onClick={() => deleteRoom(room._id)}>Delete Room</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No rooms available.</p>
          )}



          {/* Room Update Form */}
          {selectedRoom && (
            <div className="update-room-form">
            <h2>Update Room</h2>
            <form onSubmit={handleRoomFormSubmit}>
              <div className="mb-3">
                <label className="form-label">Room Type</label>
                <input
                  type="text"
                  className="form-control"
                  value={updatedRoomData.roomType}
                  onChange={(e) =>
                    setUpdatedRoomData({ ...updatedRoomData, roomType: e.target.value })
                  }
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Room Location</label>
                <input
                  type="text"
                  className="form-control"
                  value={updatedRoomData.roomAddress}
                  onChange={(e) =>
                    setUpdatedRoomData({ ...updatedRoomData, roomAddress: e.target.value })
                  }
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Price</label>
                <input
                  type="number"
                  className="form-control"
                  value={updatedRoomData.price}
                  onChange={(e) =>
                    setUpdatedRoomData({ ...updatedRoomData, price: e.target.value })
                  }
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  value={updatedRoomData.description}
                  onChange={(e) =>
                    setUpdatedRoomData({ ...updatedRoomData, description: e.target.value })
                  }
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Images</label>
                  <input
                    type="file"
                    className="form-control"
                    id="roomImages"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    disabled={updatedRoomData.images.length + imagePreviews.length >= 10}
                  />
                  <small className="form-text text-muted">
                    {updatedRoomData.images.length + imagePreviews.length} / 10 images selected.
                  </small>

                {/* Display existing images */}
                  {updatedRoomData.images.length > 0 && (
                <div className="mt-3">
                  {updatedRoomData.images.map((image, index) => (
                <div
                  key={`existing-${index}`}
                  className="image-preview-container position-relative d-inline-block me-2"
                >
                <img
                  src={`http://localhost:8070${image}`} // Use server URL
                  alt={`Existing Image ${index}`}
                  className="img-thumbnail"
                  width="100"
                />
              <button
                type="button"
                className="btn btn-sm btn-danger position-absolute top-0 end-0"
                onClick={() => handleImageDelete(index, true)} // Pass true for existing images
              >
              X
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Display new image previews */}
      {imagePreviews.length > 0 && (
        <div className="mt-3">
          {imagePreviews.map((preview, index) => (
            <div
              key={`preview-${index}`}
              className="image-preview-container position-relative d-inline-block me-2"
            >
            <img
              src={preview.url} // Use Object URL
              alt={`Preview ${index}`}
              className="img-thumbnail"
              width="100"
            />
            <button
              type="button"
              className="btn btn-sm btn-danger position-absolute top-0 end-0"
              onClick={() => handleImageDelete(index, false)} // Pass false for new previews
            >
              X
            </button>
            </div>
          ))}
        </div>
      )}
    </div>

              <button type="submit" className="btn btn-success">Update Room</button>
            </form>
          </div>
          )}
        </div>
      </div>
    </>
  );
}

export default LoggedCustomer;
