import { useEffect, useState, useRef } from "react";
import type { StaffRes, StaffReq } from "../model/Staff";
import type { Position } from "../model/Position";
import type { PagedResponse } from "../apis/pagedResponse";
import { StaffService } from "../services/StaffService";
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
import { Link } from "react-router-dom";

export default function StaffPage() {
  const emptyStaff: StaffReq = {
    positionId: 0,
    name: "",
    nameKh: "",
    sex: "Male",
    dob: "",
    phone: "",
    address: "",
    email: "",
    identityNo: "",
    status: "Active",
    photo: null,
  };

  const [pagination, setPagination] = useState<PagedResponse<StaffRes>>();
  const [formData, setFormData] = useState<StaffReq>(emptyStaff);
  const [editingId, setEditingId] = useState<number>(0);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openViewModal, setOpenViewModal] = useState<boolean>(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffRes | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [positionFilter, setPositionFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Reference Data
  const [positions, setPositions] = useState<Position[]>([]);

  // Photo preview state
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getImageUrl = (photoPath?: string) => {
    if (!photoPath) return "";
    if (photoPath.startsWith("http://") || photoPath.startsWith("https://")) {
      return photoPath;
    }
    const cleanPath = photoPath.replace(/\\/g, "/");
    return `http://localhost:5000/${cleanPath.startsWith("/") ? cleanPath.slice(1) : cleanPath}`;
  };

  const fetchStaffs = async (page: number = 1, pageSize: number = 10) => {
    setLoading(true);
    try {
      const res = await StaffService.getStaffs(page, pageSize);
      setPagination(res.data);
    } catch (error) {
      console.error("Failed to load staff:", error);
      toast.error("Failed to load staff members.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPositions = async () => {
    try {
      const res = await PositionService.getAllPositions();
      setPositions(res.data || []);
    } catch (error) {
      console.error("Failed to load positions:", error);
    }
  };

  useEffect(() => {
    fetchStaffs();
    fetchPositions();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(0);
    setFormData(emptyStaff);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setOpenModal(true);
  };

  const handleOpenEdit = (staff: StaffRes) => {
    setEditingId(staff.id);
    setFormData({
      positionId: staff.positionId || 0,
      name: staff.name,
      nameKh: staff.nameKh || "",
      sex: staff.sex || "Male",
      dob: staff.dob ? staff.dob.split("T")[0] : "",
      phone: staff.phone || "",
      address: staff.address || "",
      email: staff.email || "",
      identityNo: staff.identityNo || "",
      status: staff.status || "Active",
      photo: null,
    });
    setPhotoPreview(staff.photo ? getImageUrl(staff.photo) : null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setOpenModal(true);
  };

  const handleOpenView = (staff: StaffRes) => {
    setSelectedStaff(staff);
    setOpenViewModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate format
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid image file (JPG, PNG, WEBP).");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size cannot exceed 5MB.");
        return;
      }
      setFormData({ ...formData, photo: file });
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemovePhoto = () => {
    setFormData({ ...formData, photo: null });
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.warning("Staff name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId > 0) {
        await StaffService.updateStaff(editingId, formData);
        toast.success("Staff member updated successfully!");
      } else {
        await StaffService.createStaff(formData);
        toast.success("Staff member added successfully!");
      }
      setOpenModal(false);
      fetchStaffs(pagination?.pageNumber || 1);
    } catch (error) {
      console.error("Error saving staff:", error);
      toast.error("Failed to save staff member.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete staff "${name}"?`)) return;
    try {
      await StaffService.deleteStaff(id);
      toast.success("Staff member deleted successfully!");
      fetchStaffs(pagination?.pageNumber || 1);
    } catch (error) {
      console.error("Error deleting staff:", error);
      toast.error("Failed to delete staff member.");
    }
  };

  // Filtered List
  const staffList = pagination?.data || [];
  const filteredStaffs = staffList.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.nameKh && item.nameKh.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.phone && item.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.identityNo && item.identityNo.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchPosition =
      positionFilter === "All" || (item.positionId && item.positionId.toString() === positionFilter);

    const matchStatus = statusFilter === "All" || item.status === statusFilter;

    return matchSearch && matchPosition && matchStatus;
  });

  // Calculate quick stats
  const totalStaffCount = pagination?.totalRecords || staffList.length;
  const activeStaffCount = staffList.filter((s) => s.status === "Active").length;
  const maleCount = staffList.filter((s) => s.sex === "Male").length;
  const femaleCount = staffList.filter((s) => s.sex === "Female").length;

  return (
    <div className="container-fluid py-4 px-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: "#0f172a" }}>
            <i className="fa-solid fa-users-gear text-primary me-2"></i> Staff Management
          </h3>
          <p className="text-muted mb-0">Manage employees, employee profiles, and department positions</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Link
            to="/position"
            className="btn btn-outline-secondary d-flex align-items-center gap-2 px-3 py-2 rounded-3 fw-semibold text-decoration-none"
          >
            <i className="fa-solid fa-briefcase"></i> Positions
          </Link>
          <Button
            variant="primary"
            onClick={handleOpenAdd}
            className="d-flex align-items-center gap-2 px-3 py-2 shadow-sm rounded-3 fw-semibold"
          >
            <i className="fa-solid fa-user-plus"></i> Add New Staff
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <Row className="g-3 mb-4">
        <Col sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="d-flex align-items-center gap-3 p-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-4"
                style={{ width: "52px", height: "52px", background: "#eff6ff", color: "#2563eb", fontSize: "22px" }}
              >
                <i className="fa-solid fa-users"></i>
              </div>
              <div>
                <span className="text-muted small fw-semibold">TOTAL EMPLOYEES</span>
                <h4 className="fw-bold mb-0 text-dark">{totalStaffCount}</h4>
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
                <i className="fa-solid fa-user-check"></i>
              </div>
              <div>
                <span className="text-muted small fw-semibold">ACTIVE STAFF</span>
                <h4 className="fw-bold mb-0 text-dark">{activeStaffCount}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="d-flex align-items-center gap-3 p-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-4"
                style={{ width: "52px", height: "52px", background: "#fdf2f8", color: "#db2777", fontSize: "22px" }}
              >
                <i className="fa-solid fa-venus-mars"></i>
              </div>
              <div>
                <span className="text-muted small fw-semibold">GENDER BREAKDOWN</span>
                <h6 className="fw-bold mb-0 text-dark">
                  <span className="text-primary">{maleCount} M</span> / <span className="text-danger">{femaleCount} F</span>
                </h6>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="d-flex align-items-center gap-3 p-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-4"
                style={{ width: "52px", height: "52px", background: "#faf5ff", color: "#9333ea", fontSize: "22px" }}
              >
                <i className="fa-solid fa-briefcase"></i>
              </div>
              <div>
                <span className="text-muted small fw-semibold">POSITIONS</span>
                <h4 className="fw-bold mb-0 text-dark">{positions.length}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Table Card */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <Card.Header className="bg-white py-3 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-3">
          {/* Search Box */}
          <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: "450px" }}>
            <InputGroup>
              <InputGroup.Text className="bg-light border-end-0 text-muted">
                <i className="fa-solid fa-magnifying-glass"></i>
              </InputGroup.Text>
              <Form.Control
                placeholder="Search by name, phone, email, ID..."
                className="bg-light border-start-0 ps-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>

          {/* Filters */}
          <div className="d-flex flex-wrap align-items-center gap-2">
            <Form.Select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="bg-light border-0 rounded-3 shadow-none"
              style={{ width: "170px" }}
            >
              <option value="All">All Positions</option>
              {positions.map((p) => (
                <option key={p.id} value={p.id.toString()}>
                  {p.positionName}
                </option>
              ))}
            </Form.Select>

            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-light border-0 rounded-3 shadow-none"
              style={{ width: "140px" }}
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
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Position</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Gender</th>
                  <th className="py-3 px-4">Identity No</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                      <div className="text-muted mt-2 small">Loading staff records...</div>
                    </td>
                  </tr>
                ) : filteredStaffs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-muted">
                      <i className="fa-solid fa-user-slash fs-2 mb-2 d-block text-secondary"></i>
                      No staff members found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredStaffs.map((staff) => (
                    <tr key={staff.id}>
                      {/* Photo & Name */}
                      <td className="px-4">
                        <div className="d-flex align-items-center gap-3">
                          {staff.photo ? (
                            <img
                              src={getImageUrl(staff.photo)}
                              alt={staff.name}
                              className="rounded-circle object-fit-cover shadow-sm border"
                              style={{ width: "44px", height: "44px" }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://ui-avatars.com/api/?name=" + encodeURIComponent(staff.name) + "&background=2563eb&color=fff";
                              }}
                            />
                          ) : (
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                              style={{
                                width: "44px",
                                height: "44px",
                                background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                                fontSize: "15px",
                              }}
                            >
                              {staff.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="fw-bold text-dark">{staff.name}</div>
                            {staff.nameKh && <div className="small text-muted">{staff.nameKh}</div>}
                          </div>
                        </div>
                      </td>

                      {/* Position */}
                      <td className="px-4 text-nowrap">
                        {staff.position ? (
                          <span
                            className="d-inline-flex align-items-center px-3 py-1 rounded-pill fw-semibold text-nowrap"
                            style={{
                              backgroundColor: "#e0e7ff",
                              color: "#3730a3",
                              border: "1px solid #c7d2fe",
                              fontSize: "12.5px",
                            }}
                          >
                            <i className="fa-solid fa-briefcase me-1.5" style={{ fontSize: "11px", color: "#4f46e5" }}></i>
                            {staff.position.positionName}
                          </span>
                        ) : (
                          <span className="text-muted small">— None —</span>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="px-4">
                        <div className="small text-dark fw-medium">
                          {staff.phone ? (
                            <span>
                              <i className="fa-solid fa-phone text-muted me-1.5"></i> {staff.phone}
                            </span>
                          ) : (
                            <span className="text-muted">No phone</span>
                          )}
                        </div>
                        {staff.email && (
                          <div className="small text-muted">
                            <i className="fa-solid fa-envelope me-1.5"></i> {staff.email}
                          </div>
                        )}
                      </td>

                      {/* Gender - Uniform Border Size & Same Width */}
                      <td className="px-4 text-nowrap">
                        <span
                          className="d-inline-flex align-items-center justify-content-center rounded-pill fw-semibold"
                          style={
                            staff.sex === "Female"
                              ? {
                                  width: "88px",
                                  padding: "4px 0",
                                  backgroundColor: "#fdf2f8",
                                  color: "#9d174d",
                                  border: "1px solid #fbcfe8",
                                  fontSize: "12px",
                                }
                              : {
                                  width: "88px",
                                  padding: "4px 0",
                                  backgroundColor: "#eff6ff",
                                  color: "#1e40af",
                                  border: "1px solid #bfdbfe",
                                  fontSize: "12px",
                                }
                          }
                        >
                          <i
                            className={`fa-solid ${
                              staff.sex === "Female" ? "fa-venus text-danger" : "fa-mars text-primary"
                            } me-1.5`}
                            style={{ fontSize: "11px" }}
                          ></i>
                          {staff.sex || "Male"}
                        </span>
                      </td>

                      {/* Identity */}
                      <td className="px-4">
                        <span className="small text-muted font-monospace">{staff.identityNo || "—"}</span>
                      </td>

                      {/* Status - Uniform Border Size & Same Width */}
                      <td className="px-4 text-nowrap">
                        <span
                          className="d-inline-flex align-items-center justify-content-center rounded-pill fw-semibold"
                          style={{
                            width: "85px",
                            padding: "4px 0",
                            fontSize: "12px",
                            backgroundColor: staff.status === "Active" ? "#ecfdf5" : "#f1f5f9",
                            color: staff.status === "Active" ? "#047857" : "#475569",
                            border: `1px solid ${staff.status === "Active" ? "#a7f3d0" : "#cbd5e1"}`,
                          }}
                        >
                          <i
                            className={`fa-solid ${staff.status === "Active" ? "fa-circle-check" : "fa-circle-pause"} me-1.5`}
                            style={{ fontSize: "10.5px" }}
                          ></i>
                          {staff.status || "Active"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 text-end">
                        <div className="d-inline-flex gap-2">
                          <Button
                            variant="light"
                            size="sm"
                            className="rounded-3 text-info border-0"
                            onClick={() => handleOpenView(staff)}
                            title="View Details"
                          >
                            <i className="fa-solid fa-eye"></i>
                          </Button>
                          <Button
                            variant="light"
                            size="sm"
                            className="rounded-3 text-primary border-0"
                            onClick={() => handleOpenEdit(staff)}
                            title="Edit"
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </Button>
                          <Button
                            variant="light"
                            size="sm"
                            className="rounded-3 text-danger border-0"
                            onClick={() => handleDelete(staff.id, staff.name)}
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
                onClick={() => fetchStaffs(pagination.pageNumber - 1)}
              />
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <Pagination.Item
                  key={page}
                  active={page === pagination.pageNumber}
                  onClick={() => fetchStaffs(page)}
                >
                  {page}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={pagination.pageNumber === pagination.totalPages}
                onClick={() => fetchStaffs(pagination.pageNumber + 1)}
              />
            </Pagination>
          </Card.Footer>
        )}
      </Card>

      {/* Add / Edit Staff Modal */}
      <Modal show={openModal} onHide={() => setOpenModal(false)} size="lg" centered backdrop="static">
        <Modal.Header closeButton className="border-bottom-0 pb-0">
          <Modal.Title className="fw-bold fs-5">
            <i className={`fa-solid ${editingId > 0 ? "fa-user-pen text-warning" : "fa-user-plus text-primary"} me-2`}></i>
            {editingId > 0 ? "Edit Staff Member" : "Add New Staff Member"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="pt-3">
            {/* Photo Upload Section */}
            <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-4 mb-4">
              <div className="position-relative">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="rounded-circle object-fit-cover border shadow-sm"
                    style={{ width: "76px", height: "76px" }}
                  />
                ) : (
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center bg-white border text-muted shadow-sm"
                    style={{ width: "76px", height: "76px", fontSize: "28px" }}
                  >
                    <i className="fa-solid fa-user"></i>
                  </div>
                )}
              </div>
              <div className="flex-grow-1">
                <div className="fw-semibold text-dark mb-1">Staff Photo</div>
                <div className="text-muted small mb-2">Upload a formal photo (JPG, PNG, WEBP - Max 5MB)</div>
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="rounded-3"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <i className="fa-solid fa-upload me-1"></i> Choose Photo
                  </Button>
                  {photoPreview && (
                    <Button variant="outline-danger" size="sm" className="rounded-3" onClick={handleRemovePhoto}>
                      <i className="fa-solid fa-trash me-1"></i> Remove
                    </Button>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: "none" }}
                  />
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <Row className="g-3">
              {/* Names */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Full Name (English) *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Full Name (Khmer)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="ឧ. ចន ដូ"
                    value={formData.nameKh}
                    onChange={(e) => setFormData({ ...formData, nameKh: e.target.value })}
                  />
                </Form.Group>
              </Col>

              {/* Position & Gender */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Position / Job Role</Form.Label>
                  <Form.Select
                    value={formData.positionId || 0}
                    onChange={(e) => setFormData({ ...formData, positionId: Number(e.target.value) })}
                  >
                    <option value={0}>-- Select Position --</option>
                    {positions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.positionName} {p.positionNameKh ? `(${p.positionNameKh})` : ""}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Gender</Form.Label>
                  <Form.Select
                    value={formData.sex}
                    onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* DOB & Phone */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Date of Birth</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="e.g. 012 345 678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </Form.Group>
              </Col>

              {/* Email & Identity No */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="e.g. staff@apartment.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Identity / Passport No</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. ID-12345678"
                    value={formData.identityNo}
                    onChange={(e) => setFormData({ ...formData, identityNo: e.target.value })}
                  />
                </Form.Group>
              </Col>

              {/* Address */}
              <Col md={8}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Address</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Phnom Penh, Cambodia"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </Form.Group>
              </Col>

              {/* Status */}
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Status</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
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
                "Update Staff"
              ) : (
                "Save Staff"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* View Staff Profile Modal */}
      <Modal show={openViewModal} onHide={() => setOpenViewModal(false)} centered>
        <Modal.Header closeButton className="border-bottom-0 pb-0">
          <Modal.Title className="fw-bold fs-5">
            <i className="fa-solid fa-id-card text-primary me-2"></i> Staff Profile Card
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center pt-2 pb-4">
          {selectedStaff && (
            <div>
              {/* Avatar */}
              <div className="mb-3">
                {selectedStaff.photo ? (
                  <img
                    src={getImageUrl(selectedStaff.photo)}
                    alt={selectedStaff.name}
                    className="rounded-circle object-fit-cover shadow border border-3 border-white"
                    style={{ width: "100px", height: "100px" }}
                  />
                ) : (
                  <div
                    className="rounded-circle mx-auto d-flex align-items-center justify-content-center text-white fw-bold shadow"
                    style={{
                      width: "100px",
                      height: "100px",
                      background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                      fontSize: "36px",
                    }}
                  >
                    {selectedStaff.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Name & Position */}
              <h5 className="fw-bold mb-1 text-dark">{selectedStaff.name}</h5>
              {selectedStaff.nameKh && <div className="text-muted mb-2">{selectedStaff.nameKh}</div>}

              <div className="d-flex justify-content-center gap-2 mb-3">
                {selectedStaff.position ? (
                  <Badge bg="primary" className="px-3 py-1.5 rounded-pill">
                    {selectedStaff.position.positionName}
                  </Badge>
                ) : (
                  <Badge bg="secondary" className="px-3 py-1.5 rounded-pill">
                    General Staff
                  </Badge>
                )}
                <Badge
                  bg={selectedStaff.status === "Active" ? "success" : "secondary"}
                  className="px-3 py-1.5 rounded-pill"
                >
                  {selectedStaff.status}
                </Badge>
              </div>

              {/* Details Table */}
              <div className="text-start bg-light rounded-4 p-3 small">
                <div className="d-flex justify-content-between py-1.5 border-bottom">
                  <span className="text-muted">Staff ID:</span>
                  <span className="fw-semibold">#{selectedStaff.id}</span>
                </div>
                <div className="d-flex justify-content-between py-1.5 border-bottom">
                  <span className="text-muted">Gender:</span>
                  <span className="fw-semibold">{selectedStaff.sex || "N/A"}</span>
                </div>
                <div className="d-flex justify-content-between py-1.5 border-bottom">
                  <span className="text-muted">Date of Birth:</span>
                  <span className="fw-semibold">
                    {selectedStaff.dob ? selectedStaff.dob.split("T")[0] : "N/A"}
                  </span>
                </div>
                <div className="d-flex justify-content-between py-1.5 border-bottom">
                  <span className="text-muted">Phone:</span>
                  <span className="fw-semibold">{selectedStaff.phone || "N/A"}</span>
                </div>
                <div className="d-flex justify-content-between py-1.5 border-bottom">
                  <span className="text-muted">Email:</span>
                  <span className="fw-semibold">{selectedStaff.email || "N/A"}</span>
                </div>
                <div className="d-flex justify-content-between py-1.5 border-bottom">
                  <span className="text-muted">Identity No:</span>
                  <span className="fw-semibold">{selectedStaff.identityNo || "N/A"}</span>
                </div>
                <div className="d-flex justify-content-between py-1.5">
                  <span className="text-muted">Address:</span>
                  <span className="fw-semibold text-end" style={{ maxWidth: "200px" }}>
                    {selectedStaff.address || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top-0 pt-0">
          <Button variant="secondary" onClick={() => setOpenViewModal(false)} className="w-100 rounded-3">
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
