import { useEffect, useState } from "react";
import type { ItemReq, ItemRes } from "../model/Item";
import type { PagedResponse } from "../apis/pagedResponse";
import { ItemService } from "../services/ItemService";
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
} from "react-bootstrap";

export default function ItemPage() {
  const emptyItem: ItemReq = {
    itemName: "",
    itemNameKH: "",
    price: 0,
    remark: "",
    status: "Active",
  };

  const [formData, setFormData] = useState<ItemReq>(emptyItem);
  const [editingId, setEditingId] = useState<number>(0);
  const [openModal, setOpenModal] = useState(false);
  const [pagination, setPagination] = useState<PagedResponse<ItemRes>>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async (page: number = 1, pageSize: number = 10) => {
    try {
      const res = await ItemService.getItems(page, pageSize);
      setPagination(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData(1, 10);
  }, []);

  const handleAdd = () => {
    setEditingId(0);
    setFormData(emptyItem);
    setOpenModal(true);
  };

  const handleEdit = (record: ItemRes) => {
    setEditingId(record.id);
    setFormData({
      itemName: record.itemName,
      itemNameKH: record.itemNameKH,
      price: record.price,
      remark: record.remark || "",
      status: record.status || "Active",
    });
    setOpenModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        const res = await ItemService.deleteItem(id);
        await fetchData(pagination?.pageNumber || 1, pagination?.pageSize || 10);
        toast.success(res.message || "Item deleted successfully!");
      } catch (error) {
        console.error(error);
        toast.error(`${error}`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId > 0) {
        await ItemService.putItem(editingId, formData);
        toast.success("Item updated successfully!");
      } else {
        await ItemService.postItem(formData);
        toast.success("New item created successfully!");
      }
      setOpenModal(false);
      await fetchData(pagination?.pageNumber || 1, pagination?.pageSize || 10);
    } catch (error) {
      toast.error(`${error}`);
    } finally {
      setIsSubmitting(false);
      setFormData(emptyItem);
      setEditingId(0);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    }));
  };

  const handlePageChange = async (page: number) => {
    await fetchData(page, pagination?.pageSize || 10);
  };

  // Filter items by search term
  const displayedItems = pagination?.data?.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.itemName?.toLowerCase().includes(term) ||
      item.itemNameKH?.toLowerCase().includes(term) ||
      item.remark?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="pb-5">
      {/* Top Header & Actions Card */}
      <Card className="border-0 shadow-sm rounded-4 mb-4 bg-white p-3 p-md-4">
        <Row className="align-items-center gy-3">
          <Col md={6}>
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-3 shadow-xs"
                style={{
                  width: "44px",
                  height: "44px",
                  backgroundColor: "#eff6ff",
                  color: "#2563eb",
                  fontSize: "20px",
                }}
              >
                <i className="fa-solid fa-boxes-stacked"></i>
              </div>
              <div>
                <h4 className="fw-bold mb-0 text-dark">Items</h4>
                <p className="text-muted small mb-0">
                  Manage apartment items, amenities, and room fixtures
                </p>
              </div>
            </div>
          </Col>

          <Col md={6}>
            <div className="d-flex flex-column flex-sm-row justify-content-md-end gap-2.5">
              <InputGroup style={{ maxWidth: "260px" }}>
                <InputGroup.Text className="bg-light border-end-0 text-muted">
                  <i className="fa-solid fa-magnifying-glass"></i>
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-light border-start-0 ps-0"
                />
              </InputGroup>

              <Button
                variant="primary"
                onClick={handleAdd}
                className="btn-add-new d-inline-flex align-items-center justify-content-center gap-2"
              >
                <i className="fa-solid fa-plus fs-6"></i>
                <span className="fw-semibold">Add New Item</span>
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Main Table Card */}
      <Card className="custom-card shadow-sm">
        <Card.Header className="bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <span className="fw-semibold text-dark">Item Inventory List</span>
            {searchTerm && (
              <Badge bg="secondary" className="bg-opacity-10 text-secondary">
                Filtered
              </Badge>
            )}
          </div>
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
                <th style={{ width: "80px" }}>ID</th>
                <th>Item Name (English)</th>
                <th>Item Name (Khmer)</th>
                <th>Price</th>
                <th>Status</th>
                <th>Remark</th>
                <th style={{ width: "160px" }} className="text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedItems && displayedItems.length > 0 ? (
                displayedItems.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-semibold text-secondary">#{item.id}</td>
                    <td className="fw-semibold text-dark">
                      {item.itemName}
                    </td>
                    <td className="text-dark">{item.itemNameKH}</td>
                    <td className="fw-bold text-success">
                      ${Number(item.price || 0).toFixed(2)}
                    </td>
                    <td>
                      <Badge
                        bg={item.status === "Active" ? "success" : "secondary"}
                        className={`px-2.5 py-1.5 rounded-pill ${
                          item.status === "Active"
                            ? "bg-opacity-10 text-success"
                            : "bg-opacity-10 text-secondary"
                        }`}
                      >
                        {item.status || "Active"}
                      </Badge>
                    </td>
                    <td className="text-muted small">
                      {item.remark || <span className="opacity-50">—</span>}
                    </td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <Button
                          type="button"
                          className="btn-action-edit"
                          onClick={() => handleEdit(item)}
                          title="Edit Item"
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          className="btn-action-delete"
                          onClick={() => handleDelete(item.id)}
                          title="Delete Item"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    <i className="fa-solid fa-box-open fs-2 mb-2 d-block text-secondary opacity-50"></i>
                    No items found. Click <strong>Add New Item</strong> above to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination className="float-end mt-3">
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

      {/* Add / Edit Modal */}
      <Modal
        show={openModal}
        onHide={() => setOpenModal(false)}
        backdrop="static"
        keyboard={false}
        centered
        className="custom-modal"
      >
        <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
          <div>
            <Modal.Title className="fw-bold fs-5 text-dark mb-1">
              {editingId > 0 ? "Edit Item" : "Add New Item"}
            </Modal.Title>
            <p className="text-muted small mb-0">
              {editingId > 0
                ? "Update inventory item details and pricing"
                : "Fill in the details to register a new item"}
            </p>
          </div>
        </Modal.Header>

        <Modal.Body className="px-4 py-3">
          <Form onSubmit={handleSubmit} id="itemForm">
            {editingId > 0 && (
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  Item ID
                </Form.Label>
                <Form.Control
                  type="text"
                  value={editingId}
                  readOnly
                  disabled
                  className="bg-light fw-bold text-dark border-1"
                />
              </Form.Group>
            )}

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small text-secondary">
                    Item Name (English) <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="itemName"
                    value={formData.itemName}
                    required
                    placeholder="e.g. Air Conditioner"
                    onChange={handleChange}
                    autoFocus
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small text-secondary">
                    Item Name (Khmer) <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="itemNameKH"
                    value={formData.itemNameKH}
                    required
                    placeholder="e.g. ម៉ាស៊ីនត្រជាក់"
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small text-secondary">
                    Price ($) <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    required
                    min="0"
                    placeholder="0.00"
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small text-secondary">
                    Status
                  </Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Damaged">Damaged</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold small text-secondary">
                Remark / Note
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="remark"
                value={formData.remark}
                placeholder="Optional notes about this item"
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0 pb-4 px-4">
          <Button
            variant="light"
            onClick={() => setOpenModal(false)}
            className="rounded-3 px-4 fw-medium text-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="itemForm"
            className="btn-add-new px-4 shadow-sm"
            disabled={isSubmitting}
          >
            <i className="fa-solid fa-check me-2"></i>
            {isSubmitting
              ? "Saving..."
              : editingId > 0
              ? "Update Item"
              : "Save Item"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
