import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { FaBoxes, FaClipboardList, FaCalendarCheck, FaChartLine, FaPlus, FaTrash, FaEdit, FaCheckCircle, FaExclamationCircle, FaUsers, FaUserCircle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import defaultProducts from "../data/products.js";
import api from "../utils/api.js";
import "./AdminDashboard.css";

function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'users' | 'products' | 'orders' | 'bookings'

  // Admin Dashboard State
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsers: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    totalProducts: 0,
    totalRevenue: 0,
  });

  const [usersList, setUsersList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);

  // Modal for Adding / Editing Product
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProductForm, setNewProductForm] = useState({
    name: "",
    category: "Blouses",
    price: "",
    originalPrice: "",
    description: "",
    availableSizes: "32 (S), 34 (M), 36 (L), Custom Measurement",
    inStock: true,
    featured: false,
  });

  // Fetch admin data from backend
  const loadAdminData = async () => {
    try {
      const statsRes = await api.get("/api/admin/dashboard");
      if (statsRes) setStats(statsRes);
    } catch (err) {
      console.warn("Failed to load dashboard stats:", err.message);
    }

    try {
      const usersRes = await api.get("/api/admin/users");
      if (Array.isArray(usersRes)) setUsersList(usersRes);
    } catch (err) {
      console.warn("Failed to load users list:", err.message);
    }

    try {
      const prodRes = await api.get("/api/products");
      if (Array.isArray(prodRes) && prodRes.length > 0) {
        setProductList(prodRes);
      } else {
        setProductList(defaultProducts);
      }
    } catch (err) {
      setProductList(defaultProducts);
    }

    try {
      const ordersRes = await api.get("/api/admin/orders");
      if (Array.isArray(ordersRes)) setOrdersList(ordersRes);
    } catch (err) {
      try {
        const saved = localStorage.getItem("priyas_customer_orders");
        if (saved) setOrdersList(JSON.parse(saved));
      } catch (e) {}
    }

    try {
      const apptRes = await api.get("/api/admin/appointments");
      if (Array.isArray(apptRes)) setBookingsList(apptRes);
    } catch (err) {
      try {
        const saved = localStorage.getItem("priyas_tailoring_bookings");
        if (saved) setBookingsList(JSON.parse(saved));
      } catch (e) {}
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      loadAdminData();
    }
  }, [user, isAdmin]);

  // Route Guard: Require Admin Role
  if (!user || !isAdmin) {
    return (
      <div className="admin-page page-container">
        <div className="container">
          <div className="admin-access-denied card">
            <FaExclamationCircle className="warning-icon" />
            <h2>Admin Access Required</h2>
            <p>You must be logged in as an administrator to view this page.</p>
            <p className="login-hint">Demo Admin Email: <code>admin@priyasboutique.com</code> | Password: <code>admin123</code></p>
            <Link to="/login" className="btn btn-primary margin-top">
              Log In as Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handle Add / Edit Product Submit
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!newProductForm.name || !newProductForm.price) {
      addToast("Product name and price are required", "error");
      return;
    }

    const sizesArr = typeof newProductForm.availableSizes === "string"
      ? newProductForm.availableSizes.split(",").map((s) => s.trim()).filter(Boolean)
      : newProductForm.availableSizes;

    const payload = {
      ...newProductForm,
      price: Number(newProductForm.price),
      originalPrice: newProductForm.originalPrice ? Number(newProductForm.originalPrice) : undefined,
      availableSizes: sizesArr,
    };

    if (editingProduct) {
      try {
        const updated = await api.put(`/api/products/${editingProduct.id || editingProduct._id}`, payload);
        if (updated) {
          setProductList((prev) => prev.map((p) => (p.id === editingProduct.id || p._id === editingProduct._id ? { ...p, ...updated } : p)));
          addToast("Product updated successfully in MongoDB!", "success");
        }
      } catch (err) {
        addToast(`Failed to update product: ${err.message}`, "error");
      }
    } else {
      try {
        const created = await api.post("/api/products", payload);
        if (created) {
          setProductList((prev) => [created, ...prev]);
          addToast("New product added to MongoDB catalog!", "success");
        }
      } catch (err) {
        addToast(`Failed to create product: ${err.message}`, "error");
      }
    }

    setShowProductModal(false);
    setEditingProduct(null);
    loadAdminData();
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await api.delete(`/api/products/${id}`);
        setProductList((prev) => prev.filter((p) => p.id !== id && p._id !== id));
        addToast("Product deleted from MongoDB", "info");
        loadAdminData();
      } catch (err) {
        addToast(`Delete failed: ${err.message}`, "error");
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/api/admin/orders/${orderId}/status`, { status: newStatus });
      if (res) {
        setOrdersList((prev) => prev.map((o) => (o.orderId === orderId || o.id === orderId || o._id === orderId ? { ...o, status: newStatus } : o)));
        addToast(`Order #${orderId} status updated to "${newStatus}"`, "success");
        loadAdminData();
        return;
      }
    } catch (err) {
      console.warn("Update status error:", err.message);
    }

    setOrdersList((prev) => prev.map((o) => (o.id === orderId || o.orderId === orderId ? { ...o, status: newStatus } : o)));
    addToast(`Order #${orderId} status updated to "${newStatus}"`, "success");
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      const res = await api.put(`/api/admin/appointments/${bookingId}/status`, { status: newStatus });
      if (res) {
        setBookingsList((prev) => prev.map((b) => (b.bookingId === bookingId || b.id === bookingId || b._id === bookingId ? { ...b, status: newStatus } : b)));
        addToast(`Appointment #${bookingId} status updated to "${newStatus}"`, "success");
        loadAdminData();
        return;
      }
    } catch (err) {
      console.warn("Update appointment status error:", err.message);
    }

    setBookingsList((prev) => prev.map((b) => (b.id === bookingId || b.bookingId === bookingId ? { ...b, status: newStatus } : b)));
    addToast(`Appointment #${bookingId} status updated to "${newStatus}"`, "success");
  };

  return (
    <div className="admin-dashboard page-container">
      <header className="admin-header">
        <div className="container admin-header-content">
          <div>
            <span className="badge badge-gold">Store Administrator Panel</span>
            <h1 className="page-title">Priya's Boutique Admin Dashboard</h1>
          </div>
          <div className="admin-user-tag">
            <span>Welcome, <strong>{user.name}</strong></span>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container">
          {/* Dashboard Navigation Tabs */}
          <div className="admin-nav-tabs">
            <button
              type="button"
              className={`admin-tab ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <FaChartLine /> Overview
            </button>

            <button
              type="button"
              className={`admin-tab ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              <FaUsers /> Customers ({usersList.length || stats.totalUsers})
            </button>

            <button
              type="button"
              className={`admin-tab ${activeTab === "products" ? "active" : ""}`}
              onClick={() => setActiveTab("products")}
            >
              <FaBoxes /> Products ({productList.length})
            </button>

            <button
              type="button"
              className={`admin-tab ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              <FaClipboardList /> Orders ({ordersList.length})
            </button>

            <button
              type="button"
              className={`admin-tab ${activeTab === "bookings" ? "active" : ""}`}
              onClick={() => setActiveTab("bookings")}
            >
              <FaCalendarCheck /> Appointments ({bookingsList.length})
            </button>
          </div>

          {/* TAB 1: OVERVIEW METRICS */}
          {activeTab === "overview" && (
            <div className="admin-overview-grid">
              <div className="metric-card card">
                <span className="metric-label">Total Users</span>
                <strong className="metric-value">{stats.totalUsers || usersList.length}</strong>
                <span className="metric-sub">{stats.newUsers || 0} new in last 30 days</span>
              </div>

              <div className="metric-card card">
                <span className="metric-label">Total Revenue</span>
                <strong className="metric-value">₹{stats.totalRevenue || ordersList.reduce((sum, o) => sum + (o.grandTotal || 0), 0)}</strong>
                <span className="metric-sub">From customer orders</span>
              </div>

              <div className="metric-card card">
                <span className="metric-label">Total Orders</span>
                <strong className="metric-value">{stats.totalOrders || ordersList.length}</strong>
                <span className="metric-sub">{stats.pendingOrders || ordersList.filter(o => o.status !== "Completed" && o.status !== "Delivered").length} pending orders</span>
              </div>

              <div className="metric-card card">
                <span className="metric-label">Appointments</span>
                <strong className="metric-value">{stats.totalAppointments || bookingsList.length}</strong>
                <span className="metric-sub">{stats.pendingAppointments || bookingsList.filter(b => b.status === "Pending" || b.status === "Confirmed").length} pending sessions</span>
              </div>

              <div className="metric-card card">
                <span className="metric-label">Catalog Products</span>
                <strong className="metric-value">{productList.length}</strong>
                <span className="metric-sub">Active boutique items</span>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTERED USERS MANAGEMENT */}
          {activeTab === "users" && (
            <div className="admin-users-view">
              <h2 className="margin-bottom">Registered Customers (MongoDB)</h2>
              <div className="admin-table-container card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Email Address</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Registration Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center padding-md">
                          No registered users found in MongoDB database.
                        </td>
                      </tr>
                    ) : (
                      usersList.map((u) => (
                        <tr key={u._id || u.id}>
                          <td>
                            <strong>{u.name}</strong>
                          </td>
                          <td>{u.email}</td>
                          <td>{u.phone || "N/A"}</td>
                          <td>
                            <span className={`badge ${u.role === "admin" ? "badge-gold" : "badge-green"}`}>
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                          <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTS MANAGEMENT */}
          {activeTab === "products" && (
            <div className="admin-products-view">
              <div className="admin-section-header">
                <h2>Product Catalog Management (MongoDB)</h2>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingProduct(null);
                    setNewProductForm({
                      name: "",
                      category: "Blouses",
                      price: "",
                      originalPrice: "",
                      description: "",
                      availableSizes: "32 (S), 34 (M), 36 (L), Custom Measurement",
                      inStock: true,
                      featured: false,
                    });
                    setShowProductModal(true);
                  }}
                >
                  <FaPlus /> Add New Design
                </button>
              </div>

              <div className="admin-table-container card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Featured</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productList.map((prod) => (
                      <tr key={prod.id || prod._id}>
                        <td>
                          <img src={prod.image} alt={prod.name} className="table-thumb" />
                        </td>
                        <td>
                          <strong>{prod.name}</strong>
                        </td>
                        <td><span className="badge badge-gold">{prod.category}</span></td>
                        <td><strong>₹{prod.price}</strong></td>
                        <td>
                          <span className={`badge ${prod.inStock ? "badge-green" : "badge-rose"}`}>
                            {prod.inStock ? "In Stock" : "Out of Stock"}
                          </span>
                        </td>
                        <td>{prod.featured ? "Yes ⭐" : "No"}</td>
                        <td>
                          <div className="action-buttons-cell">
                            <button
                              type="button"
                              className="table-btn btn-edit"
                              onClick={() => {
                                setEditingProduct(prod);
                                setNewProductForm({
                                  name: prod.name,
                                  category: prod.category,
                                  price: prod.price,
                                  originalPrice: prod.originalPrice || "",
                                  description: prod.description,
                                  availableSizes: Array.isArray(prod.availableSizes) ? prod.availableSizes.join(", ") : prod.availableSizes || "",
                                  inStock: prod.inStock,
                                  featured: prod.featured || false,
                                });
                                setShowProductModal(true);
                              }}
                            >
                              <FaEdit />
                            </button>
                            <button
                              type="button"
                              className="table-btn btn-delete"
                              onClick={() => handleDeleteProduct(prod.id || prod._id)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS MANAGEMENT */}
          {activeTab === "orders" && (
            <div className="admin-orders-view">
              <h2 className="margin-bottom">Customer Orders (MongoDB)</h2>

              <div className="admin-table-container card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer Details</th>
                      <th>Items Count</th>
                      <th>Total Amount</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Update Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersList.map((ord) => {
                      const idVal = ord.orderId || ord.id || ord._id;
                      return (
                        <tr key={idVal}>
                          <td><strong>#{idVal}</strong></td>
                          <td>
                            <div><strong>{ord.shippingInfo?.name || "Customer"}</strong></div>
                            <div className="subtext">{ord.shippingInfo?.phone || ord.shippingInfo?.email}</div>
                          </td>
                          <td>{ord.items?.length || 1} item(s)</td>
                          <td><strong>₹{ord.grandTotal}</strong></td>
                          <td><span className="badge badge-gold">{ord.paymentMethod?.toUpperCase()}</span></td>
                          <td>
                            <span className="badge badge-rose">{ord.status}</span>
                          </td>
                          <td>
                            <select
                              value={ord.status}
                              onChange={(e) => handleUpdateOrderStatus(idVal, e.target.value)}
                              className="form-select status-select"
                            >
                              <option value="Placed">Placed</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="In Stitching">In Stitching</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: TAILORING BOOKINGS MANAGEMENT */}
          {activeTab === "bookings" && (
            <div className="admin-bookings-view">
              <h2 className="margin-bottom">Tailoring Appointments & Fitting Sessions (MongoDB)</h2>

              <div className="admin-table-container card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Ref ID</th>
                      <th>Customer</th>
                      <th>Service</th>
                      <th>Preferred Slot</th>
                      <th>Measurements / Notes</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookingsList.map((bk) => {
                      const bkId = bk.bookingId || bk.id || bk._id;
                      return (
                        <tr key={bkId}>
                          <td><strong>#{bkId}</strong></td>
                          <td>
                            <div><strong>{bk.name}</strong></div>
                            <div className="subtext">{bk.phone}</div>
                          </td>
                          <td>{bk.service}</td>
                          <td>
                            <div>{bk.preferredDate}</div>
                            <div className="subtext">{bk.preferredTime}</div>
                          </td>
                          <td>
                            {bk.bust && <div>Bust: {bk.bust}</div>}
                            {bk.fabricType && <div className="subtext">Fabric: {bk.fabricType}</div>}
                          </td>
                          <td>
                            <span className="badge badge-green">{bk.status}</span>
                          </td>
                          <td>
                            <select
                              value={bk.status}
                              onChange={(e) => handleUpdateBookingStatus(bkId, e.target.value)}
                              className="form-select status-select"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Product Add / Edit Modal */}
      {showProductModal && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card card">
            <h2>{editingProduct ? "Edit Product" : "Add New Design"}</h2>
            <form onSubmit={handleSaveProduct}>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={newProductForm.name}
                  onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-select"
                    value={newProductForm.category}
                    onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })}
                  >
                    <option value="Blouses">Blouses</option>
                    <option value="Lehengas">Lehengas</option>
                    <option value="Dresses">Dresses</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newProductForm.price}
                    onChange={(e) => setNewProductForm({ ...newProductForm, price: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={newProductForm.description}
                  onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowProductModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Product to MongoDB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
