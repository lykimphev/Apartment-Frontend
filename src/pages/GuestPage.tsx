import { useEffect, useState, useRef } from "react";
import {
  Button,
  Form,
  Modal,
  Pagination,
  Table,
  Card,
  Row,
  Col,
  Badge,
  Image,
} from "react-bootstrap";
import type { Guest, GuestReq } from "../model/Guest";
import type { PagedResponse } from "../apis/pagedResponse";
import { GuestService } from "../services/GuestService";
import { toast } from "react-toastify";

export default function GuestPage() {
  const [pagination, setPagination] = useState<PagedResponse<Guest>>();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [guestId, setGuestId] = useState<number>(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialForm: GuestReq = {
    name: "",
    nameKH: "",
    gender: "Male",
    dob: "",
    address: "",
    nationality: "Cambodian",
    phone: "",
    email: "",
    ssn: "",
    passport: "",
    status: "Active",
    image: null,
  };

  const [formData, setFormData] = useState<GuestReq>(initialForm);

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    const cleanPath = imagePath.replace(/\\/g, "/");
    return `http://localhost:5000/${cleanPath.startsWith("/") ? cleanPath.slice(1) : cleanPath}`;
  };

  const formatDateForInput = (dateStr?: string) => {
    if (!dateStr) return "";
    return dateStr.split("T")[0];
  };

  const fetchGuests = async (page: number = 1, pageSize: number = 10) => {
    try {
      const res = await GuestService.getGuests(page, pageSize);
      setPagination(res.data);
    } catch (error) {
      console.error(error);
      toast.error(`${error}`);
    }
  };

  const handleAdd = () => {
    setFormData(initialForm);
    setGuestId(0);
    setImagePreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setOpenModal(true);
  };

  const handleEdit = (guest: Guest) => {
    setFormData({
      name: guest.name || "",
      nameKH: guest.nameKH || "",
      gender: guest.gender || "Male",
      dob: formatDateForInput(guest.dob),
      address: guest.address || "",
      nationality: guest.nationality || "",
      phone: guest.phone || "",
      email: guest.email || "",
      ssn: guest.ssn || "",
      passport: guest.passport || "",
      status: guest.status || "Active",
      image: null,
    });
    setGuestId(guest.id);
    setImagePreview(guest.imagePath ? getImageUrl(guest.imagePath) : null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setOpenModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (guestId === 0 && !selectedFile) {
      toast.warning("Please upload a guest identification photo.");
      return;
    }
    setLoading(true);
    try {
      const payload: GuestReq = {
        ...formData,
        image: selectedFile,
      };

      if (guestId > 0) {
        await GuestService.updateGuest(guestId, payload);
        toast.success("Guest updated successfully!");
      } else {
        await GuestService.createGuest(payload);
        toast.success("New guest registered successfully!");
      }

      setOpenModal(false);
      await fetchGuests(pagination?.pageNumber || 1, pagination?.pageSize || 10);
    } catch (error) {
      console.error(error);
      toast.error(`${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this guest?")) {
      try {
        const res = await GuestService.deleteGuest(id);
        toast.success(res.message || "Guest deleted successfully.");
        await fetchGuests(pagination?.pageNumber || 1, pagination?.pageSize || 10);
      } catch (error) {
        console.error(error);
        toast.error(`${error}`);
      }
    }
  };

  const handlePageChange = async (page: number) => {
    await fetchGuests(page, pagination?.pageSize || 10);
  };

  useEffect(() => {
    fetchGuests(1, 10);
  }, []);

  return (
    <div className="pb-5">
      {/* Top Header Card */}
      <Card className="border-0 shadow-sm rounded-4 mb-4 bg-white p-3 p-md-4">
        <Row className="align-items-center gy-3">
          <Col md={7}>
            <div className="d-flex align-items-center gap-3">
              <div>
                <h4 className="fw-bold mb-1 text-dark">Guests</h4>
                <p className="text-muted small mb-0">
                  Manage apartment guests, profiles, contact info and documents
                </p>
              </div>
            </div>
          </Col>
          <Col md={5} className="text-md-end">
            <Button
              variant="primary"
              onClick={handleAdd}
              className="btn-add-new d-inline-flex align-items-center gap-2"
            >
              <i className="fa-solid fa-user-plus fs-6"></i>
              <span className="fw-semibold">Add New Guest</span>
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Guest Modal */}
      <Modal
        show={openModal}
        onHide={() => setOpenModal(false)}
        backdrop="static"
        keyboard={false}
        centered
        size="lg"
        className="custom-modal"
      >
        <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
          <div>
            <Modal.Title className="fw-bold fs-5 text-dark mb-1">
              {guestId > 0 ? "Edit Guest Profile" : "Register New Guest"}
            </Modal.Title>
            <p className="text-muted small mb-0">
              {guestId > 0
                ? "Update guest information, identity and photo"
                : "Fill in guest details and upload identification photo"}
            </p>
          </div>
        </Modal.Header>
        <Modal.Body className="px-4 py-3">
          <Form onSubmit={handleSubmit} id="guestForm">
            <Row className="g-3">
              {/* Photo Upload & Preview */}
              <Col xs={12} className="text-center mb-2">
                <div className="d-flex flex-column align-items-center gap-2">
                  <div
                    style={{
                      width: "100px",
                      height: "100px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "2px dashed #cbd5e1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f8fafc",
                    }}
                  >
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <i className="fa-solid fa-user fs-1 text-secondary opacity-50"></i>
                    )}
                  </div>
                  <div>
                    <Form.Label
                      htmlFor="guestPhotoInput"
                      className="btn btn-sm btn-outline-primary mb-0 cursor-pointer"
                    >
                      <i className="fa-solid fa-camera me-1"></i>{" "}
                      {imagePreview ? "Change Photo" : "Upload Photo"}
                    </Form.Label>
                    <Form.Control
                      type="file"
                      id="guestPhotoInput"
                      ref={fileInputRef}
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleFileChange}
                      className="d-none"
                    />
                  </div>
                </div>
              </Col>

              {/* Guest Names */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small text-secondary">
                    Full Name (English) <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small text-secondary">
                    Full Name (Khmer)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. សុខ សាន"
                    value={formData.nameKH}
                    onChange={(e) =>
                      setFormData({ ...formData, nameKH: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>

              {/* Gender & DOB */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small text-secondary">
                    Gender <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    required
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small text-secondary">
                    Date of Birth
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.dob}
                    onChange={(e) =>
                      setFormData({ ...formData, dob: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>

              {/* Phone & Email */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small text-secondary">
                    Phone Number
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="e.g. 012 345 678"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small text-secondary">
                    Email Address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="e.g. john@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>

              {/* Nationality & Status */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small text-secondary">
                    Nationality
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Cambodian"
                    value={formData.nationality}
                    onChange={(e) =>
                      setFormData({ ...formData, nationality: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small text-secondary">
                    Status
                  </Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* SSN & Passport */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small text-secondary">
                    National ID / SSN
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. 010203040"
                    value={formData.ssn}
                    onChange={(e) =>
                      setFormData({ ...formData, ssn: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small text-secondary">
                    Passport No.
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. N1234567"
                    value={formData.passport}
                    onChange={(e) =>
                      setFormData({ ...formData, passport: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>

              {/* Address */}
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold small text-secondary">
                    Address / Notes
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="e.g. Phnom Penh, Cambodia"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 pb-4 px-4">
          <Button
            variant="light"
            onClick={() => setOpenModal(false)}
            className="rounded-3 px-4 fw-medium text-secondary"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="guestForm"
            className="btn-add-new px-4 shadow-sm"
            disabled={loading}
          >
            <i className="fa-solid fa-check me-2"></i>
            {loading
              ? "Saving..."
              : guestId > 0
                ? "Update Guest"
                : "Save Guest"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Main Table Card */}
      <Card className="custom-card mb-4">
        <Card.Header className="bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
          <span className="fw-semibold text-dark">All Guests</span>
          {pagination && (
            <Badge
              bg="primary"
              className="bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-medium"
            >
              Total Records: {pagination.totalRecords}
            </Badge>
          )}
        </Card.Header>
        <div className="table-responsive">
          <Table className="custom-table align-middle mb-0" hover>
            <thead>
              <tr>
                <th style={{ width: "70px" }}>Photo</th>
                <th style={{ width: "60px" }}>ID</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Contact</th>
                <th>Identity</th>
                <th>Nationality</th>
                <th>Status</th>
                <th style={{ width: "160px" }} className="text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {pagination &&
              pagination.data &&
              pagination.data.length > 0 ? (
                pagination.data.map((guest) => (
                  <tr key={guest.id}>
                    <td>
                      {guest.imagePath ? (
                        <Image
                          src={getImageUrl(guest.imagePath)}
                          alt={guest.name}
                          roundedCircle
                          style={{
                            width: "40px",
                            height: "40px",
                            objectFit: "cover",
                            border: "1px solid #e2e8f0",
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://placehold.co/40x40?text=Guest";
                          }}
                        />
                      ) : (
                        <div
                          className="rounded-circle bg-light d-flex align-items-center justify-content-center text-secondary fw-semibold border"
                          style={{ width: "40px", height: "40px" }}
                        >
                          {guest.name ? guest.name.charAt(0).toUpperCase() : "G"}
                        </div>
                      )}
                    </td>
                    <td className="fw-semibold text-secondary">#{guest.id}</td>
                    <td>
                      <div className="fw-semibold text-dark">{guest.name}</div>
                      {guest.nameKH && (
                        <div className="text-muted small">{guest.nameKH}</div>
                      )}
                    </td>
                    <td>
                      <Badge
                        bg={
                          guest.gender?.toLowerCase() === "female"
                            ? "danger"
                            : "info"
                        }
                        className="bg-opacity-10 text-dark fw-normal px-2 py-1"
                      >
                        {guest.gender || "N/A"}
                      </Badge>
                    </td>
                    <td>
                      {guest.phone && (
                        <div className="small text-dark">
                          <i className="fa-solid fa-phone me-1 text-secondary opacity-75"></i>
                          {guest.phone}
                        </div>
                      )}
                      {guest.email && (
                        <div className="small text-muted">
                          <i className="fa-solid fa-envelope me-1 text-secondary opacity-75"></i>
                          {guest.email}
                        </div>
                      )}
                      {!guest.phone && !guest.email && (
                        <span className="text-muted small">N/A</span>
                      )}
                    </td>
                    <td>
                      {guest.ssn && (
                        <div className="small">
                          <span className="text-muted">SSN: </span>
                          <span className="fw-medium">{guest.ssn}</span>
                        </div>
                      )}
                      {guest.passport && (
                        <div className="small">
                          <span className="text-muted">Pass: </span>
                          <span className="fw-medium">{guest.passport}</span>
                        </div>
                      )}
                      {!guest.ssn && !guest.passport && (
                        <span className="text-muted small">-</span>
                      )}
                    </td>
                    <td className="text-dark">{guest.nationality || "N/A"}</td>
                    <td>
                      <Badge
                        bg={
                          guest.status?.toLowerCase() === "active"
                            ? "success"
                            : "secondary"
                        }
                        className="bg-opacity-10 text-dark fw-semibold px-2 py-1"
                      >
                        {guest.status || "Active"}
                      </Badge>
                    </td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <Button
                          type="button"
                          className="btn-action-edit"
                          onClick={() => handleEdit(guest)}
                          title="Edit Guest"
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          className="btn-action-delete"
                          onClick={() => handleDelete(guest.id)}
                          title="Delete Guest"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-5 text-muted">
                    <i className="fa-solid fa-users-slash fs-2 mb-2 d-block text-secondary opacity-50"></i>
                    No guests found. Click <strong>Add New Guest</strong> above
                    to register.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination className="float-end">
          <Pagination.First
            disabled={pagination.pageNumber === 1}
            onClick={() => handlePageChange(1)}
          />
          <Pagination.Prev
            disabled={pagination.pageNumber === 1}
            onClick={() => handlePageChange(pagination.pageNumber - 1)}
          />
          {Array.from({ length: pagination.totalPages }, (_, index) => (
            <Pagination.Item
              key={index + 1}
              active={pagination.pageNumber === index + 1}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            disabled={pagination.pageNumber === pagination.totalPages}
            onClick={() => handlePageChange(pagination.pageNumber + 1)}
          />
          <Pagination.Last
            disabled={pagination.pageNumber === pagination.totalPages}
            onClick={() => handlePageChange(pagination.totalPages)}
          />
        </Pagination>
      )}
    </div>
  );
}
