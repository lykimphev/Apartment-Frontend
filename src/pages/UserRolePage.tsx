import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Col,
  Form,
  Modal,
  Row,
  Table,
  Badge,
  Spinner,
} from "react-bootstrap";
import { toast } from "react-toastify";
import type { User } from "../model/User";
import type { Role } from "../model/Role";
import { UserService } from "../services/UserService";
import { RoleService } from "../services/RoleService";
import { UserRoleService } from "../services/UserRoleService";

interface UserWithRoles extends User {
  assignedRoles: Role[];
}

export default function UserRolePage() {
  const navigate = useNavigate();
  const [usersWithRoles, setUsersWithRoles] = useState<UserWithRoles[]>([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch all users and all roles concurrently
      const [usersRes, rolesRes] = await Promise.all([
        UserService.getAllUsers(),
        RoleService.getRoles(),
      ]);

      const users = usersRes.data || [];
      const roles = rolesRes.data || [];
      setAllRoles(roles);

      // 2. Fetch assigned roles for each user
      const userRolePromises = users.map(async (user) => {
        try {
          const userRolesRes = await UserRoleService.getUserRoles(user.id);
          return {
            ...user,
            assignedRoles: userRolesRes.data?.roles || [],
          };
        } catch {
          return {
            ...user,
            assignedRoles: [],
          };
        }
      });

      const combined = await Promise.all(userRolePromises);
      setUsersWithRoles(combined);
    } catch (error) {
      console.error(error);
      toast.error(`${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAssignModal = (user: UserWithRoles) => {
    setSelectedUser(user);
    setSelectedRoleIds(user.assignedRoles.map((r) => r.id));
    setOpenModal(true);
  };

  const handleToggleRole = (roleId: number) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSaveRoles = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      const currentRoleIds = selectedUser.assignedRoles.map((r) => r.id);

      // Calculate roles to add and roles to remove
      const toAdd = selectedRoleIds.filter((id) => !currentRoleIds.includes(id));
      const toRemove = currentRoleIds.filter((id) => !selectedRoleIds.includes(id));

      if (toAdd.length > 0) {
        await UserRoleService.assignRoles({
          userId: selectedUser.id,
          roleIds: toAdd,
        });
      }

      if (toRemove.length > 0) {
        await UserRoleService.removeRoles({
          userId: selectedUser.id,
          roleIds: toRemove,
        });
      }

      toast.success(`Roles updated for ${selectedUser.username}!`);
      setOpenModal(false);
      await fetchData();
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
      (u.fullName && u.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container-fluid px-0">
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-4">
          <Row className="align-items-center justify-content-between g-3 mb-4">
            <Col xs={12} md={6}>
              <h3 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                <i className="fa-solid fa-user-gear text-primary"></i>
                User Role
              </h3>
              <p className="text-muted mb-0 small">
                Assign and manage security roles and permissions for system users.
              </p>
            </Col>
            <Col xs={12} md={6} className="d-flex justify-content-md-end gap-2">
              <Button
                variant="outline-secondary"
                onClick={() => navigate(-1)}
                className="px-3 py-2 rounded-3 d-flex align-items-center gap-2 fw-medium"
                title="Go Back"
              >
                <i className="fa-solid fa-arrow-left"></i>
                Back
              </Button>
              <Button
                variant="outline-primary"
                onClick={fetchData}
                disabled={loading}
                className="px-3 py-2 rounded-3 d-flex align-items-center gap-2 fw-medium"
              >
                <i className="fa-solid fa-arrows-rotate"></i>
                Refresh
              </Button>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={12} md={4}>
              <Form.Control
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-3"
              />
            </Col>
          </Row>

          <div className="table-responsive rounded-3 border">
            <Table hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="py-3 px-3 text-secondary">#</th>
                  <th className="py-3 px-3 text-secondary">User</th>
                  <th className="py-3 px-3 text-secondary">Email</th>
                  <th className="py-3 px-3 text-secondary">Assigned Roles</th>
                  <th className="py-3 px-3 text-secondary text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-muted">
                      <Spinner animation="border" size="sm" variant="primary" className="me-2" />
                      Loading user roles...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-muted">
                      <i className="fa-regular fa-user-circle fs-2 d-block mb-2 text-secondary opacity-50"></i>
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <tr key={user.id}>
                      <td className="px-3 fw-bold text-secondary">{index + 1}</td>
                      <td className="px-3">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold"
                            style={{ width: "32px", height: "32px", fontSize: "14px" }}
                          >
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-semibold text-dark">{user.username}</div>
                            {user.fullName && (
                              <small className="text-muted">{user.fullName}</small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 text-muted">{user.email || "—"}</td>
                      <td className="px-3">
                        {user.assignedRoles && user.assignedRoles.length > 0 ? (
                          <div className="d-flex flex-wrap gap-1">
                            {user.assignedRoles.map((role) => (
                              <Badge
                                key={role.id}
                                bg="primary"
                                className="px-2 py-1 rounded-pill fw-normal"
                              >
                                {role.name}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted small fst-italic">No roles assigned</span>
                        )}
                      </td>
                      <td className="px-3 text-end">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleOpenAssignModal(user)}
                          className="rounded-2 px-3 py-1 fw-medium"
                        >
                          <i className="fa-solid fa-pen-to-square me-1"></i>
                          Manage Roles
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Assign Roles Modal */}
      <Modal show={openModal} onHide={() => setOpenModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5">
            Manage Roles for <span className="text-primary">{selectedUser?.username}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          <p className="text-muted small mb-3">
            Select the roles you want to assign to this user:
          </p>

          {allRoles.length === 0 ? (
            <div className="text-center py-3 text-muted">No roles available in the system.</div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {allRoles.map((role) => {
                const isChecked = selectedRoleIds.includes(role.id);
                return (
                  <div
                    key={role.id}
                    onClick={() => handleToggleRole(role.id)}
                    className={`p-3 rounded-3 border d-flex align-items-center justify-content-between cursor-pointer transition ${
                      isChecked ? "border-primary bg-primary bg-opacity-10" : "border-light bg-light"
                    }`}
                    style={{ cursor: "pointer" }}
                  >
                    <div>
                      <div className="fw-semibold text-dark">{role.name}</div>
                      {role.description && (
                        <small className="text-muted d-block">{role.description}</small>
                      )}
                    </div>
                    <Form.Check
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // Handled by parent div
                      className="fs-5"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button
            variant="light"
            onClick={() => setOpenModal(false)}
            className="rounded-3 px-3"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveRoles}
            disabled={isSubmitting}
            className="rounded-3 px-4"
          >
            {isSubmitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                Saving...
              </>
            ) : (
              "Save Role Assignments"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
