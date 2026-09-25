import { useEffect, useState } from "react";
import type { PaySlipRes, PaySlipReq } from "../model/PaySlip";
import type { StaffRes } from "../model/Staff";
import type { PagedResponse } from "../apis/pagedResponse";
import { PaySlipService } from "../services/PaySlipService";
import { StaffService } from "../services/StaffService";
import { SalaryService } from "../services/SalaryService";
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

export default function PaySlipPage() {
  const emptyPaySlip: PaySlipReq = {
    staffId: 0,
    date: new Date().toISOString().split("T")[0],
    salary: 0,
    bonus: 0,
    penalty: 0,
    vat: 0,
    note: "",
  };

  const [pagination, setPagination] = useState<PagedResponse<PaySlipRes>>();
  const [formData, setFormData] = useState<PaySlipReq>(emptyPaySlip);
  const [editingId, setEditingId] = useState<number>(0);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openSlipModal, setOpenSlipModal] = useState<boolean>(false);
  const [selectedSlip, setSelectedSlip] = useState<PaySlipRes | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loadingBaseSalary, setLoadingBaseSalary] = useState<boolean>(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<number>(0);

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

  const fetchPaySlips = async (page: number = 1, pageSize: number = 10) => {
    setLoading(true);
    try {
      const res = await PaySlipService.getPaySlips(page, pageSize);
      setPagination(res.data);
    } catch (error) {
      console.error("Failed to load payslips:", error);
      toast.error("Failed to load payslip records.");
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
    fetchPaySlips();
    fetchStaffs();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(0);
    setFormData({
      ...emptyPaySlip,
      date: new Date().toISOString().split("T")[0],
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (slip: PaySlipRes) => {
    setEditingId(slip.id);
    setFormData({
      staffId: slip.staffId || 0,
      date: slip.date ? slip.date.split("T")[0] : new Date().toISOString().split("T")[0],
      salary: slip.salary || 0,
      bonus: slip.bonus || 0,
      penalty: slip.penalty || 0,
      vat: slip.vat || 0,
      note: slip.note || "",
    });
    setOpenModal(true);
  };

  const handleStaffChange = async (staffId: number) => {
    setFormData((prev) => ({ ...prev, staffId }));
    if (staffId > 0 && editingId === 0) {
      // Auto-fetch base salary from SalaryService
      setLoadingBaseSalary(true);
      try {
        const res = await SalaryService.getSalaryByStaffId(staffId);
        if (res.data && res.data.salaryAmount) {
          setFormData((prev) => ({
            ...prev,
            salary: res.data.salaryAmount || 0,
          }));
          toast.info(`Auto-loaded base salary: $${res.data.salaryAmount.toLocaleString()}`);
        } else {
          setFormData((prev) => ({ ...prev, salary: 0 }));
        }
      } catch (err) {
        console.warn("No base salary record found for staff", staffId);
        // keep as is
      } finally {
        setLoadingBaseSalary(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.staffId || formData.staffId <= 0) {
      toast.warning("Please select a staff member.");
      return;
    }
    if (formData.salary === undefined || formData.salary < 0) {
      toast.warning("Please enter a valid base salary.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId > 0) {
        await PaySlipService.updatePaySlip(editingId, formData);
        toast.success("Payslip updated successfully!");
      } else {
        await PaySlipService.createPaySlip(formData);
        toast.success("Payslip generated successfully!");
      }
      setOpenModal(false);
      fetchPaySlips(pagination?.pageNumber || 1);
    } catch (error) {
      console.error("Error saving payslip:", error);
      toast.error("Failed to save payslip.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this payslip record?")) return;
    try {
      await PaySlipService.deletePaySlip(id);
      toast.success("Payslip deleted successfully!");
      fetchPaySlips(pagination?.pageNumber || 1);
    } catch (error) {
      console.error("Error deleting payslip:", error);
      toast.error("Failed to delete payslip record.");
    }
  };

  const handleViewSlip = (slip: PaySlipRes) => {
    setSelectedSlip(slip);
    setOpenSlipModal(true);
  };

  const handlePrintSlip = () => {
    window.print();
  };

  const payslips = pagination?.data || [];
  const filteredPaySlips = payslips.filter((p) => {
    const staffName = p.staff?.name?.toLowerCase() || "";
    const staffNameKh = p.staff?.nameKh?.toLowerCase() || "";
    const note = p.note?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    const matchesSearch = staffName.includes(search) || staffNameKh.includes(search) || note.includes(search);
    const matchesStaff = selectedStaffFilter === 0 || p.staffId === selectedStaffFilter;

    return matchesSearch && matchesStaff;
  });

  // Calculate KPI Summary
  const totalPayroll = payslips.reduce((sum, p) => sum + (p.totalSalary || 0), 0);
  const totalBonus = payslips.reduce((sum, p) => sum + (p.bonus || 0), 0);
  const totalPenalty = payslips.reduce((sum, p) => sum + (p.penalty || 0), 0);
  const totalVat = payslips.reduce((sum, p) => sum + (p.vat || 0), 0);

  // Live calculation in form
  const liveNetSalary =
    (Number(formData.salary) || 0) +
    (Number(formData.bonus) || 0) -
    (Number(formData.penalty) || 0) -
    (Number(formData.vat) || 0);

  return (
    <div className="container-fluid py-4 px-4">
      {/* Print Stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-payslip-area, #printable-payslip-area * {
            visibility: visible;
          }
          #printable-payslip-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            background: #fff;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3 no-print">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: "#0f172a" }}>
            <i className="fa-solid fa-file-invoice-dollar text-primary me-2"></i> Staff Monthly Payslips
          </h3>
          <p className="text-muted mb-0">Manage staff monthly payroll disbursements, bonuses, penalties & VAT deductions</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Link
            to="/salary"
            className="btn btn-outline-secondary d-flex align-items-center gap-2 px-3 py-2 rounded-3 fw-semibold text-decoration-none"
          >
            <i className="fa-solid fa-money-bill-wave text-success"></i> Base Salaries
          </Link>
          <Button
            variant="primary"
            onClick={handleOpenAdd}
            className="d-flex align-items-center gap-2 px-3 py-2 shadow-sm rounded-3 fw-semibold text-white"
          >
            <i className="fa-solid fa-plus"></i> Generate Payslip
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <Row className="g-3 mb-4 no-print">
        <Col sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="d-flex align-items-center gap-3 p-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-4"
                style={{ width: "52px", height: "52px", background: "#eff6ff", color: "#2563eb", fontSize: "22px" }}
              >
                <i className="fa-solid fa-sack-dollar"></i>
              </div>
              <div>
                <span className="text-muted small fw-semibold">TOTAL NET PAYROLL</span>
                <h4 className="fw-bold mb-0 text-primary">${totalPayroll.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="d-flex align-items-center gap-3 p-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-4"
                style={{ width: "52px", height: "52px", background: "#f0fdf4", color: "#16a34a", fontSize: "22px" }}
              >
                <i className="fa-solid fa-gift"></i>
              </div>
              <div>
                <span className="text-muted small fw-semibold">TOTAL BONUSES</span>
                <h4 className="fw-bold mb-0 text-success">+${totalBonus.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="d-flex align-items-center gap-3 p-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-4"
                style={{ width: "52px", height: "52px", background: "#fef2f2", color: "#dc2626", fontSize: "22px" }}
              >
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <div>
                <span className="text-muted small fw-semibold">TOTAL PENALTIES</span>
                <h4 className="fw-bold mb-0 text-danger">-${totalPenalty.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="d-flex align-items-center gap-3 p-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-4"
                style={{ width: "52px", height: "52px", background: "#fffbeb", color: "#d97706", fontSize: "22px" }}
              >
                <i className="fa-solid fa-receipt"></i>
              </div>
              <div>
                <span className="text-muted small fw-semibold">TOTAL VAT / TAX</span>
                <h4 className="fw-bold mb-0 text-warning">-${totalVat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Table Card */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden no-print">
        <Card.Header className="bg-white py-3 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex flex-wrap align-items-center gap-2 flex-grow-1" style={{ maxWidth: "600px" }}>
            {/* Search Box */}
            <InputGroup style={{ maxWidth: "320px" }}>
              <InputGroup.Text className="bg-light border-end-0 text-muted">
                <i className="fa-solid fa-magnifying-glass"></i>
              </InputGroup.Text>
              <Form.Control
                placeholder="Search staff name or note..."
                className="bg-light border-start-0 ps-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            {/* Staff Filter */}
            <Form.Select
              style={{ maxWidth: "220px" }}
              className="bg-light"
              value={selectedStaffFilter}
              onChange={(e) => setSelectedStaffFilter(Number(e.target.value))}
            >
              <option value={0}>All Staff Members</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Form.Select>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0 text-nowrap">
              <thead className="bg-light text-secondary text-uppercase" style={{ fontSize: "12px", letterSpacing: "0.5px" }}>
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Pay Date</th>
                  <th className="py-3 px-4">Base Salary</th>
                  <th className="py-3 px-4">Bonus (+)</th>
                  <th className="py-3 px-4">Penalty (-)</th>
                  <th className="py-3 px-4">VAT (-)</th>
                  <th className="py-3 px-4">Net Total</th>
                  <th className="py-3 px-4" style={{ minWidth: "200px" }}>Note</th>
                  <th className="py-3 px-4 text-end" style={{ minWidth: "140px", width: "140px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                      <div className="text-muted mt-2 small">Loading payslips...</div>
                    </td>
                  </tr>
                ) : filteredPaySlips.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-5 text-muted">
                      <i className="fa-solid fa-file-invoice fs-2 mb-2 d-block text-secondary"></i>
                      No payslips found.
                    </td>
                  </tr>
                ) : (
                  filteredPaySlips.map((p) => (
                    <tr key={p.id}>
                      {/* Staff Member */}
                      <td className="px-4">
                        <div className="d-flex align-items-center gap-3">
                          {p.staff?.photo ? (
                            <img
                              src={getImageUrl(p.staff.photo)}
                              alt={p.staff.name}
                              className="rounded-circle object-fit-cover shadow-sm border"
                              style={{ width: "40px", height: "40px" }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://ui-avatars.com/api/?name=" + encodeURIComponent(p.staff?.name || "S") + "&background=2563eb&color=fff";
                              }}
                            />
                          ) : (
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                              style={{
                                width: "40px",
                                height: "40px",
                                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                                fontSize: "14px",
                              }}
                            >
                              {p.staff?.name?.charAt(0).toUpperCase() || "S"}
                            </div>
                          )}
                          <div>
                            <div className="fw-bold text-dark">{p.staff?.name || `Staff #${p.staffId}`}</div>
                            {p.staff?.position && (
                              <div className="small text-muted">{p.staff.position.positionName}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Pay Date */}
                      <td className="px-4 text-muted small">
                        {p.date ? p.date.split("T")[0] : "—"}
                      </td>

                      {/* Base Salary */}
                      <td className="px-4 fw-semibold text-secondary">
                        ${(p.salary || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      {/* Bonus */}
                      <td className="px-4">
                        {p.bonus && p.bonus > 0 ? (
                          <span className="text-success fw-semibold">
                            +${p.bonus.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-muted small">$0.00</span>
                        )}
                      </td>

                      {/* Penalty */}
                      <td className="px-4">
                        {p.penalty && p.penalty > 0 ? (
                          <span className="text-danger fw-semibold">
                            -${p.penalty.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-muted small">$0.00</span>
                        )}
                      </td>

                      {/* VAT */}
                      <td className="px-4">
                        {p.vat && p.vat > 0 ? (
                          <span className="text-warning fw-semibold">
                            -${p.vat.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-muted small">$0.00</span>
                        )}
                      </td>

                      {/* Net Total Salary */}
                      <td className="px-4">
                        <Badge
                          bg="primary"
                          className="px-2.5 py-1.5 fs-6 fw-bold rounded-3 shadow-xs"
                          style={{ background: "#2563eb" }}
                        >
                          ${(p.totalSalary || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Badge>
                      </td>

                      {/* Note */}
                      <td className="px-4 text-muted small" style={{ minWidth: "200px", maxWidth: "280px" }}>
                        <div className="text-truncate" style={{ maxWidth: "260px" }} title={p.note || ""}>
                          {p.note || "—"}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 text-end text-nowrap" style={{ minWidth: "140px", width: "140px" }}>
                        <div className="d-inline-flex gap-2">
                          <Button
                            variant="light"
                            size="sm"
                            className="rounded-3 text-info border-0"
                            onClick={() => handleViewSlip(p)}
                            title="Print / View Payslip Voucher"
                          >
                            <i className="fa-solid fa-receipt"></i>
                          </Button>
                          <Button
                            variant="light"
                            size="sm"
                            className="rounded-3 text-primary border-0"
                            onClick={() => handleOpenEdit(p)}
                            title="Edit Payslip"
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </Button>
                          <Button
                            variant="light"
                            size="sm"
                            className="rounded-3 text-danger border-0"
                            onClick={() => handleDelete(p.id)}
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
                onClick={() => fetchPaySlips(pagination.pageNumber - 1)}
              />
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <Pagination.Item
                  key={page}
                  active={page === pagination.pageNumber}
                  onClick={() => fetchPaySlips(page)}
                >
                  {page}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={pagination.pageNumber === pagination.totalPages}
                onClick={() => fetchPaySlips(pagination.pageNumber + 1)}
              />
            </Pagination>
          </Card.Footer>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* Add / Edit Payslip Modal                                                  */}
      {/* ========================================================================= */}
      <Modal show={openModal} onHide={() => setOpenModal(false)} size="lg" centered backdrop="static">
        <Modal.Header closeButton className="border-bottom-0 pb-0">
          <Modal.Title className="fw-bold fs-5">
            <i className={`fa-solid ${editingId > 0 ? "fa-pen-to-square text-warning" : "fa-plus text-primary"} me-2`}></i>
            {editingId > 0 ? "Edit Staff Payslip" : "Generate Staff Monthly Payslip"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="pt-3">
            <Row className="g-3">
              {/* Staff Selector */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">
                    Staff Member *{" "}
                    {loadingBaseSalary && <Spinner size="sm" animation="border" variant="primary" className="ms-1" />}
                  </Form.Label>
                  <Form.Select
                    value={formData.staffId || 0}
                    onChange={(e) => handleStaffChange(Number(e.target.value))}
                    required
                  >
                    <option value={0}>-- Select Staff Member --</option>
                    {staffList.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} {st.nameKh ? `(${st.nameKh})` : ""} - {st.position?.positionName || "No Position"}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Selecting a staff member will auto-populate their contract base salary.
                  </Form.Text>
                </Form.Group>
              </Col>

              {/* Payment Date */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Disbursement Date *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>

              {/* Base Salary */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Base Salary (USD) *</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light fw-bold text-secondary">$</InputGroup.Text>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g. 500.00"
                      value={formData.salary || ""}
                      onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                      required
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              {/* Bonus */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Bonus / Incentives (USD)</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light fw-bold text-success">+</InputGroup.Text>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.bonus || ""}
                      onChange={(e) => setFormData({ ...formData, bonus: Number(e.target.value) })}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              {/* Penalty */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Penalties / Deductions (USD)</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light fw-bold text-danger">-</InputGroup.Text>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.penalty || ""}
                      onChange={(e) => setFormData({ ...formData, penalty: Number(e.target.value) })}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              {/* VAT */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">VAT / Withholding Tax (USD)</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light fw-bold text-warning">-</InputGroup.Text>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.vat || ""}
                      onChange={(e) => setFormData({ ...formData, vat: Number(e.target.value) })}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              {/* Live Net Calculation Preview */}
              <Col xs={12}>
                <div
                  className="p-3 rounded-4 d-flex justify-content-between align-items-center"
                  style={{ background: "#f8fafc", border: "1.5px dashed #cbd5e1" }}
                >
                  <div>
                    <span className="fw-semibold text-dark">Estimated Net Payable Salary:</span>
                    <div className="small text-muted">
                      Base (${formData.salary || 0}) + Bonus (${formData.bonus || 0}) - Penalty (${formData.penalty || 0}) - VAT (${formData.vat || 0})
                    </div>
                  </div>
                  <div className="fs-4 fw-bold text-primary">
                    ${liveNetSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </Col>

              {/* Remarks */}
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Remarks / Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="e.g. Performance bonus included, late penalty deducted..."
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-top-0 pt-0">
            <Button variant="light" onClick={() => setOpenModal(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting} className="text-white">
              {isSubmitting ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" /> Saving...
                </>
              ) : editingId > 0 ? (
                "Update Payslip"
              ) : (
                "Save & Issue Payslip"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ========================================================================= */}
      {/* Printable Payslip Voucher Modal                                          */}
      {/* ========================================================================= */}
      <Modal show={openSlipModal} onHide={() => setOpenSlipModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-bottom-0 pb-0 no-print">
          <Modal.Title className="fw-bold fs-5">
            <i className="fa-solid fa-receipt text-primary me-2"></i> Employee Payslip Voucher
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4" id="printable-payslip-area">
          {selectedSlip && (
            <div className="border p-4 rounded-4 shadow-sm bg-white" style={{ borderColor: "#e2e8f0" }}>
              {/* Receipt Header */}
              <div className="d-flex justify-content-between align-items-start border-bottom pb-4 mb-4">
                <div>
                  <h4 className="fw-bold mb-1" style={{ color: "#0f172a" }}>
                    APARTMENT MANAGEMENT SYSTEM
                  </h4>
                  <p className="text-muted small mb-0">Official Employee Salary Voucher</p>
                  <p className="text-muted small mb-0">Phnom Penh, Cambodia</p>
                </div>
                <div className="text-end">
                  <Badge bg="light" className="text-dark border px-3 py-2 fs-6 rounded-pill fw-bold mb-1">
                    VOUCHER #{selectedSlip.id.toString().padStart(5, "0")}
                  </Badge>
                  <div className="text-muted small">
                    Date: <strong>{selectedSlip.date ? selectedSlip.date.split("T")[0] : "—"}</strong>
                  </div>
                </div>
              </div>

              {/* Employee Information */}
              <div className="row g-3 mb-4 bg-light p-3 rounded-3">
                <div className="col-sm-6">
                  <div className="text-muted small">Employee Name:</div>
                  <div className="fw-bold fs-6 text-dark">
                    {selectedSlip.staff?.name} {selectedSlip.staff?.nameKh ? `(${selectedSlip.staff.nameKh})` : ""}
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="text-muted small">Designation / Position:</div>
                  <div className="fw-bold fs-6 text-primary">
                    {selectedSlip.staff?.position?.positionName || "Staff"}
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="text-muted small">Staff Phone:</div>
                  <div className="fw-semibold text-secondary">
                    {selectedSlip.staff?.phone || "—"}
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="text-muted small">Gender / Status:</div>
                  <div className="fw-semibold text-secondary">
                    {selectedSlip.staff?.sex || "—"} / {selectedSlip.staff?.status || "Active"}
                  </div>
                </div>
              </div>

              {/* Breakdown Table */}
              <table className="table table-bordered mb-4">
                <thead className="table-light">
                  <tr>
                    <th>Description</th>
                    <th className="text-end" style={{ width: "200px" }}>Amount (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Basic Salary Contract</td>
                    <td className="text-end fw-semibold">
                      ${(selectedSlip.salary || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-success">
                      <i className="fa-solid fa-plus me-2"></i> Performance / Special Bonus
                    </td>
                    <td className="text-end text-success fw-semibold">
                      +${(selectedSlip.bonus || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-danger">
                      <i className="fa-solid fa-minus me-2"></i> Penalties / Disciplinary Deductions
                    </td>
                    <td className="text-end text-danger fw-semibold">
                      -${(selectedSlip.penalty || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-warning">
                      <i className="fa-solid fa-minus me-2"></i> VAT / Withholding Tax
                    </td>
                    <td className="text-end text-warning fw-semibold">
                      -${(selectedSlip.vat || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr className="table-light">
                    <td className="fw-bold fs-6">NET SALARY PAYABLE</td>
                    <td className="text-end fw-bold fs-5 text-primary">
                      ${(selectedSlip.totalSalary || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Note */}
              {selectedSlip.note && (
                <div className="mb-4 p-3 bg-light rounded-3 small">
                  <strong>Remarks:</strong> {selectedSlip.note}
                </div>
              )}

              {/* Signatures */}
              <div className="row mt-5 pt-3 text-center">
                <div className="col-4">
                  <div className="border-bottom mx-auto mb-2" style={{ width: "120px", height: "40px" }}></div>
                  <div className="small fw-bold">Prepared By</div>
                  <div className="text-muted" style={{ fontSize: "11px" }}>HR / Accountant</div>
                </div>
                <div className="col-4">
                  <div className="border-bottom mx-auto mb-2" style={{ width: "120px", height: "40px" }}></div>
                  <div className="small fw-bold">Approved By</div>
                  <div className="text-muted" style={{ fontSize: "11px" }}>General Manager</div>
                </div>
                <div className="col-4">
                  <div className="border-bottom mx-auto mb-2" style={{ width: "120px", height: "40px" }}></div>
                  <div className="small fw-bold">Employee Signature</div>
                  <div className="text-muted" style={{ fontSize: "11px" }}>Acknowledged & Received</div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top-0 pt-0 no-print">
          <Button variant="light" onClick={() => setOpenSlipModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handlePrintSlip} className="d-flex align-items-center gap-2">
            <i className="fa-solid fa-print"></i> Print Payslip Voucher
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
