import { useEffect, useState } from "react";
import type { Position, PositionReq } from "../model/Position";
import type { PagedResponse } from "../apis/pagedResponse";
import { PositionService } from "../services/PositionService";
import { toast } from "react-toastify";
import {
  Button,
  Form,
  Modal,
  Pagination,
  Table,
  Card,
  Badge,
  Row,
  Col,
  InputGroup,
  Spinner,
} from "react-bootstrap";

export default function PositionPage() {
  const emptyPosition: PositionReq = {
    positionName: "",
    positionNameKH: "",
    status: "Active",
  };

  const [pagination, setPagination] = useState<PagedResponse<Position>>();
  const [formData, setFormData] = useState<PositionReq>(emptyPosition);
  const [editingId, setEditingId] = useState<number>(0);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const fetchPositions = async (page: number = 1, pageSize: number = 10) => {
    setLoading(true);
    try {
      const res = await PositionService.getPositions(page, pageSize);
      setPagination(res.data);
    } catch (error) {
      console.error("Error fetching positions:", error);
      toast.error("Failed to load positions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(0);
    setFormData(emptyPosition);
    setOpenModal(true);
  };

  const handleOpenEdit = (pos: Position) => {
    setEditingId(pos.id);
    setFormData({
      positionName: pos.positionName,
      positionNameKH: pos.positionNameKh || "",
      status: pos.status || "Active",
    });
    setOpenModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.positionName.trim()) {
      toast.warning("Position name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId > 0) {
        await PositionService.updatePosition(editingId, formData);
        toast.success("Position updated successfully!");
      } else {
        await PositionService.createPosition(formData);
        toast.success("Position created successfully!");
      }
      setOpenModal(false);
      fetchPositions(pagination?.pageNumber || 1);
    } catch (error) {
      console.error("Error saving position:", error);
      toast.error("Failed to save position.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this position?")) return;
    try {
      await PositionService.deletePosition(id);
      toast.success("Position deleted successfully!");
      fetchPositions(pagination?.pageNumber || 1);
    } catch (error) {
      console.error("Error deleting position:", error);
      toast.error("Failed to delete position. It might be assigned to staff members.");
    }
  };

  const filteredPositions = (pagination?.data || []).filter((item) => {
    const matchSearch =
      item.positionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.positionNameKh && item.positionNameKh.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = statusFilter === "All" || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="container-fluid py-4 px-4">
      {/* Page Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: "#0f172a" }}>
            <i className="fa-solid fa-briefcase text-primary me-2"></i> Positions Management
          </h3>
          <p className="text-muted mb-0">Manage job positions and roles within the property management</p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenAdd}
          className="d-flex align-items-center gap-2 px-3 py-2 shadow-sm rounded-3 fw-semibold"
        >
          <i className="fa-solid fa-plus"></i> Add New Position
        </Button>
      </div>

      {/* KPI Cards */}
      <Row className="g-3 mb-4">
        <Col md={6} lg={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="d-flex align-items-center gap-3 p-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-4"
                style={{ width: "52px", height: "52px", background: "#eff6ff", color: "#2563eb", fontSize: "22px" }}
              >
                <i className="fa-solid fa-layer-group"></i>
              </div>
              <div>
                <span className="text-muted small fw-semibold">TOTAL POSITIONS</span>
                <h4 className="fw-bold mb-0 text-dark">{pagination?.totalRecords || 0}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="d-flex align-items-center gap-3 p-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-4"
                style={{ width: "52px", height: "52px", background: "#f0fdf4", color: "#16a34a", fontSize: "22px" }}
              >
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <div>
                <span className="text-muted small fw-semibold">ACTIVE POSITIONS</span>
                <h4 className="fw-bold mb-0 text-dark">
                  {(pagination?.data || []).filter((p) => p.status === "Active").length}
                </h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Table Card */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <Card.Header className="bg-white py-3 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: "450px" }}>
            <InputGroup>
              <InputGroup.Text className="bg-light border-end-0 text-muted">
                <i className="fa-solid fa-magnifying-glass"></i>
              </InputGroup.Text>
              <Form.Control
                placeholder="Search position by English or Khmer name..."
                className="bg-light border-start-0 ps-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-light border-0 rounded-3 shadow-none"
              style={{ width: "160px" }}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Form.Select>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0 text-nowrap">
              <thead className="bg-light text-secondary text-uppercase" style={{ fontSize: "12px", letterSpacing: "0.5px" }}>
                <tr>
                  <th className="py-3 px-4"># ID</th>
                  <th className="py-3 px-4">Position Name (EN)</th>
                  <th className="py-3 px-4">Position Name (KH)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                      <div className="text-muted mt-2 small">Loading positions...</div>
                    </td>
                  </tr>
                ) : filteredPositions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-muted">
                      <i className="fa-solid fa-inbox fs-2 mb-2 d-block text-secondary"></i>
                      No positions found.
                    </td>
                  </tr>
                ) : (
                  filteredPositions.map((pos) => (
                    <tr key={pos.id}>
                      <td className="px-4 fw-semibold text-secondary">#{pos.id}</td>
                      <td className="px-4">
                        <span className="fw-bold text-dark">{pos.positionName}</span>
                      </td>
                      <td className="px-4 text-muted">{pos.positionNameKh || "—"}</td>
                      <td className="px-4">
                        <Badge
                          bg={pos.status === "Active" ? "success" : "secondary"}
                          className="px-2.5 py-1.5 rounded-pill fw-medium"
                        >
                          {pos.status || "Active"}
                        </Badge>
                      </td>
                      <td className="px-4 text-end">
                        <div className="d-inline-flex gap-2">
                          <Button
                            variant="light"
                            size="sm"
                            className="rounded-3 text-primary border-0"
                            onClick={() => handleOpenEdit(pos)}
                            title="Edit"
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </Button>
                          <Button
                            variant="light"
                            size="sm"
                            className="rounded-3 text-danger border-0"
                            onClick={() => handleDelete(pos.id)}
                            title="Delete"
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

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <Card.Footer className="bg-white border-top py-3 d-flex justify-content-between align-items-center">
            <span className="text-muted small">
              Showing page {pagination.pageNumber} of {pagination.totalPages} ({pagination.totalRecords} total records)
            </span>
            <Pagination className="mb-0">
              <Pagination.Prev
                disabled={pagination.pageNumber === 1}
                onClick={() => fetchPositions(pagination.pageNumber - 1)}
              />
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <Pagination.Item
                  key={page}
                  active={page === pagination.pageNumber}
                  onClick={() => fetchPositions(page)}
                >
                  {page}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={pagination.pageNumber === pagination.totalPages}
                onClick={() => fetchPositions(pagination.pageNumber + 1)}
              />
            </Pagination>
          </Card.Footer>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal show={openModal} onHide={() => setOpenModal(false)} centered backdrop="static">
        <Modal.Header closeButton className="border-bottom-0 pb-0">
          <Modal.Title className="fw-bold fs-5">
            <i className={`fa-solid ${editingId > 0 ? "fa-pen-to-square text-warning" : "fa-plus text-primary"} me-2`}></i>
            {editingId > 0 ? "Edit Position" : "Create New Position"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="pt-3">
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Position Name (English) *</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Property Manager"
                value={formData.positionName}
                onChange={(e) => setFormData({ ...formData, positionName: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Position Name (Khmer)</Form.Label>
              <Form.Control
                type="text"
                placeholder="ឧ. អ្នកគ្រប់គ្រងអគារ"
                value={formData.positionNameKH}
                onChange={(e) => setFormData({ ...formData, positionNameKH: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Status</Form.Label>
              <Form.Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-top-0 pt-0">
            <Button variant="light" onClick={() => setOpenModal(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" /> Saving...
                </>
              ) : editingId > 0 ? (
                "Update Position"
              ) : (
                "Save Position"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
