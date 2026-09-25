import { useEffect, useState } from "react";
import type { SalaryRes, SalaryReq } from "../model/Salary";
import type { StaffRes } from "../model/Staff";
import type { PagedResponse } from "../apis/pagedResponse";
import { SalaryService } from "../services/SalaryService";
import { StaffService } from "../services/StaffService";
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
import { Link } from "react-router-dom";

export default function SalaryPage() {
  const emptySalary: SalaryReq = {
    staffId: 0,
    date: new Date().toISOString().split("T")[0],
    salaryAmount: 0,
    note: "",
  };

  const [pagination, setPagination] = useState<PagedResponse<SalaryRes>>();
  const [formData, setFormData] = useState<SalaryReq>(emptySalary);
  const [editingId, setEditingId] = useState<number>(0);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Reference Data
  const [staffList, setStaffList] = useState<StaffRes[]>([]);

  const getImageUrl = (photoPath?: string) => {
    if (!photoPath) return "";
    if (photoPath.startsWith("http://") || photoPath.startsWith("https://")) {
      return photoPath;
    }
    const cleanPath = photoPath.replace(/\\/g, "/");
    return `http://localhost:5000/${cleanPath.startsWith("/") ? cleanPath.slice(1) : cleanPath}`;
  };

  const fetchSalaries = async (page: number = 1, pageSize: number = 10) => {
    setLoading(true);
    try {
      const res = await SalaryService.getSalaries(page, pageSize);
      setPagination(res.data);
    } catch (error) {
      console.error("Failed to load salaries:", error);
      toast.error("Failed to load salary records.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffs = async () => {
    try {
      const res = await StaffService.getAllStaffs();
      setStaffList(res.data || []);
    } catch (error) {
      console.error("Failed to load staff list:", error);
    }
  };

  useEffect(() => {
    fetchSalaries();
    fetchStaffs();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(0);
    setFormData({
      ...emptySalary,
      date: new Date().toISOString().split("T")[0],
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (sal: SalaryRes) => {
    setEditingId(sal.id);
    setFormData({
      staffId: sal.staffId || 0,
      date: sal.date ? sal.date.split("T")[0] : new Date().toISOString().split("T")[0],
      salaryAmount: sal.salaryAmount || 0,
      note: sal.note || "",
    });
    setOpenModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.staffId || formData.staffId <= 0) {
      toast.warning("Please select a staff member.");
      return;
    }
    if (!formData.salaryAmount || formData.salaryAmount <= 0) {
      toast.warning("Please enter a valid salary amount.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId > 0) {
        await SalaryService.updateSalary(editingId, formData);
        toast.success("Salary updated successfully!");
      } else {
        await SalaryService.createSalary(formData);
        toast.success("Salary record created successfully!");
      }
      setOpenModal(false);
      fetchSalaries(pagination?.pageNumber || 1);
    } catch (error) {
      console.error("Error saving salary:", error);
      toast.error("Failed to save salary.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this salary record?")) return;
    try {
      await SalaryService.deleteSalary(id);
      toast.success("Salary deleted successfully!");
      fetchSalaries(pagination?.pageNumber || 1);
    } catch (error) {
      console.error("Error deleting salary:", error);
      toast.error("Failed to delete salary record.");
    }
  };

  const salaries = pagination?.data || [];
  const filteredSalaries = salaries.filter((s) => {
    const staffName = s.staff?.name?.toLowerCase() || "";
    const staffNameKh = s.staff?.nameKh?.toLowerCase() || "";
    const note = s.note?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return staffName.includes(search) || staffNameKh.includes(search) || note.includes(search);
  });

  // Calculate KPI stats
  const totalBudget = salaries.reduce((acc, curr) => acc + (curr.salaryAmount || 0), 0);
  const avgSalary = salaries.length > 0 ? totalBudget / salaries.length : 0;
  const maxSalary = salaries.length > 0 ? Math.max(...salaries.map((s) => s.salaryAmount || 0)) : 0;

  return (
    <div className="container-fluid py-4 px-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: "#0f172a" }}>
            <i className="fa-solid fa-money-bill-wave text-success me-2"></i> Base Salaries
          </h3>
          <p className="text-muted mb-0">Manage staff base salary contracts and wage definitions</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Link
            to="/payslip"
            className="btn btn-outline-primary d-flex align-items-center gap-2 px-3 py-2 rounded-3 fw-semibold text-decoration-none"
          >
            <i className="fa-solid fa-file-invoice-dollar"></i> Generate Payslips
          </Link>
          <Button
            variant="success"
            onClick={handleOpenAdd}
            className="d-flex align-items-center gap-2 px-3 py-2 shadow-sm rounded-3 fw-semibold text-white"
          >
            <i className="fa-solid fa-plus"></i> Set Staff Salary
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <Row className="g-3 mb-4">
        <Col sm={6} lg={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="d-flex align-items-center gap-3 p-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-4"
                style={{ width: "52px", height: "52px", background: "#f0fdf4", color: "#16a34a", fontSize: "22px" }}
              >
                <i className="fa-solid fa-vault"></i>
              </div>
              <div>
                <span className="text-muted small fw-semibold">TOTAL MONTHLY BUDGET</span>
                <h4 className="fw-bold mb-0 text-success">${totalBudget.toLocaleString()}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={6} lg={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="d-flex align-items-center gap-3 p-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-4"
                style={{ width: "52px", height: "52px", background: "#eff6ff", color: "#2563eb", fontSize: "22px" }}
              >
                <i className="fa-solid fa-calculator"></i>
              </div>
              <div>
                <span className="text-muted small fw-semibold">AVERAGE SALARY</span>
                <h4 className="fw-bold mb-0 text-primary">${avgSalary.toFixed(2)}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={6} lg={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="d-flex align-items-center gap-3 p-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-4"
                style={{ width: "52px", height: "52px", background: "#faf5ff", color: "#9333ea", fontSize: "22px" }}
              >
                <i className="fa-solid fa-award"></i>
              </div>
              <div>
                <span className="text-muted small fw-semibold">HIGHEST BASE WAGE</span>
                <h4 className="fw-bold mb-0 text-dark">${maxSalary.toLocaleString()}</h4>
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
                placeholder="Search by staff name or note..."
                className="bg-light border-start-0 ps-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0 text-nowrap">
              <thead className="bg-light text-secondary text-uppercase" style={{ fontSize: "12px", letterSpacing: "0.5px" }}>
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Position</th>
                  <th className="py-3 px-4">Base Salary</th>
                  <th className="py-3 px-4">Effective Date</th>
                  <th className="py-3 px-4" style={{ minWidth: "200px" }}>Note</th>
                  <th className="py-3 px-4 text-end" style={{ minWidth: "120px", width: "120px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      <Spinner animation="border" variant="success" />
                      <div className="text-muted mt-2 small">Loading salary records...</div>
                    </td>
                  </tr>
                ) : filteredSalaries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      <i className="fa-solid fa-receipt fs-2 mb-2 d-block text-secondary"></i>
                      No salary records found.
                    </td>
                  </tr>
                ) : (
                  filteredSalaries.map((sal) => (
                    <tr key={sal.id}>
                      {/* Staff Member */}
                      <td className="px-4">
                        <div className="d-flex align-items-center gap-3">
                          {sal.staff?.photo ? (
                            <img
                              src={getImageUrl(sal.staff.photo)}
                              alt={sal.staff.name}
                              className="rounded-circle object-fit-cover shadow-sm border"
                              style={{ width: "40px", height: "40px" }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://ui-avatars.com/api/?name=" + encodeURIComponent(sal.staff?.name || "S") + "&background=16a34a&color=fff";
                              }}
                            />
                          ) : (
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                              style={{
                                width: "40px",
                                height: "40px",
                                background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                                fontSize: "14px",
                              }}
                            >
                              {sal.staff?.name?.charAt(0).toUpperCase() || "S"}
                            </div>
                          )}
                          <div>
                            <div className="fw-bold text-dark">{sal.staff?.name || `Staff #${sal.staffId}`}</div>
                            {sal.staff?.nameKh && <div className="small text-muted">{sal.staff.nameKh}</div>}
                          </div>
                        </div>
                      </td>

                      {/* Position */}
                      <td className="px-4">
                        {sal.staff?.position ? (
                          <Badge bg="light" className="text-dark border px-2.5 py-1.5 rounded-pill fw-medium">
                            {sal.staff.position.positionName}
                          </Badge>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>

                      {/* Base Salary */}
                      <td className="px-4">
                        <span className="fw-bold text-success fs-6">
                          ${(sal.salaryAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 text-muted small">
                        {sal.date ? sal.date.split("T")[0] : "—"}
                      </td>

                      {/* Note */}
                      <td className="px-4 text-muted small" style={{ minWidth: "200px", maxWidth: "280px" }}>
                        <div className="text-truncate" style={{ maxWidth: "260px" }} title={sal.note || ""}>
                          {sal.note || "—"}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 text-end text-nowrap" style={{ minWidth: "120px", width: "120px" }}>
                        <div className="d-inline-flex gap-2">
                          <Button
                            variant="light"
                            size="sm"
                            className="rounded-3 text-primary border-0"
                            onClick={() => handleOpenEdit(sal)}
                            title="Edit Salary"
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </Button>
                          <Button
                            variant="light"
                            size="sm"
                            className="rounded-3 text-danger border-0"
                            onClick={() => handleDelete(sal.id)}
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
                onClick={() => fetchSalaries(pagination.pageNumber - 1)}
              />
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <Pagination.Item
                  key={page}
                  active={page === pagination.pageNumber}
                  onClick={() => fetchSalaries(page)}
                >
                  {page}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={pagination.pageNumber === pagination.totalPages}
                onClick={() => fetchSalaries(pagination.pageNumber + 1)}
              />
            </Pagination>
          </Card.Footer>
        )}
      </Card>

      {/* Add / Edit Salary Modal */}
      <Modal show={openModal} onHide={() => setOpenModal(false)} centered backdrop="static">
        <Modal.Header closeButton className="border-bottom-0 pb-0">
          <Modal.Title className="fw-bold fs-5">
            <i className={`fa-solid ${editingId > 0 ? "fa-pen-to-square text-warning" : "fa-plus text-success"} me-2`}></i>
            {editingId > 0 ? "Edit Staff Base Salary" : "Set Staff Base Salary"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="pt-3">
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Staff Member *</Form.Label>
              <Form.Select
                value={formData.staffId || 0}
                onChange={(e) => setFormData({ ...formData, staffId: Number(e.target.value) })}
                required
              >
                <option value={0}>-- Select Staff Member --</option>
                {staffList.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} {st.nameKh ? `(${st.nameKh})` : ""} - {st.position?.positionName || "No Position"}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Base Salary Amount (USD) *</Form.Label>
              <InputGroup>
                <InputGroup.Text className="bg-light fw-bold text-success">$</InputGroup.Text>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 500.00"
                  value={formData.salaryAmount || ""}
                  onChange={(e) => setFormData({ ...formData, salaryAmount: Number(e.target.value) })}
                  required
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Effective Date</Form.Label>
              <Form.Control
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Note / Remarks</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="e.g. Initial probation base salary or annual raise..."
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-top-0 pt-0">
            <Button variant="light" onClick={() => setOpenModal(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="success" type="submit" disabled={isSubmitting} className="text-white">
              {isSubmitting ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" /> Saving...
                </>
              ) : editingId > 0 ? (
                "Update Salary"
              ) : (
                "Save Salary"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
