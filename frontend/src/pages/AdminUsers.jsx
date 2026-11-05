
import { useEffect, useState } from "react";
import api from "../services/api";
import "./AdminUsers.css";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadUsers = async () => {
    try {
      setError("");
      const response = await api.get("/admin/users");
      setUsers(response.data.users || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load registered users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleStatusChange = async (user) => {
    const nextStatus = !user.isActive;

    setUpdatingId(user._id);
    setError("");
    setSuccess("");

    try {
      const response = await api.patch(
        `/admin/users/${user._id}/status`,
        { isActive: nextStatus }
      );

      const updatedUser = response.data.user;

      setUsers((previous) =>
        previous.map((item) =>
          item._id === updatedUser._id ? updatedUser : item
        )
      );

      setSuccess(response.data.message);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update account status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchText = search.toLowerCase();

    return (
      user.name?.toLowerCase().includes(searchText) ||
      user.email?.toLowerCase().includes(searchText) ||
      user.role?.toLowerCase().includes(searchText)
    );
  });

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString();
  };

  return (
    <main className="admin-users-page">
      <div className="admin-users-container">
        <header className="admin-users-header">
          <div>
            <span className="admin-eyebrow">ADMINISTRATION</span>
            <h1>User Management</h1>
            <p>View registered accounts and manage their access.</p>
          </div>

          <div className="admin-user-total">
            <strong>{users.length}</strong>
            <span>Registered Accounts</span>
          </div>
        </header>

        {error && (
          <div className="admin-message admin-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="admin-message admin-success" role="status">
            {success}
          </div>
        )}

        <section className="admin-users-card">
          <div className="admin-users-toolbar">
            <h2>All Accounts</h2>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email or role..."
              aria-label="Search users"
            />
          </div>

          {loading ? (
            <p className="admin-empty">Loading accounts...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="admin-empty">
              {users.length === 0
                ? "No registered accounts found."
                : "No accounts match your search."}
            </p>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td data-label="Name">{user.name}</td>
                      <td data-label="Email">{user.email}</td>
                      <td data-label="Role">
                        <span className={`admin-role role-${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td data-label="Joined">
                        {formatDate(user.createdAt)}
                      </td>
                      <td data-label="Status">
                        <span
                          className={`admin-status ${
                            user.isActive ? "active" : "inactive"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td data-label="Action">
                        <button
                          className={`admin-status-button ${
                            user.isActive ? "deactivate" : "activate"
                          }`}
                          onClick={() => handleStatusChange(user)}
                          disabled={updatingId === user._id}
                        >
                          {updatingId === user._id
                            ? "Updating..."
                            : user.isActive
                            ? "Deactivate"
                            : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default AdminUsers;
