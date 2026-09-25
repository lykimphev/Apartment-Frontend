import { useEffect, useState } from "react";
import type { ExpenseTypeRes, ExpenseTypeReq } from "../model/ExpenseType";
import type { PagedResponse } from "../apis/pagedResponse";
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

export default function ExpenseTypePage() {
  const emptyExpenseType: ExpenseTypeReq = {
    expenseTypeName: "",
    description: "",
    status: "Active",
  };

  const [pagination, setPagination] = useState<PagedResponse<ExpenseTypeRes>>();
  const [expenseTypes, setExpenseTypes] = useState<ExpenseTypeRes[]>([]);
  const [formData, setFormData] = useState<ExpenseTypeReq>(emptyExpenseType);
  const [editingId, setEditingId] = useState<number>(0);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const fetchExpenseTypes = async (page: number = 1, pageSize: number = 10) => {
    setLoading(true);
    try {
      const res = await ExpenseTypeService.getExpenseTypes(page, pageSize);
      setPagination(res.data);
      setExpenseTypes(res.data?.data || []);
    } catch (error) {
      console.error(error);
      toast.error(`${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenseTypes(1, 10);
  }, []);

  const handleOpenAdd = () => {
    setEditingId(0);
    setFormData(emptyExpenseType);
    setOpenModal(true);
  };

  const handleOpenEdit = (item: ExpenseTypeRes) => {
    setEditingId(item.id);
    setFormData({
      expenseTypeName: item.expenseTypeName || "",
      description: item.description || "",
      status: item.status || "Active",
    });
    setOpenModal(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.expenseTypeName.trim()) {
      toast.warning("Expense category name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId > 0) {
        await ExpenseTypeService.updateExpenseType(editingId, formData);
        toast.success("Expense category updated successfully!");
      } else {
        await ExpenseTypeService.createExpenseType(formData);
        toast.success("Expense category created successfully!");
      }
      setOpenModal(false);
      await fetchExpenseTypes(pagination?.pageNumber || 1, pagination?.pageSize || 10);
    } catch (error) {
      toast.error(`${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this expense category?")) return;
    try {
      await ExpenseTypeService.deleteExpenseType(id);
      toast.success("Expense category deleted successfully!");
      await fetchExpenseTypes(pagination?.pageNumber || 1, pagination?.pageSize || 10);
    } catch (error) {
      toast.error(`${error}`);
    }
  };

  // Client-side filtering
  const filteredList = expenseTypes.filter((item) => {
    const matchesSearch =
      searchTerm === "" ||
      (item.expenseTypeName && item.expenseTypeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "All" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const activeCount = expenseTypes.filter((x) => x.status === "Active").length;
  const inactiveCount = expenseTypes.filter((x) => x.status === "Inactive").length;

  return (
    <div className="container-fluid py-4 px-4">
      {/* Header Bar */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: "#0f172a" }}>
            <i className="fa-solid fa-tags text-primary me-2"></i> Expense Categories
          </h3>
          <p className="text-muted mb-0">Manage building operational expense types and cost classifications</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Link
            to="/expense"
            className="btn btn-outline-secondary d-flex align-items-center gap-2 px-3 py-2 rounded-3 fw-semibold text-decoration-none"
          >
            <i className="fa-solid fa-receipt"></i> Other Expenses
          </Link>
          <Button
            variant="primary"
            onClick={handleOpenAdd}
            className="d-flex align-items-center gap-2 px-3 py-2 shadow-sm rounded-3 fw-semibold"
          >
            <i className="fa-solid fa-plus"></i> Add Category
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
                style={{ width: "52px", height: "52px", background: "#eff6ff", color: "#2563eb", fontSize: "22px" }}
              >
                <i className="fa-solid fa-tags"></i>
              </div>
              <div>
                <span className="text-muted small fw-semibold">TOTAL CATEGORIES</span>
                <h4 className="fw-bold mb-0 text-dark">{pagination?.totalRecords || expenseTypes.length}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={6} lg={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="d-flex align-items-center gap-3 p-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-4"
                style={{ width: "52px", height: "52px", background: "#ecfdf5", color: "#059669", fontSize: "22px" }}
              >
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <div>
                <span className="text-muted small fw-semibold">ACTIVE CATEGORIES</span>
                <h4 className="fw-bold mb-0 text-success">{activeCount}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={6} lg={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="d-flex align-items-center gap-3 p-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-4"
                style={{ width: "52px", height: "52px", background: "#f8fafc", color: "#64748b", fontSize: "22px" }}
              >
                <i className="fa-solid fa-circle-pause"></i>
              </div>
              <div>
                <span className="text-muted small fw-semibold">INACTIVE</span>
                <h4 className="fw-bold mb-0 text-secondary">{inactiveCount}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Table Card */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <Card.Header className="bg-white py-3 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex flex-wrap align-items-center gap-2 flex-grow-1" style={{ maxWidth: "500px" }}>
            <InputGroup style={{ maxWidth: "320px" }}>
              <InputGroup.Text className="bg-light border-end-0 text-muted">
                <i className="fa-solid fa-magnifying-glass"></i>
              </InputGroup.Text>
              <Form.Control
                placeholder="Search categories or remarks..."
                className="bg-light border-start-0 ps-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            <Form.Select
              style={{ maxWidth: "160px" }}
              className="bg-light"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
                  <th className="py-3 px-4" style={{ width: "60px" }}>#</th>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Description / Remarks</th>
                  <th className="py-3 px-4" style={{ width: "120px" }}>Status</th>
                  <th className="py-3 px-4 text-end" style={{ width: "120px", minWidth: "120px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                      <div className="text-muted mt-2 small">Loading expense categories...</div>
                    </td>
                  </tr>
                ) : filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-muted">
                      <i className="fa-solid fa-tag fs-2 mb-2 d-block text-secondary"></i>
                      No expense categories found. Click "+ Add Category" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item, index) => {
                    const no =
                      ((pagination?.pageNumber || 1) - 1) * (pagination?.pageSize || 10) + index + 1;
                    return (
                      <tr key={item.id}>
                        <td className="px-4 text-muted fw-semibold">{no}</td>
                        <td className="px-4">
                          <span
                            className="d-inline-flex align-items-center px-3 py-1 rounded-pill fw-semibold text-nowrap"
                            style={{
                              backgroundColor: "#f1f5f9",
                              color: "#0f172a",
                              border: "1px solid #e2e8f0",
                              fontSize: "13px",
                            }}
                          >
                            <i className="fa-solid fa-tag text-primary me-1.5" style={{ fontSize: "11px" }}></i>
                            {item.expenseTypeName}
                          </span>
                        </td>
                        <td className="px-4 text-muted small" style={{ minWidth: "250px", maxWidth: "400px" }}>
                          <div className="text-truncate" style={{ maxWidth: "380px" }} title={item.description || ""}>
                            {item.description || "—"}
                          </div>
                        </td>
                        <td className="px-4">
                          <span
                            className="d-inline-flex align-items-center justify-content-center rounded-pill fw-semibold"
                            style={{
                              width: "85px",
                              padding: "4px 0",
                              fontSize: "12px",
                              backgroundColor: item.status === "Active" ? "#ecfdf5" : "#f1f5f9",
                              color: item.status === "Active" ? "#047857" : "#475569",
                              border: `1px solid ${item.status === "Active" ? "#a7f3d0" : "#cbd5e1"}`,
                            }}
                          >
                            <i
                              className={`fa-solid ${item.status === "Active" ? "fa-circle-check" : "fa-circle-pause"} me-1.5`}
                              style={{ fontSize: "10.5px" }}
                            ></i>
                            {item.status || "Active"}
                          </span>
                        </td>
                        <td className="px-4 text-end text-nowrap">
                          <div className="d-inline-flex gap-2">
                            <Button
                              variant="light"
                              size="sm"
                              className="rounded-3 text-primary border-0"
                              onClick={() => handleOpenEdit(item)}
                              title="Edit"
                            >
                              <i className="fa-solid fa-pen-to-square"></i>
                            </Button>
                            <Button
                              variant="light"
                              size="sm"
                              className="rounded-3 text-danger border-0"
                              onClick={() => handleDelete(item.id)}
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
                onClick={() => fetchExpenseTypes(pagination.pageNumber - 1)}
              />
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <Pagination.Item
                  key={page}
                  active={page === pagination.pageNumber}
                  onClick={() => fetchExpenseTypes(page)}
                >
                  {page}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={pagination.pageNumber === pagination.totalPages}
                onClick={() => fetchExpenseTypes(pagination.pageNumber + 1)}
              />
            </Pagination>
          </Card.Footer>
        )}
      </Card>

      {/* Add / Edit Category Modal */}
      <Modal show={openModal} onHide={() => setOpenModal(false)} centered backdrop="static">
        <Modal.Header closeButton className="border-bottom-0 pb-0">
          <Modal.Title className="fw-bold fs-5">
            <i className={`fa-solid ${editingId > 0 ? "fa-pen-to-square text-warning" : "fa-plus text-primary"} me-2`}></i>
            {editingId > 0 ? "Edit Expense Category" : "Add New Expense Category"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="pt-3">
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Category Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Electricity, Water Supply, Maintenance, Internet"
                value={formData.expenseTypeName}
                onChange={(e) => setFormData({ ...formData, expenseTypeName: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Description / Remark</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Brief description of expenses under this classification..."
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Status</Form.Label>
              <Form.Select
                value={formData.status || "Active"}
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
                  <Spinner size="sm" className="me-2" /> Saving...
                </>
              ) : editingId > 0 ? (
                "Update Category"
              ) : (
                "Save Category"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
