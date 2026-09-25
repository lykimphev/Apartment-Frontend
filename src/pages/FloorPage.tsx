import { useEffect, useState } from "react";
import { Button, Form, Modal, Pagination, Table,Card, Row, Col, Badge } from "react-bootstrap";
import type { FloorRes } from "../model/FloorRes";
import type { PagedResponse } from "../apis/pagedResponse";
import { FloorService } from "../services/FloorService";
import type { FloorReq } from "../model/FloorReq";
import type { Building } from "../model/Building";
import { BuildingService } from "../services/BuildingService";
import { toast } from "react-toastify";

export default function FloorPage() {
  const [pagination, setPagination] = useState<PagedResponse<FloorRes>>();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [floorId, setFloorId] = useState<number>(0);

  const resetForm: FloorReq = {
    floorNo: 0,
    buildingId: 0,
  };

  const [formData, setFormData] = useState<FloorReq>(resetForm);
  const [buildings, setBuildings] = useState<Building[]>([]);

  // 1. Get Floor By Page (Floors)
  const fetchFloor = async (page: number = 1, pageSize: number = 10) => {
    try {
      const result = await FloorService.getFloorByPage(page, pageSize);
      console.log("Floor API Result:", result.data);
      setPagination(result.data);
    } catch (error) {
      console.error(error);
    }
  };
  // 2. ទាញយកបញ្ជីអាគារ (Buildings) សម្រាប់ដាក់ក្នុង Dropdown
  const fetchAllBuilding = async () => {
    try {
      const result = await BuildingService.getBuildings(1, 100);
      console.log(result);
      setBuildings(result.data.data);
    } catch (error) {
      console.error(error);
    }
  };
  // បើក Modal បន្ថែមជាន់ថ្មី
  const addFloor = () => {
    setFormData(resetForm);
    setFloorId(0);
    setOpenModal(true);
  };

  const handleEdit = (record: FloorRes) => {
    setFormData({
      floorNo: record.floorNo,
      buildingId: record.buildingId
    });
    setFloorId(record.id);
    setOpenModal(true);
  };
  // ផ្ញើទិន្នន័យទៅរក្សាទុក (Create / Update)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (floorId > 0) {
        await FloorService.putFloor(floorId, formData);
      } else {
        await FloorService.postFloor(formData);
      }
      setOpenModal(false);
      await fetchFloor(pagination?.pageNumber, pagination?.pageSize);
      toast.success("Save Change Data Successfully.");
    } catch (error) {
      toast.error(`${error}`);
    }
    setFormData(resetForm);
    setFloorId(0);
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this record ?")) {
      try {
        const result = await FloorService.deleteFloor(id);
        setOpenModal(false);
        await fetchFloor(pagination?.pageNumber, pagination?.pageSize);
        toast.success(result.message);
      } catch (error) {
        console.error(error);
      }
      setFormData(resetForm);
    }
  };

  const handlePageChange = async (page: number) => {
    await fetchFloor(page, pagination?.pageSize);
  };

  

  useEffect(() => {
    fetchFloor(1, 10);
    fetchAllBuilding();
  }, []);

  return (
    <div className="pb-5">
      {/* Top Header Card */}
      <Card className="border-0 shadow-sm rounded-4 mb-4 bg-white p-3 p-md-4">
        <Row className="align-items-center gy-3">
          <Col md={7}>
            <div className="d-flex align-items-center gap-3">
              <div>
                <h4 className="fw-bold mb-1 text-dark">Floors</h4>
              </div>
            </div>
          </Col>
          <Col md={5} className="text-md-end">
            <Button
              variant="primary"
              onClick={addFloor}
              className="btn-add-new d-inline-flex align-items-center gap-2"
            >
              <i className="fa-solid fa-plus fs-6"></i>
              <span className="fw-semibold">Add New Floor</span>
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Form Modal (No yellow/blue icon box) */}
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
              {floorId > 0 ? "Edit Floor" : "Add New Floor"}
            </Modal.Title>
            <p className="text-muted small mb-0">
              {floorId > 0
                ? "Update existing floor information"
                : "Enter floor details to add to the directory"}
            </p>
          </div>
        </Modal.Header>
        <Modal.Body className="px-4 py-3">
          <Form onSubmit={handleSubmit} id="formfloor">
            {floorId > 0 && (
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  ID
                </Form.Label>
                <Form.Control
                  type="number"
                  disabled
                  readOnly
                  value={floorId}
                  className="bg-light fw-bold text-dark"
                />
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small text-secondary">
                Floor No <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                min={1}
                required
                value={formData.floorNo || ""}
                onChange={(e) =>
                  setFormData({ ...formData, floorNo: Number(e.target.value) })
                }
                placeholder="Enter floor number"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small text-secondary">
                Building <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                required
                value={formData.buildingId || ""}
                onChange={(e) =>
                  setFormData({ ...formData, buildingId: Number(e.target.value) })
                }
              >
                <option value="">Select Building</option>
                {buildings &&
                  buildings.map((b) => (
                    <option value={b.id} key={b.id}>
                      {b.nameEnglish}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 pb-4 px-4">
          <Button
            variant="light"
            onClick={() => setOpenModal(false)}
            className="rounded-3 px-4 fw-medium text-secondary"
            disabled={loading}
          >
            Close
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="formfloor"
            className="btn-add-new px-4 shadow-sm"
            disabled={loading}
          >
            {loading ? "Saving..." : floorId > 0 ? "Update Floor" : "Save Floor"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Main Data Table */}
      <Card className="custom-card mb-4">
        <Card.Header className="bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
          <span className="fw-semibold text-dark">All Floors</span>
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
                <th>Floor No</th>
                <th>Building</th>
                <th style={{ width: "160px" }} className="text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {pagination &&
                pagination?.data &&
                pagination?.data.map((floor) => (
                  <tr key={floor.id}>
                    <td className="fw-semibold text-secondary">{floor.id}</td>
                    <td className="fw-semibold text-dark">{floor.floorNo}</td>
                    <td className="text-dark">
                      {floor.building?.nameEnglish ||
                        floor.building?.nameKhmer ||
                        buildings.find((b) => b.id === floor.buildingId)
                          ?.nameEnglish ||
                        "N/A"}
                    </td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <Button
                          type="button"
                          className="btn-action-edit"
                          onClick={() => handleEdit(floor)}
                          title="Edit Floor"
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          className="btn-action-delete"
                          onClick={() => handleDelete(floor.id)}
                          title="Delete Floor"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
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
