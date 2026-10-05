import { useEffect, useState } from "react";
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
import type { RoomTypeReq, RoomTypeRes } from "../model/RoomType";
import type { PagedResponse } from "../apis/pagedResponse";
import { RoomTypeService } from "../services/RoomTypeService";
import { toast } from "react-toastify";

export default function RoomTypePage() {
  const emptyForm: RoomTypeReq = {
    roomtypeName: "",
    roomtypeKH: "",
  };

  const [formData, setFormData] = useState<RoomTypeReq>(emptyForm);
  const [selectedId, setSelectedId] = useState<number>(0);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [pagination, setPagination] = useState<PagedResponse<RoomTypeRes>>();
  const [searchQuery, setSearchQuery] = useState<string>("");

  // 1. Fetch Room Types with Pagination
  const fetchData = async (page: number = 1, pageSize: number = 10) => {
    setLoading(true);
    try {
      const res = await RoomTypeService.getRoomTypes(page, pageSize);
      if (res && res.data) {
        setPagination(res.data);
      }
    } catch (error) {
      console.error("Error fetching room types:", error);
      toast.error("Failed to load room types.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, 10);
  }, []);

  // 2. Open Add Modal
  const handleAdd = () => {
    setFormData(emptyForm);
    setSelectedId(0);
    setOpenModal(true);
  };

  // 3. Open Edit Modal
  const handleEdit = (record: RoomTypeRes) => {
    setFormData({
      roomtypeName: record.roomtypeName,
      roomtypeKH: record.roomtypeKH,
    });
    setSelectedId(record.id);
    setOpenModal(true);
  };

  // 4. Delete Room Type
  const handleDelete = async (id: number, name: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete room type "${name}"? Rooms assigned to this type may be affected.`
      )
    ) {
      try {
        await RoomTypeService.deleteRoomType(id);
        toast.success(`Room type "${name}" deleted successfully.`);
        await fetchData(pagination?.pageNumber || 1, pagination?.pageSize || 10);
      } catch (error: any) {
        console.error("Delete room type error:", error);
        toast.error(error?.response?.data?.message || "Failed to delete room type.");
      }
    }
  };

  // 5. Submit Form (Create / Update)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.roomtypeName.trim() || !formData.roomtypeKH.trim()) {
      toast.warning("Please fill in both English and Khmer room type names.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedId > 0) {
        await RoomTypeService.putRoomType(selectedId, formData);
        toast.success("Room type updated successfully!");
      } else {
        await RoomTypeService.postRoomType(formData);
        toast.success("New room type created successfully!");
      }
      setOpenModal(false);
      setFormData(emptyForm);
      setSelectedId(0);
      await fetchData(pagination?.pageNumber || 1, pagination?.pageSize || 10);
    } catch (error: any) {
      console.error("Save room type error:", error);
      toast.error(error?.response?.data?.message || "Failed to save room type.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 6. Pagination Change
  const handlePageChange = async (page: number) => {
    await fetchData(page, pagination?.pageSize || 10);
  };

  // 7. Filter items based on search query
  const filteredData = (pagination?.data || []).filter(
    (item) =>
      item.roomtypeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.roomtypeKH?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toString().includes(searchQuery)
  );

  return (
    <div className="pb-5">
      {/* Top Header Card */}
      <Card className="border-0 shadow-sm rounded-4 mb-4 bg-white p-3 p-md-4">
        <Row className="align-items-center gy-3">
          <Col md={7}>
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center"
                style={{ width: "48px", height: "48px", fontSize: "20px" }}
              >
                <i className="fa-solid fa-shapes"></i>
              </div>
              <div>
                <h4 className="fw-bold mb-1 text-dark">Room Types (ប្រភេទបន្ទប់)</h4>
                <p className="text-muted small mb-0">
                  Manage apartment room classifications, tiers, and bilingual descriptions
                </p>
              </div>
            </div>
          </Col>
          <Col md={5} className="text-md-end">
            <Button
              variant="primary"
              onClick={handleAdd}
              className="btn-add-new d-inline-flex align-items-center gap-2 shadow-xs"
            >
              <i className="fa-solid fa-plus fs-6"></i>
              <span className="fw-semibold">Add Room Type</span>
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Main Table Card */}
      <Card className="border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        {/* Search & Actions Bar */}
        <div className="p-3 border-bottom bg-light bg-opacity-50">
          <Row className="align-items-center gy-2">
            <Col sm={6} md={4}>
              <InputGroup size="sm">
                <InputGroup.Text className="bg-white border-end-0 text-muted">
                  <i className="fa-solid fa-magnifying-glass"></i>
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search room type (English / ខ្មែរ)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-start-0 ps-0 shadow-none"
                />
                {searchQuery && (
                  <Button
                    variant="outline-secondary"
                    className="border-start-0"
                    onClick={() => setSearchQuery("")}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </Button>
                )}
              </InputGroup>
            </Col>
            <Col sm={6} md={8} className="text-sm-end">
              <Badge bg="primary" className="px-3 py-2 rounded-pill fw-semibold shadow-xs">
                Total Types: {pagination?.totalRecords || filteredData.length}
              </Badge>
            </Col>
          </Row>
        </div>

        {/* Table Content */}
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead className="table-light">
              <tr className="text-muted small fw-semibold">
                <th style={{ width: "80px" }} className="ps-4">
                  ID
                </th>
                <th>Room Type (English)</th>
                <th>Room Type (Khmer / ភាសាខ្មែរ)</th>
                <th style={{ width: "160px" }}>Status</th>
                <th style={{ width: "160px" }} className="text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-5">
                    <Spinner animation="border" variant="primary" role="status" className="mb-2" />
                    <div className="text-muted small">Loading room types...</div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-5">
                    <div className="text-muted">
                      <i className="fa-regular fa-folder-open fs-2 mb-2 d-block"></i>
                      {searchQuery
                        ? "No room types match your search query."
                        : "No room types found. Click 'Add Room Type' to create one."}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="transition-all hover-light">
                    <td className="ps-4 fw-semibold text-muted">
                      <Badge bg="light" text="dark" className="border px-2 py-1">
                        #{item.id}
                      </Badge>
                    </td>
                    <td>
                      <div className="fw-bold text-dark d-flex align-items-center gap-2">
                        <i className="fa-solid fa-door-open text-primary opacity-75"></i>
                        <span>{item.roomtypeName}</span>
                      </div>
                    </td>
                    <td>
                      <div className="fw-semibold text-secondary">
                        {item.roomtypeKH || "—"}
                      </div>
                    </td>
                    <td>
                      <Badge
                        bg="success"
                        className="bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1 rounded-pill fw-medium"
                      >
                        <i className="fa-solid fa-check-circle me-1"></i> Active
                      </Badge>
                    </td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <Button
                          type="button"
                          className="btn-action-edit"
                          onClick={() => handleEdit(item)}
                          title="Edit Room Type"
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          className="btn-action-delete"
                          onClick={() => handleDelete(item.id, item.roomtypeName)}
                          title="Delete Room Type"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center px-4 py-3 border-top bg-light bg-opacity-25">
            <span className="text-muted small">
              Page {pagination.pageNumber} of {pagination.totalPages} ({pagination.totalRecords} total records)
            </span>
            <Pagination className="mb-0 shadow-xs">
              <Pagination.Prev
                disabled={pagination.pageNumber === 1}
                onClick={() => handlePageChange(pagination.pageNumber - 1)}
              />
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <Pagination.Item
                  key={page}
                  active={page === pagination.pageNumber}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={pagination.pageNumber === pagination.totalPages}
                onClick={() => handlePageChange(pagination.pageNumber + 1)}
              />
            </Pagination>
          </div>
        )}
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        show={openModal}
        onHide={() => setOpenModal(false)}
        backdrop="static"
        keyboard={false}
        centered
        className="custom-modal"
      >
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
            <div>
              <Modal.Title className="fw-bold fs-5 text-dark mb-1 d-flex align-items-center gap-2">
                <i className={`fa-solid ${selectedId > 0 ? "fa-pen-to-square text-primary" : "fa-plus text-success"}`}></i>
                <span>{selectedId > 0 ? "Edit Room Type" : "Add New Room Type"}</span>
              </Modal.Title>
              <p className="text-muted small mb-0">
                {selectedId > 0
                  ? "Update existing room classification details"
                  : "Define a new room classification with English and Khmer names"}
              </p>
            </div>
          </Modal.Header>

          <Modal.Body className="px-4 py-3">
            <div className="d-flex flex-column gap-3">
              {/* Room Type Name (English) */}
              <Form.Group controlId="roomtypeName">
                <Form.Label className="fw-semibold small text-dark mb-1">
                  Room Type Name (English) <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  required
                  placeholder="e.g. Studio Room, 1-Bedroom Suite, VIP Luxury Suite"
                  value={formData.roomtypeName}
                  onChange={(e) =>
                    setFormData({ ...formData, roomtypeName: e.target.value })
                  }
                  className="rounded-3 shadow-none py-2"
                />
                <Form.Text className="text-muted small">
                  The primary category name shown in booking forms and reports.
                </Form.Text>
              </Form.Group>

              {/* Room Type Name (Khmer) */}
              <Form.Group controlId="roomtypeKH">
                <Form.Label className="fw-semibold small text-dark mb-1">
                  Room Type Name (Khmer / ភាសាខ្មែរ) <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  required
                  placeholder="ឧ. បន្ទប់ស្ទូឌីយោ, បន្ទប់គេងមួយ, បន្ទប់ VIP ពិសេស"
                  value={formData.roomtypeKH}
                  onChange={(e) =>
                    setFormData({ ...formData, roomtypeKH: e.target.value })
                  }
                  className="rounded-3 shadow-none py-2"
                />
                <Form.Text className="text-muted small">
                  ឈ្មោះប្រភេទបន្ទប់ជាភាសាខ្មែរ សម្រាប់បង្ហាញលើវិក្កយបត្រ និងទម្រង់បែបបទ។
                </Form.Text>
              </Form.Group>
            </div>
          </Modal.Body>

          <Modal.Footer className="border-0 pt-0 pb-4 px-4">
            <Button
              variant="outline-secondary"
              onClick={() => setOpenModal(false)}
              className="px-3 rounded-3"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting}
              className="px-4 rounded-3 d-inline-flex align-items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" animation="border" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check"></i>
                  <span>{selectedId > 0 ? "Update Room Type" : "Save Room Type"}</span>
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
