import type { Building } from "../model/Building";
import type { PagedResponse } from "../apis/pagedResponse";
import { BuildingService } from "../services/BuildingService";
import { toast } from "react-toastify";
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
} from "react-bootstrap";

export default function BuildingPage() {
  const emptyBuilding: Building = {
    id: 0,
    nameEnglish: "",
    nameKhmer: "",
  };

  const [formData, setFormData] = useState<Building>(emptyBuilding);
  const [openModal, setOpenModal] = useState(false);
  const [pagination, setPagination] = useState<PagedResponse<Building>>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async (page: number = 1, pageSize: number = 10) => {
    try {
      const res = await BuildingService.getBuildings(page, pageSize);
      setPagination(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdd = () => {
    setFormData(emptyBuilding);
    setOpenModal(true);
  };

  const handleEdit = (record: Building) => {
    setFormData(record);
    setOpenModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this building?")) {
      try {
        const res = await BuildingService.deleteBuilding(id);
        setOpenModal(false);
        await fetchData(
          pagination?.pageNumber || 1,
          pagination?.pageSize || 10,
        );
        toast.success(res.message || "Building deleted successfully");
      } catch (error) {
        console.error(error);
        toast.error(`${error}`);
      }
      setFormData(emptyBuilding);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (formData.id > 0) {
        await BuildingService.putBuilding(formData);
        toast.success("Building updated successfully!");
      } else {
        await BuildingService.postBuilding(formData);
        toast.success("New building created successfully!");
      }
      setOpenModal(false);
      await fetchData(pagination?.pageNumber || 1, pagination?.pageSize || 10);
    } catch (error) {
      toast.error(`${error}`);
    } finally {
      setIsSubmitting(false);
      setFormData(emptyBuilding);
    }
  };

  useEffect(() => {
    fetchData(1, 10);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const handlePageChange = async (page: number) => {
    await fetchData(page, pagination?.pageSize || 10);
  };

  return (
    <div className="pb-5">
      {/* Top Header & Actions */}
      <Card className="border-0 shadow-sm rounded-4 mb-4 bg-white p-3 p-md-4">
        <Row className="align-items-center gy-3">
          <Col md={7}>
            <div className="d-flex align-items-center gap-3">
              <div>
                <h4 className="fw-bold mb-1 text-dark">Buildings</h4>
              </div>
            </div>
          </Col>
          <Col md={5} className="text-md-end">
            <Button
              variant="primary"
              onClick={handleAdd}
              className="btn-add-new d-inline-flex align-items-center gap-2"
            >
              <i className="fa-solid fa-plus fs-6"></i>
              <span className="fw-semibold">Add New Building</span>
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Form Modal */}
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
              {formData.id > 0 ? "Edit Building" : "Add New Building"}
            </Modal.Title>
            <p className="text-muted small mb-0">
              {formData.id > 0
                ? "Update existing building information"
                : "Enter building details to add to the directory"}
            </p>
          </div>
        </Modal.Header>
        <Modal.Body className="px-4 py-3">
          <Form onSubmit={handleSubmit} id="buildingForm">
            {formData.id > 0 && (
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  Building ID
                </Form.Label>
                <Form.Control
                  type="text"
                  name="id"
                  value={formData.id}
                  readOnly
                  disabled
                  className="bg-light fw-bold text-dark border-1"
                />
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small text-secondary">
                English Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="nameEnglish"
                value={formData.nameEnglish}
                required
                onChange={handleChange}
                autoFocus
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold small text-secondary">
                Khmer Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="nameKhmer"
                value={formData.nameKhmer}
                required
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
            form="buildingForm"
            className="btn-add-new px-4 shadow-sm"
            disabled={isSubmitting}
          >
            <i className="fa-solid fa-check me-2"></i>
            {isSubmitting
              ? "Saving..."
              : formData.id > 0
                ? "Update Building"
                : "Save Building"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Main Table Card */}
      <Card className="custom-card">
        <Card.Header className="bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
          <span className="fw-semibold text-dark">All Buildings</span>
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
                <th>English Name</th>
                <th>Khmer Name</th>
                <th style={{ width: "160px" }} className="text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {pagination && pagination.data && pagination.data.length > 0 ? (
                pagination.data.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-semibold text-secondary">#{item.id}</td>
                    <td className="fw-semibold text-dark">
                      {item.nameEnglish}
                    </td>
                    <td className="text-dark">{item.nameKhmer}</td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <Button
                          type="button"
                          className="btn-action-edit"
                          onClick={() => handleEdit(item)}
                          title="Edit Building"
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          className="btn-action-delete"
                          onClick={() => handleDelete(item.id)}
                          title="Delete Building"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-5 text-muted">
                    <i className="fa-solid fa-building-circle-xmark fs-2 mb-2 d-block text-secondary opacity-50"></i>
                    No buildings found. Click <strong>Add New Building</strong>{" "}
                    above to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card>
      {/* Footer */}
      {pagination && (
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
