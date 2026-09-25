import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Modal,
  Pagination,
  Row,
  Table,
  Badge,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { User, RegisterReq, UserUpdateReq } from "../model/User";
import type { Role } from "../model/Role";
import type { PagedResponse } from "../apis/pagedResponse";
import { UserService } from "../services/UserService";
import { UserRoleService } from "../services/UserRoleService";

interface UserWithRoles extends User {
  roles: Role[];
}

export default function UserPage() {
  const navigate = useNavigate();

  const initialRegisterForm: RegisterReq = {
    username: "",
    email: "",
    fullName: "",
    password: "",
  };

  const [pagination, setPagination] = useState<PagedResponse<User>>();
  const [usersWithRoles, setUsersWithRoles] = useState<UserWithRoles[]>([]);
  const [formData, setFormData] = useState<RegisterReq>(initialRegisterForm);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Edit User State
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserWithRoles | null>(null);
  const [editFormData, setEditFormData] = useState<UserUpdateReq>({
    fullName: "",
    email: "",
    isActive: 1,
  });

  const fetchUsers = async (page: number = 1, pageSize: number = 10) => {
    setLoading(true);
    try {
      const res = await UserService.getUsers(page, pageSize);
      setPagination(res.data);

      const users = res.data?.data || [];
      // Fetch assigned roles for each user
      const userRolePromises = users.map(async (u) => {
        try {
          const userRolesRes = await UserRoleService.getUserRoles(u.id);
          return {
            ...u,
            roles: userRolesRes.data?.roles || [],
          };
        } catch {
          return {
            ...u,
            roles: [],
          };
        }
      });

      const resolved = await Promise.all(userRolePromises);
      setUsersWithRoles(resolved);
    } catch (error) {
      console.error(error);
      toast.error(`${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, 10);
  }, []);

  const handleAdd = () => {
    setFormData(initialRegisterForm);
    setOpenModal(true);
  };

  const handleEdit = (user: UserWithRoles) => {
    setEditingUser(user);
    setEditFormData({
      fullName: user.fullName || "",
      email: user.email || "",
      isActive: user.isActive,
    });
    setEditModalOpen(true);
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | any>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: name === "isActive" ? parseInt(value) || 0 : value,
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);
    try {
      await UserService.updateUser(editingUser.id, editFormData);
      toast.success("User updated successfully!");
      setEditModalOpen(false);
      await fetchUsers(pagination?.pageNumber || 1, pagination?.pageSize || 10);
    } catch (error) {
      toast.error(`${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (userId: number) => {
    try {
      const res = await UserService.toggleStatus(userId);
      toast.success(res.message || "User status updated!");
      await fetchUsers(pagination?.pageNumber || 1, pagination?.pageSize || 10);
    } catch (error) {
      toast.error(`${error}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.password.trim()) {
      toast.warning("Username and password are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await UserService.register(formData);
      toast.success("User registered successfully!");
      setOpenModal(false);
      await fetchUsers(pagination?.pageNumber || 1, pagination?.pageSize || 10);
    } catch (error) {
      console.error(error);
      toast.error(`${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = usersWithRoles.filter(
    (u) =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.fullName && u.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container-fluid py-4" style={{ maxWidth: "1400px" }}>
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Users</h2>
          <p className="text-muted mb-0">
            Manage system users, login credentials, and assigned security roles.
          </p>
        </div>
        <Button
          variant="primary"
          className="px-4 py-2 rounded-3 shadow-sm d-flex align-items-center gap-2 fw-semibold"
          onClick={handleAdd}
        >
          <i className="bi bi-plus-lg"></i>
          <span>+ Add User</span>
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-3">
          <Row className="align-items-center">
            <Col md={6} lg={4}>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 rounded-start-3">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <Form.Control
                  type="text"
                  placeholder="Search user by name, username, or email..."
                  className="bg-light border-start-0 rounded-end-3"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Users Table */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-people fs-1 d-block mb-2"></i>
              No users found. Click "+ Add User" to register one.
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead className="table-light">
                  <tr className="text-secondary fw-bold" style={{ fontSize: "14px" }}>
                    <th className="px-4 py-3 text-nowrap">#</th>
                    <th className="py-3 text-nowrap">User Profile</th>
                    <th className="py-3 text-nowrap">Email</th>
                    <th className="py-3 text-nowrap">Assigned Role(s)</th>
                    <th className="py-3 text-nowrap">Status</th>
                    <th className="py-3 text-nowrap">Created Date</th>
                    <th className="px-4 py-3 text-start text-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, index) => {
                    const no =
                      ((pagination?.pageNumber || 1) - 1) *
                        (pagination?.pageSize || 10) +
                      index +
                      1;

                    return (
                      <tr key={u.id}>
                        {/* No */}
                        <td className="px-4 text-muted fw-semibold">{no}</td>

                        {/* Name & Avatar in 1 row */}
                        <td className="py-3 text-nowrap">
                          <div className="d-flex align-items-center gap-3">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm flex-shrink-0"
                              style={{
                                width: "38px",
                                height: "38px",
                                backgroundColor: "#4361ee",
                                fontSize: "14px",
                              }}
                            >
                              {(u.fullName || u.username).charAt(0).toUpperCase()}
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <span className="fw-bold text-dark">{u.fullName || u.username}</span>
                              <span className="text-muted small">@{u.username}</span>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="text-secondary">{u.email || "—"}</td>

                        {/* Roles */}
                        <td>
                          {u.roles && u.roles.length > 0 ? (
                            <div className="d-flex flex-wrap gap-1">
                              {u.roles.map((r) => (
                                <Badge
                                  key={r.id}
                                  bg="primary"
                                  className="bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-1 rounded-pill fw-semibold"
                                >
                                  {r.name}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted fst-italic small">No Role Assigned</span>
                          )}
                        </td>

                        {/* Status with Quick Toggle */}
                        <td>
                          <span
                            onClick={() => handleToggleStatus(u.id)}
                            style={{ cursor: "pointer" }}
                            title="Click to toggle Active / Inactive status"
                          >
                            {u.isActive === 1 ? (
                              <Badge
                                bg="success"
                                className="bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-1.5 rounded-pill fw-semibold"
                              >
                                <i className="fa-solid fa-circle-check me-1"></i>
                                Active
                              </Badge>
                            ) : (
                              <Badge
                                bg="danger"
                                className="bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-1.5 rounded-pill fw-semibold"
                              >
                                <i className="fa-solid fa-circle-xmark me-1"></i>
                                Inactive
                              </Badge>
                            )}
                          </span>
                        </td>

                        {/* Created Date in single row */}
                        <td className="text-muted small text-nowrap">
                          {u.createdAt
                            ? new Date(u.createdAt).toISOString().split("T")[0]
                            : "—"}
                        </td>

                        {/* Action Buttons on the left */}
                        <td className="px-4 text-start text-nowrap">
                          <div className="d-flex justify-content-start align-items-center gap-2">
                            <Button
                              type="button"
                              className="btn-action-edit d-inline-flex align-items-center gap-1.5 text-nowrap"
                              onClick={() => handleEdit(u)}
                              title="Edit User & Status"
                            >
                              <i className="fa-solid fa-pen-to-square"></i>
                              <span>Edit</span>
                            </Button>
                            <Button
                              variant="outline-success"
                              size="sm"
                              className="rounded-3 d-inline-flex align-items-center gap-1.5 px-3 py-1.5 text-nowrap fw-semibold"
                              onClick={() =>
                                u.roles && u.roles.length > 0
                                  ? navigate(`/permission?roleId=${u.roles[0].id}`)
                                  : navigate("/permission")
                              }
                              title="Manage Permissions"
                            >
                              <i className="fa-solid fa-shield-halved"></i>
                              <span>Permissions</span>
                            </Button>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="rounded-3 d-inline-flex align-items-center gap-1.5 px-3 py-1.5 text-nowrap fw-semibold"
                              onClick={() => navigate("/user-role")}
                              title="Manage User Roles"
                            >
                              <i className="fa-solid fa-user-gear"></i>
                              <span>Manage Roles</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="p-3 border-top d-flex justify-content-between align-items-center flex-wrap gap-2">
              <span className="text-muted small">
                Showing Page {pagination.pageNumber} of {pagination.totalPages} ({pagination.totalRecords} Total Users)
              </span>
              <Pagination className="mb-0">
                <Pagination.Prev
                  disabled={pagination.pageNumber === 1}
                  onClick={() => fetchUsers(pagination.pageNumber - 1, pagination.pageSize)}
                />
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <Pagination.Item
                    key={page}
                    active={page === pagination.pageNumber}
                    onClick={() => fetchUsers(page, pagination.pageSize)}
                  >
                    {page}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  disabled={pagination.pageNumber === pagination.totalPages}
                  onClick={() => fetchUsers(pagination.pageNumber + 1, pagination.pageSize)}
                />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal 1: Add User */}
      <Modal
        show={openModal}
        onHide={() => setOpenModal(false)}
        centered
        backdrop="static"
      >
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold">Register New User</Modal.Title>
          </Modal.Header>
          <Modal.Body className="py-4">
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Username *</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="e.g. kenzzy"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Full Name</Form.Label>
              <Form.Control
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Sokha Chan"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. user@example.com"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Password *</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button
              variant="light"
              className="rounded-3"
              onClick={() => setOpenModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="rounded-3 px-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="me-2" /> Saving...
                </>
              ) : (
                "Create User"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal 2: Edit User & Status */}
      <Modal
        show={editModalOpen}
        onHide={() => setEditModalOpen(false)}
        centered
        backdrop="static"
      >
        <Form onSubmit={handleEditSubmit}>
          <Modal.Header closeButton className="border-0 pb-0">
            <div>
              <Modal.Title className="fw-bold">
                Edit User: <span className="text-primary">@{editingUser?.username}</span>
              </Modal.Title>
              <p className="text-muted small mb-0">Update profile details and account active status</p>
            </div>
          </Modal.Header>
          <Modal.Body className="py-4">
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Username</Form.Label>
              <Form.Control
                type="text"
                value={editingUser?.username || ""}
                disabled
                readOnly
                className="bg-light fw-bold text-dark"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Full Name</Form.Label>
              <Form.Control
                type="text"
                name="fullName"
                value={editFormData.fullName || ""}
                onChange={handleEditChange}
                placeholder="e.g. Sokha Chan"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={editFormData.email || ""}
                onChange={handleEditChange}
                placeholder="e.g. user@example.com"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Account Status</Form.Label>
              <Form.Select
                name="isActive"
                value={editFormData.isActive}
                onChange={handleEditChange}
              >
                <option value={1}>Active (Can login & access system)</option>
                <option value={0}>Inactive (Disabled / Locked account)</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button
              variant="light"
              className="rounded-3"
              onClick={() => setEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="btn-add-new px-4 shadow-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="me-2" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
