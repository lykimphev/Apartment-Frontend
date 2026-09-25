import { useEffect, useState } from "react";
import type { OtherExpenseRes, OtherExpenseReq } from "../model/OtherExpense";
import type { ExpenseTypeRes } from "../model/ExpenseType";
import type { PagedResponse } from "../apis/pagedResponse";
import { OtherExpenseService } from "../services/OtherExpenseService";
import { ExpenseTypeService } from "../services/ExpenseTypeService";
import { toast } from "react-toastify";
import {
  Button,
  Form,
  Modal,
  Pagination,
  Table,
  Card,
  Row,
  Col,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import { Link } from "react-router-dom";

export default function OtherExpensePage() {
  const emptyExpense: OtherExpenseReq = {
    date: new Date().toISOString().split("T")[0],
    expenseTypeId: 0,
    amount: 0,
    note: "",
    createBy: "",
    image: null,
  };

  const [pagination, setPagination] = useState<PagedResponse<OtherExpenseRes>>();
  const [expenseList, setExpenseList] = useState<OtherExpenseRes[]>([]);
  const [formData, setFormData] = useState<OtherExpenseReq>(emptyExpense);
  const [editingId, setEditingId] = useState<number>(0);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Receipt Modal Preview
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [openPreviewModal, setOpenPreviewModal] = useState<boolean>(false);

  // File upload preview inside form
  const [imageFilePreview, setImageFilePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Category options
  const [categories, setCategories] = useState<ExpenseTypeRes[]>([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<number>(0);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const getImageUrl = (photoPath?: string) => {
    if (!photoPath) return "";
    if (photoPath.startsWith("http://") || photoPath.startsWith("https://")) {
      return photoPath;
    }
    const cleanPath = photoPath.replace(/\\/g, "/");
    return `http://localhost:5000/${cleanPath.startsWith("/") ? cleanPath.slice(1) : cleanPath}`;
  };

  const fetchExpenses = async (page: number = 1, pageSize: number = 10) => {
    setLoading(true);
    try {
      const res = await OtherExpenseService.getOtherExpenses(page, pageSize);
      setPagination(res.data);
      setExpenseList(res.data?.data || []);
    } catch (error) {
      console.error(error);
      toast.error(`${error}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await ExpenseTypeService.getAllExpenseTypes();
      setCategories(res.data || []);
    } catch (error) {
      console.error("Failed to load expense categories:", error);
    }
  };

  useEffect(() => {
    fetchExpenses(1, 10);
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    // Current user name for createBy
    const userJson = localStorage.getItem("user");
    const currentUser = userJson ? JSON.parse(userJson) : null;
    const currentName = currentUser?.fullName || currentUser?.username || "System Administrator";

    setEditingId(0);
    setFormData({
      ...emptyExpense,
      createBy: currentName,
      date: new Date().toISOString().split("T")[0],
    });
    setSelectedFile(null);
    setImageFilePreview(null);
    setOpenModal(true);
  };

  const handleOpenEdit = (item: OtherExpenseRes) => {
    setEditingId(item.id);
    let displayName = item.createBy || "";
    if (displayName === "42") displayName = "System Administrator";
    if (displayName === "43") displayName = "Apartment Manager";

    setFormData({
      date: item.date ? item.date.split("T")[0] : "",
      expenseTypeId: item.expenseTypeId || 0,
      amount: item.amount || 0,
      note: item.note || "",
      createBy: displayName,
      image: null,
    });
    setSelectedFile(null);
    setImageFilePreview(item.image ? getImageUrl(item.image) : null);
    setOpenModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImageFilePreview(URL.createObjectURL(file));
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setImageFilePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.expenseTypeId || formData.expenseTypeId <= 0) {
      toast.warning("Please select an expense category.");
      return;
    }
    if (formData.amount === undefined || formData.amount <= 0) {
      toast.warning("Please enter a valid expense amount.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: OtherExpenseReq = {
        ...formData,
        image: selectedFile,
      };

      if (editingId > 0) {
        await OtherExpenseService.updateOtherExpense(editingId, payload);
        toast.success("Expense record updated successfully!");
      } else {
        await OtherExpenseService.createOtherExpense(payload);
        toast.success("Expense record created successfully!");
      }
      setOpenModal(false);
      await fetchExpenses(pagination?.pageNumber || 1, pagination?.pageSize || 10);
    } catch (error) {
      toast.error(`${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this expense record?")) return;
    try {
      await OtherExpenseService.deleteOtherExpense(id);
      toast.success("Expense record deleted successfully!");
      await fetchExpenses(pagination?.pageNumber || 1, pagination?.pageSize || 10);
    } catch (error) {
      toast.error(`${error}`);
    }
  };

  const handlePreviewReceipt = (imageUrl: string) => {
    setPreviewImage(imageUrl);
    setOpenPreviewModal(true);
  };

  // Client-side filtering
  const filteredExpenses = expenseList.filter((item) => {
    const matchSearch =
      searchTerm === "" ||
      (item.note && item.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.createBy && item.createBy.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.expenseType?.expenseTypeName &&
        item.expenseType.expenseTypeName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchCategory =
      categoryFilter === 0 || item.expenseTypeId === categoryFilter;

    let matchDate = true;
    if (startDate) {
      const itemDate = item.date ? item.date.split("T")[0] : "";
      matchDate = matchDate && itemDate >= startDate;
    }
    if (endDate) {
      const itemDate = item.date ? item.date.split("T")[0] : "";
      matchDate = matchDate && itemDate <= endDate;
    }

    return matchSearch && matchCategory && matchDate;
  });

  // Calculate totals
  const totalAmountAll = expenseList.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalFilteredAmount = filteredExpenses.reduce((sum, item) => sum + (item.amount || 0), 0);
  const highestExpense = expenseList.reduce((max, item) => Math.max(max, item.amount || 0), 0);

  return (
    <div className="container-fluid py-4 px-4">
      {/* Header Bar */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: "#0f172a" }}>
            <i className="fa-solid fa-receipt text-primary me-2"></i> Other Expenses & Receipts
          </h3>
          <p className="text-muted mb-0">Record and track operational expenses, utility bills, maintenance & receipt vouchers</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Link
            to="/expense-type"
            className="btn btn-outline-secondary d-flex align-items-center gap-2 px-3 py-2 rounded-3 fw-semibold text-decoration-none"
          >
            <i className="fa-solid fa-tags"></i> Categories
          </Link>
          <Button
            variant="primary"
            onClick={handleOpenAdd}
            className="d-flex align-items-center gap-2 px-3 py-2 shadow-sm rounded-3 fw-semibold"
          >
            <i className="fa-solid fa-plus"></i> Add Expense
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
                style={{ width: "52px", height: "52px", background: "#fef2f2", color: "#dc2626", fontSize: "22px" }}
              >
                <i className="fa-solid fa-money-bill-wave"></i>
              </div>
              <div>
                <span className="text-muted small fw-semibold">TOTAL EXPENSES</span>
                <h4 className="fw-bold mb-0 text-danger">${totalAmountAll.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="d-flex align-items-center gap-3 p-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-4"
                style={{ width: "52px", height: "52px", background: "#eff6ff", color: "#2563eb", fontSize: "22px" }}
              >
                <i className="fa-solid fa-file-invoice-dollar"></i>
              </div>
              <div>
                <span className="text-muted small fw-semibold">RECORDS COUNT</span>
                <h4 className="fw-bold mb-0 text-primary">{pagination?.totalRecords || expenseList.length}</h4>
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
                <i className="fa-solid fa-arrow-trend-up"></i>
              </div>
              <div>
                <span className="text-muted small fw-semibold">HIGHEST EXPENSE</span>
                <h4 className="fw-bold mb-0 text-warning">${highestExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="d-flex align-items-center gap-3 p-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-4"
                style={{ width: "52px", height: "52px", background: "#ecfdf5", color: "#059669", fontSize: "22px" }}
              >
                <i className="fa-solid fa-filter-dollar"></i>
              </div>
              <div>
                <span className="text-muted small fw-semibold">FILTERED TOTAL</span>
                <h4 className="fw-bold mb-0 text-success">${totalFilteredAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Table Card */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <Card.Header className="bg-white py-3 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-3">
          {/* Search & Category Filter */}
          <div className="d-flex flex-wrap align-items-center gap-2 flex-grow-1" style={{ maxWidth: "550px" }}>
            <InputGroup style={{ maxWidth: "280px" }}>
              <InputGroup.Text className="bg-light border-end-0 text-muted">
                <i className="fa-solid fa-magnifying-glass"></i>
              </InputGroup.Text>
              <Form.Control
                placeholder="Search note or creator..."
                className="bg-light border-start-0 ps-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            <Form.Select
              style={{ maxWidth: "220px" }}
              className="bg-light"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(Number(e.target.value))}
            >
              <option value={0}>All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.expenseTypeName}
                </option>
              ))}
            </Form.Select>
          </div>

          {/* Date Range Filters */}
          <div className="d-flex flex-wrap align-items-center gap-2">
            <div className="d-flex align-items-center gap-1.5">
              <span className="text-muted small fw-semibold">From:</span>
              <Form.Control
                type="date"
                size="sm"
                className="bg-light"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ width: "135px" }}
              />
            </div>
            <div className="d-flex align-items-center gap-1.5">
              <span className="text-muted small fw-semibold">To:</span>
              <Form.Control
                type="date"
                size="sm"
                className="bg-light"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ width: "135px" }}
              />
            </div>
            {(startDate || endDate || searchTerm || categoryFilter !== 0) && (
              <Button
                variant="light"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter(0);
                  setStartDate("");
                  setEndDate("");
                }}
                className="text-danger border-0"
                title="Reset Filters"
              >
                <i className="fa-solid fa-rotate-left me-1"></i> Reset
              </Button>
            )}
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0 text-nowrap">
              <thead className="bg-light text-secondary text-uppercase" style={{ fontSize: "12px", letterSpacing: "0.5px" }}>
                <tr>
                  <th className="py-3 px-4" style={{ width: "50px" }}>#</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Amount (USD)</th>
                  <th className="py-3 px-4" style={{ minWidth: "200px" }}>Description / Note</th>
                  <th className="py-3 px-4 text-center" style={{ width: "110px" }}>Receipt</th>
                  <th className="py-3 px-4">Recorded By</th>
                  <th className="py-3 px-4 text-end" style={{ width: "120px", minWidth: "120px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-5">
                      <Spinner animation="border" variant="danger" />
                      <div className="text-muted mt-2 small">Loading expenses...</div>
                    </td>
                  </tr>
                ) : filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-5 text-muted">
                      <i className="fa-solid fa-receipt fs-2 mb-2 d-block text-secondary"></i>
                      No expense records found. Click "+ Add Expense" to record one.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp, index) => {
                    const no =
                      ((pagination?.pageNumber || 1) - 1) * (pagination?.pageSize || 10) + index + 1;
                    return (
                      <tr key={exp.id}>
                        <td className="px-4 text-muted fw-semibold">{no}</td>
                        <td className="px-4 text-muted small">
                          <i className="fa-regular fa-calendar me-1.5 text-secondary"></i>
                          {exp.date ? exp.date.split("T")[0] : "—"}
                        </td>
                        <td className="px-4">
                          <span
                            className="d-inline-flex align-items-center px-3 py-1 rounded-pill fw-semibold text-nowrap"
                            style={{
                              backgroundColor: "#f1f5f9",
                              color: "#0f172a",
                              border: "1px solid #e2e8f0",
                              fontSize: "12.5px",
                            }}
                          >
                            <i className="fa-solid fa-tag text-primary me-1.5" style={{ fontSize: "11px" }}></i>
                            {exp.expenseType?.expenseTypeName || "General Expense"}
                          </span>
                        </td>
                        <td className="px-4">
                          <span className="fw-bold text-danger fs-6">
                            ${(exp.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-4 text-muted small" style={{ minWidth: "200px", maxWidth: "300px" }}>
                          <div className="text-truncate" style={{ maxWidth: "280px" }} title={exp.note || ""}>
                            {exp.note || "—"}
                          </div>
                        </td>
                        <td className="px-4 text-center">
                          {exp.image ? (
                            <img
                              src={getImageUrl(exp.image)}
                              alt="Receipt"
                              className="rounded-3 shadow-xs border cursor-pointer object-fit-cover"
                              style={{ width: "42px", height: "42px", cursor: "pointer" }}
                              onClick={() => handlePreviewReceipt(getImageUrl(exp.image))}
                              title="Click to zoom receipt voucher"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <span className="text-muted small fst-italic">— None —</span>
                          )}
                        </td>
                        <td className="px-4">
                          <div className="d-flex align-items-center gap-1.5 text-secondary small fw-medium">
                            <i className="fa-solid fa-user-circle text-primary"></i>
                            <span>
                              {exp.createBy === "42"
                                ? "System Administrator"
                                : exp.createBy === "43"
                                ? "Apartment Manager"
                                : exp.createBy || "System Administrator"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 text-end text-nowrap">
                          <div className="d-inline-flex gap-2">
                            {exp.image && (
                              <Button
                                variant="light"
                                size="sm"
                                className="rounded-3 text-info border-0"
                                onClick={() => handlePreviewReceipt(getImageUrl(exp.image))}
                                title="View Receipt"
                              >
                                <i className="fa-solid fa-image"></i>
                              </Button>
                            )}
                            <Button
                              variant="light"
                              size="sm"
                              className="rounded-3 text-primary border-0"
                              onClick={() => handleOpenEdit(exp)}
                              title="Edit"
                            >
                              <i className="fa-solid fa-pen-to-square"></i>
                            </Button>
                            <Button
                              variant="light"
                              size="sm"
                              className="rounded-3 text-danger border-0"
                              onClick={() => handleDelete(exp.id)}
                              title="Delete"
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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
                onClick={() => fetchExpenses(pagination.pageNumber - 1)}
              />
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <Pagination.Item
                  key={page}
                  active={page === pagination.pageNumber}
                  onClick={() => fetchExpenses(page)}
                >
                  {page}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={pagination.pageNumber === pagination.totalPages}
                onClick={() => fetchExpenses(pagination.pageNumber + 1)}
              />
            </Pagination>
          </Card.Footer>
        )}
      </Card>

      {/* Add / Edit Expense Modal */}
      <Modal show={openModal} onHide={() => setOpenModal(false)} centered backdrop="static">
        <Modal.Header closeButton className="border-bottom-0 pb-0">
          <Modal.Title className="fw-bold fs-5">
            <i className={`fa-solid ${editingId > 0 ? "fa-pen-to-square text-warning" : "fa-plus text-danger"} me-2`}></i>
            {editingId > 0 ? "Edit Expense Record" : "Add New Expense Record"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="pt-3">
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Expense Category *</Form.Label>
                  <Form.Select
                    value={formData.expenseTypeId || 0}
                    onChange={(e) => setFormData({ ...formData, expenseTypeId: Number(e.target.value) })}
                    required
                  >
                    <option value={0}>-- Select Category --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.expenseTypeName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Expense Date *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.date || ""}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Amount (USD) *</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light fw-bold text-danger">$</InputGroup.Text>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      value={formData.amount || ""}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">
                    <i className="fa-solid fa-user-check me-1 text-primary"></i> Recorded By (Name)
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light text-muted">
                      <i className="fa-solid fa-user"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="e.g. System Administrator"
                      value={formData.createBy || ""}
                      onChange={(e) => setFormData({ ...formData, createBy: e.target.value })}
                    />
                  </InputGroup>
                  <Form.Text className="text-muted small">
                    Name of the staff or admin who recorded this expense.
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Description / Remark</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Provide details about this payment / supplier / invoice number..."
                    value={formData.note || ""}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  />
                </Form.Group>
              </Col>

              {/* Receipt / Invoice Photo Upload */}
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Receipt / Invoice Voucher Photo</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleFileChange}
                  />
                  <Form.Text className="text-muted small">
                    Accepts PNG, JPG, JPEG or WEBP (Max: 5MB)
                  </Form.Text>
                </Form.Group>

                {imageFilePreview && (
                  <div className="mt-2 position-relative d-inline-block border rounded-3 overflow-hidden shadow-xs">
                    <img
                      src={imageFilePreview}
                      alt="Receipt Preview"
                      style={{ maxHeight: "140px", maxWidth: "100%", objectFit: "contain" }}
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      className="position-absolute top-0 end-0 m-1 rounded-circle p-1"
                      style={{ width: "24px", height: "24px", lineHeight: "1" }}
                      onClick={handleClearFile}
                      title="Remove image"
                    >
                      <i className="fa-solid fa-xmark" style={{ fontSize: "11px" }}></i>
                    </Button>
                  </div>
                )}
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
                  <Spinner size="sm" className="me-2" /> Saving...
                </>
              ) : editingId > 0 ? (
                "Update Expense"
              ) : (
                "Record Expense"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Full-size Image Preview Modal */}
      <Modal show={openPreviewModal} onHide={() => setOpenPreviewModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-bottom-0 pb-0">
          <Modal.Title className="fw-bold fs-5">
            <i className="fa-solid fa-receipt text-primary me-2"></i> Receipt Voucher Preview
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-4">
          {previewImage && (
            <img
              src={previewImage}
              alt="Receipt Voucher Full"
              className="img-fluid rounded-3 shadow-sm border"
              style={{ maxHeight: "75vh", objectFit: "contain" }}
            />
          )}
        </Modal.Body>
        <Modal.Footer className="border-top-0 pt-0">
          {previewImage && (
            <a
              href={previewImage}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-primary d-inline-flex align-items-center gap-2"
            >
              <i className="fa-solid fa-arrow-up-right-from-square"></i> Open Full in New Tab
            </a>
          )}
          <Button variant="secondary" onClick={() => setOpenPreviewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
