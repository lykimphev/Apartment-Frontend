import { useEffect, useState } from "react";
import type { BookingReq, BookingRes } from "../model/Booking";
import type { Guest } from "../model/Guest";
import type { RoomRes } from "../model/Room";
import type { ExchangeRes } from "../model/Exchange";
import type { PagedResponse } from "../apis/pagedResponse";
import { BookingService } from "../services/BookingService";
import { GuestService } from "../services/GuestService";
import { RoomService } from "../services/RoomService";
import { ExchangeService } from "../services/ExchangeService";
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

export default function BookingPage() {
  const emptyBooking: BookingReq = {
    bookingNo: "",
    bookingDate: new Date().toISOString().split("T")[0],
    guestId: 0,
    roomId: 0,
    exchangeId: 0,
    total: 0,
    payDollar: 0,
    payRiel: 0,
    checkInDate: new Date().toISOString().split("T")[0],
    expireDate: "",
    status: "Confirmed",
    note: "",
  };

  const [pagination, setPagination] = useState<PagedResponse<BookingRes>>();
  const [formData, setFormData] = useState<BookingReq>(emptyBooking);
  const [editingId, setEditingId] = useState<number>(0);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Reference Data
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rooms, setRooms] = useState<RoomRes[]>([]);
  const [activeExchange, setActiveExchange] = useState<ExchangeRes | null>(null);

  // Fetch Bookings
  const fetchBookings = async (page: number = 1, pageSize: number = 10) => {
    setLoading(true);
    try {
      const res = await BookingService.getBookings(page, pageSize);
      setPagination(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Dropdowns (Guests, Rooms, Active Exchange)
  const fetchReferences = async () => {
    try {
      const [guestRes, roomRes, exchangeRes] = await Promise.all([
        GuestService.getAllGuests(),
        RoomService.getAllRooms(),
        ExchangeService.getActive(),
      ]);
      setGuests(guestRes.data || []);
      setRooms(roomRes.data || []);
      setActiveExchange(exchangeRes.data || null);
    } catch (error) {
      console.error("Failed to load reference data:", error);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchReferences();
  }, []);

  // Open Modal for Create
  const handleOpenAdd = () => {
    setEditingId(0);
    const today = new Date().toISOString().split("T")[0];
    // Default expire 1 month later
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthStr = nextMonth.toISOString().split("T")[0];

    setFormData({
      ...emptyBooking,
      bookingDate: today,
      checkInDate: today,
      expireDate: nextMonthStr,
      exchangeId: activeExchange?.id || 0,
    });
    setOpenModal(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (item: BookingRes) => {
    setEditingId(item.id);
    setFormData({
      bookingNo: item.bookingNo || "",
      bookingDate: item.bookingDate ? item.bookingDate.split("T")[0] : "",
      guestId: item.guestId || 0,
      roomId: item.roomId || 0,
      exchangeId: item.exchangeId || activeExchange?.id || 0,
      total: item.total || 0,
      payDollar: item.payDollar || 0,
      payRiel: item.payRiel || 0,
      checkInDate: item.checkInDate ? item.checkInDate.split("T")[0] : "",
      expireDate: item.expireDate ? item.expireDate.split("T")[0] : "",
      status: item.status || "Confirmed",
      note: item.note || "",
    });
    setOpenModal(true);
  };

  // When room is selected in modal, auto-fill price as total
  const handleRoomChange = (roomId: number) => {
    const selected = rooms.find((r) => r.id === roomId);
    const price = selected?.price || 0;
    setFormData((prev) => ({
      ...prev,
      roomId: roomId,
      total: price,
      payDollar: price,
      payRiel: 0,
      exchangeId: activeExchange?.id || prev.exchangeId,
    }));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.guestId || formData.guestId <= 0) {
      toast.warning("Please select a guest.");
      return;
    }
    if (!formData.roomId || formData.roomId <= 0) {
      toast.warning("Please select a room.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: BookingReq = {
        ...formData,
        guestId: Number(formData.guestId),
        roomId: Number(formData.roomId),
        exchangeId: formData.exchangeId ? Number(formData.exchangeId) : activeExchange?.id,
        total: Number(formData.total) || 0,
        payDollar: Number(formData.payDollar) || 0,
        payRiel: Number(formData.payRiel) || 0,
      };

      if (editingId === 0) {
        await BookingService.createBooking(payload);
        toast.success("Booking created successfully!");
      } else {
        await BookingService.updateBooking(editingId, payload);
        toast.success("Booking updated successfully!");
      }

      setOpenModal(false);
      fetchBookings(pagination?.pageNumber || 1);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Handler
  const handleDelete = async (id: number, bookingNo?: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete booking ${bookingNo || `#${id}`}?`
      )
    ) {
      return;
    }

    try {
      await BookingService.deleteBooking(id);
      toast.success("Booking deleted successfully!");
      fetchBookings(pagination?.pageNumber || 1);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete booking.");
    }
  };

  // Filtered Bookings for Search & Status
  const displayedList = (pagination?.data || []).filter((item) => {
    const matchesSearch =
      (item.bookingNo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.guest?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.room?.roomNo || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Helper Badge Color
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "Confirmed":
        return <Badge bg="success">Confirmed</Badge>;
      case "Pending":
        return <Badge bg="warning" text="dark">Pending</Badge>;
      case "CheckedIn":
        return <Badge bg="primary">Checked In</Badge>;
      case "Cancelled":
        return <Badge bg="danger">Cancelled</Badge>;
      case "Completed":
        return <Badge bg="secondary">Completed</Badge>;
      default:
        return <Badge bg="info">{status || "Unknown"}</Badge>;
    }
  };

  return (
    <div className="container-fluid py-4 px-4">
      {/* Header Section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <i className="fa-solid fa-calendar-check text-primary"></i>
            Room Bookings & Reservations
          </h2>
          <p className="text-muted mb-0">
            Manage apartment leases, short-term reservations, and guest check-ins.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          {activeExchange && (
            <div className="px-3 py-2 bg-light border rounded-3 d-flex align-items-center gap-2 shadow-sm">
              <i className="fa-solid fa-money-bill-transfer text-success"></i>
              <span className="small text-muted">Active Rate:</span>
              <strong className="text-success">
                $1 = {activeExchange.rate.toLocaleString()} ៛
              </strong>
            </div>
          )}
          <Button
            variant="primary"
            className="d-flex align-items-center gap-2 shadow-sm px-3 py-2 fw-semibold"
            onClick={handleOpenAdd}
          >
            <i className="fa-solid fa-plus"></i>
            New Booking
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100 bg-primary text-white">
            <Card.Body className="d-flex align-items-center justify-content-between p-3">
              <div>
                <span className="text-white-50 text-uppercase small fw-bold">
                  Total Bookings
                </span>
                <h3 className="fw-bold mb-0 mt-1">
                  {pagination?.totalRecords || 0}
                </h3>
              </div>
              <div className="p-3 bg-white bg-opacity-25 rounded-3">
                <i className="fa-solid fa-bookmark fs-4"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100 bg-success text-white">
            <Card.Body className="d-flex align-items-center justify-content-between p-3">
              <div>
                <span className="text-white-50 text-uppercase small fw-bold">
                  Confirmed Stays
                </span>
                <h3 className="fw-bold mb-0 mt-1">
                  {(pagination?.data || []).filter((b) => b.status === "Confirmed").length}
                </h3>
              </div>
              <div className="p-3 bg-white bg-opacity-25 rounded-3">
                <i className="fa-solid fa-circle-check fs-4"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100 bg-warning text-dark">
            <Card.Body className="d-flex align-items-center justify-content-between p-3">
              <div>
                <span className="text-dark-50 text-uppercase small fw-bold">
                  Pending Approval
                </span>
                <h3 className="fw-bold mb-0 mt-1">
                  {(pagination?.data || []).filter((b) => b.status === "Pending").length}
                </h3>
              </div>
              <div className="p-3 bg-dark bg-opacity-10 rounded-3">
                <i className="fa-solid fa-clock fs-4"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100 bg-info text-white">
            <Card.Body className="d-flex align-items-center justify-content-between p-3">
              <div>
                <span className="text-white-50 text-uppercase small fw-bold">
                  Available Rooms
                </span>
                <h3 className="fw-bold mb-0 mt-1">
                  {rooms.filter((r) => r.status === "Available").length}
                </h3>
              </div>
              <div className="p-3 bg-white bg-opacity-25 rounded-3">
                <i className="fa-solid fa-door-open fs-4"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Table Card */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <Card.Header className="bg-white border-0 py-3 px-4">
          <Row className="g-3 align-items-center justify-content-between">
            {/* Search Box */}
            <Col xs={12} md={6} lg={4}>
              <InputGroup>
                <InputGroup.Text className="bg-light border-end-0 text-muted">
                  <i className="fa-solid fa-magnifying-glass"></i>
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search Booking #, Guest, or Room..."
                  className="bg-light border-start-0 ps-0"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>

            {/* Status Filter */}
            <Col xs={12} md={6} lg={4} className="d-flex justify-content-md-end gap-2">
              <Form.Select
                className="w-auto bg-light border"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="CheckedIn">Checked In</option>
                <option value="Cancelled">Cancelled</option>
              </Form.Select>
              <Button
                variant="outline-secondary"
                onClick={() => fetchBookings(pagination?.pageNumber || 1)}
                title="Refresh"
              >
                <i className="fa-solid fa-arrows-rotate"></i>
              </Button>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted mb-0">Loading bookings data...</p>
            </div>
          ) : displayedList.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="fa-regular fa-calendar-xmark fs-1 text-secondary mb-3 d-block"></i>
              <h5>No Bookings Found</h5>
              <p className="small mb-3">
                {searchTerm || statusFilter !== "All"
                  ? "No bookings matched your search filter."
                  : "Start creating your first reservation."}
              </p>
              <Button variant="primary" size="sm" onClick={handleOpenAdd}>
                <i className="fa-solid fa-plus me-1"></i> Create Booking
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0 text-nowrap">
                <thead className="table-light">
                  <tr>
                    <th className="px-4 py-3">Booking No</th>
                    <th>Guest</th>
                    <th>Room</th>
                    <th>Stay Period</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th className="text-end px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedList.map((item) => (
                    <tr key={item.id}>
                      {/* Booking No */}
                      <td className="px-4">
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-light text-primary border border-primary-subtle fw-semibold py-1.5 px-2">
                            {item.bookingNo || `BK-${item.id}`}
                          </span>
                        </div>
                      </td>

                      {/* Guest Info */}
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold"
                            style={{ width: "36px", height: "36px", fontSize: "14px" }}
                          >
                            {item.guest?.name ? item.guest.name.charAt(0).toUpperCase() : "G"}
                          </div>
                          <div>
                            <div className="fw-semibold text-dark">
                              {item.guest?.name || <span className="text-muted fst-italic">Guest #{item.guestId}</span>}
                            </div>
                            {item.guest?.phone && (
                              <small className="text-muted d-block">
                                <i className="fa-solid fa-phone me-1 text-secondary"></i>
                                {item.guest.phone}
                              </small>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Room Info */}
                      <td>
                        <div className="fw-semibold text-dark">
                          {item.room?.roomNo ? `Room ${item.room.roomNo}` : `Room #${item.roomId}`}
                        </div>
                        <small className="text-muted">
                          Rate: ${item.room?.price || 0}/mo
                        </small>
                      </td>

                      {/* Stay Period */}
                      <td>
                        <div>
                          <i className="fa-solid fa-arrow-right-to-bracket me-1 text-success"></i>
                          <span>{item.checkInDate ? item.checkInDate.split("T")[0] : "-"}</span>
                        </div>
                        {item.expireDate && (
                          <small className="text-danger">
                            <i className="fa-solid fa-calendar-xmark me-1"></i>
                            {item.expireDate.split("T")[0]}
                          </small>
                        )}
                      </td>

                      {/* Payments */}
                      <td>
                        <div className="fw-bold text-success">
                          ${(item.total || 0).toLocaleString()}
                        </div>
                        <small className="text-muted">
                          Paid: ${(item.payDollar || 0).toLocaleString()}
                          {item.payRiel && item.payRiel > 0 ? ` + ${item.payRiel.toLocaleString()} ៛` : ""}
                        </small>
                      </td>

                      {/* Status */}
                      <td>{getStatusBadge(item.status)}</td>

                      {/* Created Date */}
                      <td>
                        <small className="text-muted">
                          {item.bookingDate ? item.bookingDate.split("T")[0] : "-"}
                        </small>
                      </td>

                      {/* Actions */}
                      <td className="text-end px-4">
                        <div className="d-inline-flex gap-1">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="btn-icon"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Booking"
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="btn-icon"
                            onClick={() => handleDelete(item.id, item.bookingNo)}
                            title="Delete Booking"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <Card.Footer className="bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
            <span className="small text-muted">
              Showing page {pagination.pageNumber} of {pagination.totalPages} ({pagination.totalRecords} total bookings)
            </span>
            <Pagination className="mb-0">
              <Pagination.Prev
                disabled={pagination.pageNumber === 1}
                onClick={() => fetchBookings(pagination.pageNumber - 1)}
              />
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={i + 1 === pagination.pageNumber}
                  onClick={() => fetchBookings(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={pagination.pageNumber === pagination.totalPages}
                onClick={() => fetchBookings(pagination.pageNumber + 1)}
              />
            </Pagination>
          </Card.Footer>
        )}
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        show={openModal}
        onHide={() => setOpenModal(false)}
        backdrop="static"
        centered
        size="lg"
      >
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold fs-5">
              <i
                className={`fa-solid ${
                  editingId === 0 ? "fa-calendar-plus text-primary" : "fa-pen-to-square text-warning"
                } me-2`}
              ></i>
              {editingId === 0 ? "New Room Booking" : "Edit Booking Details"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="pt-3">
            <Row className="g-3">
              {/* Booking No */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">
                    Booking No (Optional)
                  </Form.Label>
                  <Form.Control
                    placeholder="Auto-generated if left blank"
                    value={formData.bookingNo || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, bookingNo: e.target.value })
                    }
                  />
                  <Form.Text className="text-muted">
                    Leave blank to auto-generate (e.g. BK-20260921-1234).
                  </Form.Text>
                </Form.Group>
              </Col>

              {/* Status */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Booking Status</Form.Label>
                  <Form.Select
                    value={formData.status || "Confirmed"}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="CheckedIn">Checked In</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Completed">Completed</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Guest Selection */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">
                    Select Guest <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    required
                    value={formData.guestId || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, guestId: Number(e.target.value) })
                    }
                  >
                    <option value={0}>-- Choose Guest --</option>
                    {guests.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} {g.phone ? `(${g.phone})` : ""}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Room Selection */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">
                    Select Room <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    required
                    value={formData.roomId || 0}
                    onChange={(e) => handleRoomChange(Number(e.target.value))}
                  >
                    <option value={0}>-- Choose Room --</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        Room {r.roomNo} - ${r.price}/mo ({r.status})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Check-in Date */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">
                    Check-in Date <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="date"
                    required
                    value={formData.checkInDate || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, checkInDate: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>

              {/* Expire / Contract End Date */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">
                    Expire / End Date (Renewal Due)
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.expireDate || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, expireDate: e.target.value })
                    }
                  />
                  <Form.Text className="text-muted">
                    Due date to pay for next month or renew contract.
                  </Form.Text>
                </Form.Group>
              </Col>

              {/* Total Amount & Currency Conversion */}
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Total Rent ($ USD)</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>$</InputGroup.Text>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={formData.total || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          total: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Paid in Dollar ($)</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>$</InputGroup.Text>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={formData.payDollar || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          payDollar: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Paid in Riel (៛ KHR)</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>៛</InputGroup.Text>
                    <Form.Control
                      type="number"
                      step="100"
                      value={formData.payRiel || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          payRiel: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              {/* Note */}
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Special Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="E.g. Paid 1 month deposit, parking access granted, etc."
                    value={formData.note || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, note: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer className="border-0 pt-0">
            <Button
              variant="outline-secondary"
              onClick={() => setOpenModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Saving...
                </>
              ) : editingId === 0 ? (
                "Create Reservation"
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
