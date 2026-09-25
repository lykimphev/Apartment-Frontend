import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Modal,
  Row,
  Table,
  Badge,
} from "react-bootstrap";
import { toast } from "react-toastify";
import type { Role, RoleReq } from "../model/Role";
import { RoleService } from "../services/RoleService";

export default function RolePage() {
  const initialForm: RoleReq = {
    name: "",
    description: "",
    isActive: 1,
  };

  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState<RoleReq>(initialForm);
  const [roleId, setRoleId] = useState<number>(0);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await RoleService.getRoles();
      setRoles(res.data || []);
    } catch (error) {
      console.error(error);
      toast.error(`${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleAdd = () => {
    setFormData(initialForm);
    setRoleId(0);
    setOpenModal(true);
  };

  const handleEdit = (role: Role) => {
    setFormData({
      name: role.name,
      description: role.description || "",
      isActive: role.isActive,
    });
    setRoleId(role.id);
    setOpenModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      try {
        await RoleService.deleteRole(id);
        toast.success("Role deleted successfully!");
        await fetchRoles();
      } catch (error) {
        console.error(error);
        toast.error(`${error}`);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked ? 1 : 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "isActive" ? Number(value) : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.warning("Role name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (roleId > 0) {
        await RoleService.updateRole(roleId, formData);
        toast.success("Role updated successfully!");
      } else {
        await RoleService.createRole(formData);
        toast.success("New role created successfully!");
      }
      setOpenModal(false);
      await fetchRoles();
    } catch (error) {
      console.error(error);
      toast.error(`${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRoles = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container-fluid px-0">
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-4">
          <Row className="align-items-center justify-content-between g-3 mb-4">
            <Col xs={12} md={6}>
              <h3 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                <i className="fa-solid fa-shield-halved text-primary"></i>
                Roles
              </h3>
              <p className="text-muted mb-0 small">
                Manage system roles, descriptions, and active statuses.
              </p>
            </Col>
            <Col xs={12} md={6} className="d-flex justify-content-md-end gap-2">
              <Button
                variant="primary"
                onClick={handleAdd}
                className="px-4 py-2 rounded-3 d-flex align-items-center gap-2 fw-medium shadow-sm"
              >
                <i className="fa-solid fa-plus"></i>
                Add New Role
              </Button>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={12} md={4}>
              <Form.Control
                type="text"
                placeholder="Search roles..."
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
                  <th className="py-3 px-3 text-secondary">Role Name</th>
                  <th className="py-3 px-3 text-secondary">Description</th>
                  <th className="py-3 px-3 text-secondary text-center">Status</th>
                  <th className="py-3 px-3 text-secondary text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-muted">
                      <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                      Loading roles...
                    </td>
                  </tr>
                ) : filteredRoles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-muted">
                      <i className="fa-regular fa-folder-open fs-2 d-block mb-2 text-secondary opacity-50"></i>
                      No roles found.
                    </td>
                  </tr>
                ) : (
                  filteredRoles.map((role, index) => (
                    <tr key={role.id}>
                      <td className="px-3 fw-bold text-secondary">{index + 1}</td>
                      <td className="px-3 fw-semibold text-dark">{role.name}</td>
                      <td className="px-3 text-muted">{role.description || "—"}</td>
                      <td className="px-3 text-center">
                        {role.isActive === 1 ? (
                          <Badge bg="success" className="px-2 py-1 rounded-pill fw-normal">
                            Active
                          </Badge>
                        ) : (
                          <Badge bg="danger" className="px-2 py-1 rounded-pill fw-normal">
                            Inactive
                          </Badge>
                        )}
                      </td>
                      <td className="px-3 text-end">
                        <div className="d-flex justify-content-end gap-1">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEdit(role)}
                            className="rounded-2 px-2 py-1"
                            title="Edit Role"
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(role.id)}
                            className="rounded-2 px-2 py-1"
                            title="Delete Role"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Add / Edit Modal */}
      <Modal show={openModal} onHide={() => setOpenModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5">
            {roleId > 0 ? "Edit Role" : "Create New Role"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="pt-3">
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">
                Role Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Admin, Manager, Staff"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                placeholder="Describe role responsibilities..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="role-active-switch"
                label="Is Active"
                name="isActive"
                checked={formData.isActive === 1}
                onChange={handleChange}
                className="fw-semibold small"
              />
            </Form.Group>
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
              type="submit"
              disabled={isSubmitting}
              className="rounded-3 px-4"
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status" />
                  Saving...
                </>
              ) : roleId > 0 ? (
                "Update Role"
              ) : (
                "Save Role"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
