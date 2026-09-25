import { useEffect, useState } from "react";
import type { RoomReq, RoomRes } from "../model/Room";
import type { FloorRes } from "../model/FloorRes";
import type { RoomTypeRes } from "../model/RoomType";
import type { ItemRes } from "../model/Item";
import type { RoomDetailReq, RoomDetailRes } from "../model/RoomDetail";
import type { PagedResponse } from "../apis/pagedResponse";
import { RoomService } from "../services/RoomService";
import { FloorService } from "../services/FloorService";
import { RoomTypeService } from "../services/RoomTypeService";
import { ItemService } from "../services/ItemService";
import { RoomDetailService } from "../services/RoomDetailService";
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

export default function RoomPage() {
  const emptyRoom: RoomReq = {
    roomNo: "",
    roomtypeId: 0,
    floorId: 0,
    price: 0,
    serviceCharge: 0,
    roomKey: "",
    status: "Available",
    note: "",
  };

  const [formData, setFormData] = useState<RoomReq>(emptyRoom);
  const [editingId, setEditingId] = useState<number>(0);
  const [openModal, setOpenModal] = useState(false);
  const [pagination, setPagination] = useState<PagedResponse<RoomRes>>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Dropdown options
  const [floors, setFloors] = useState<FloorRes[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypeRes[]>([]);
  const [allItems, setAllItems] = useState<ItemRes[]>([]);

  // Room Items (RoomDetail) Modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomRes | null>(null);
  const [roomDetailsList, setRoomDetailsList] = useState<RoomDetailRes[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<number>(0);
  const [itemPrice, setItemPrice] = useState<number>(0);
  const [isAddingDetail, setIsAddingDetail] = useState(false);

  // Fetch Rooms
  const fetchRooms = async (page: number = 1, pageSize: number = 10) => {
    try {
      const res = await RoomService.getRooms(page, pageSize);
      setPagination(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch Dropdown reference data
  const fetchReferenceData = async () => {
    try {
      const [floorRes, typeRes, itemRes] = await Promise.all([
        FloorService.getAllFloors(),
        RoomTypeService.getAllRoomTypes(),
        ItemService.getAllItems(),
      ]);
      setFloors(floorRes.data || []);
      setRoomTypes(typeRes.data || []);
      setAllItems(itemRes.data || []);
    } catch (error) {
      console.error("Error fetching reference data:", error);
    }
  };

  useEffect(() => {
    fetchRooms(1, 10);
    fetchReferenceData();
  }, []);

  const handleAdd = () => {
    setEditingId(0);
    setFormData({
      ...emptyRoom,
      floorId: floors.length > 0 ? floors[0].id : 0,
      roomtypeId: roomTypes.length > 0 ? roomTypes[0].id : 0,
    });
    setOpenModal(true);
  };

  const handleEdit = (record: RoomRes) => {
    setEditingId(record.id);
    setFormData({
      roomNo: record.roomNo,
      roomtypeId: record.roomtypeId,
      floorId: record.floorId,
      price: record.price,
      serviceCharge: record.serviceCharge || 0,
      roomKey: record.roomKey || "",
      status: record.status || "Available",
      note: record.note || "",
    });
    setOpenModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        const res = await RoomService.deleteRoom(id);
        await fetchRooms(pagination?.pageNumber || 1, pagination?.pageSize || 10);
        toast.success(res.message || "Room deleted successfully!");
      } catch (error) {
        console.error(error);
        toast.error(`${error}`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.floorId || !formData.roomtypeId) {
      toast.error("Please select a Floor and Room Type.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId > 0) {
        await RoomService.putRoom(editingId, formData);
        toast.success("Room updated successfully!");
      } else {
        await RoomService.postRoom(formData);
        toast.success("New room created successfully!");
      }
      setOpenModal(false);
      await fetchRooms(pagination?.pageNumber || 1, pagination?.pageSize || 10);
    } catch (error) {
      toast.error(`${error}`);
    } finally {
      setIsSubmitting(false);
      setFormData(emptyRoom);
      setEditingId(0);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "serviceCharge" || name === "floorId" || name === "roomtypeId"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  // =========================================================================
  // Room Detail (Items inside Room) Management
  // =========================================================================
  const handleOpenRoomDetails = async (room: RoomRes) => {
    setSelectedRoom(room);
    setSelectedItemId(allItems.length > 0 ? allItems[0].id : 0);
    setItemPrice(allItems.length > 0 ? allItems[0].price : 0);
    setDetailModalOpen(true);
    await fetchRoomDetails(room.id);
  };

  const fetchRoomDetails = async (roomId: number) => {
    try {
      const res = await RoomDetailService.getAllRoomDetails();
      const details = (res.data || []).filter((d) => d.roomId === roomId);
      setRoomDetailsList(details);
    } catch (error) {
      console.error("Error fetching room details:", error);
    }
  };

  const handleItemSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const itemId = parseInt(e.target.value) || 0;
    setSelectedItemId(itemId);
    const found = allItems.find((i) => i.id === itemId);
    if (found) {
      setItemPrice(found.price || 0);
    }
  };

  const handleAddRoomItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !selectedItemId) {
      toast.error("Please select an item to assign.");
      return;
    }

    setIsAddingDetail(true);
    try {
      const req: RoomDetailReq = {
        roomId: selectedRoom.id,
        itemId: selectedItemId,
        price: itemPrice,
      };
      await RoomDetailService.postRoomDetail(req);
      toast.success("Item assigned to room successfully!");
      await fetchRoomDetails(selectedRoom.id);
    } catch (error) {
      toast.error(`${error}`);
    } finally {
      setIsAddingDetail(false);
    }
  };

  const handleDeleteRoomDetail = async (detailId: number) => {
    if (window.confirm("Remove this item from the room?")) {
      try {
        await RoomDetailService.deleteRoomDetail(detailId);
        toast.success("Item removed from room.");
        if (selectedRoom) {
          await fetchRoomDetails(selectedRoom.id);
        }
      } catch (error) {
        toast.error(`${error}`);
      }
    }
  };

  const handlePageChange = async (page: number) => {
    await fetchRooms(page, pagination?.pageSize || 10);
  };

  // Filter rooms
  const displayedRooms = pagination?.data?.filter((room) => {
    const matchesSearch =
      !searchTerm ||
      room.roomNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.roomKey?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "All" || room.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "Available":
        return <Badge bg="success" className="bg-opacity-10 text-success px-2.5 py-1.5 rounded-pill">Available</Badge>;
      case "Occupied":
        return <Badge bg="primary" className="bg-opacity-10 text-primary px-2.5 py-1.5 rounded-pill">Occupied</Badge>;
      case "Maintenance":
        return <Badge bg="warning" className="bg-opacity-10 text-warning px-2.5 py-1.5 rounded-pill">Maintenance</Badge>;
      case "Reserved":
        return <Badge bg="info" className="bg-opacity-10 text-info px-2.5 py-1.5 rounded-pill">Reserved</Badge>;
      default:
        return <Badge bg="secondary" className="bg-opacity-10 text-secondary px-2.5 py-1.5 rounded-pill">{status || "Unknown"}</Badge>;
    }
  };

  return (
    <div className="pb-5">
      {/* Top Header Card */}
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
                <i className="fa-solid fa-door-open"></i>
              </div>
              <div>
                <h4 className="fw-bold mb-0 text-dark">Rooms</h4>
                <p className="text-muted small mb-0">
                  Manage apartment rooms, floor assignments, and amenities
                </p>
              </div>
            </div>
          </Col>

          <Col md={6}>
            <div className="d-flex flex-column flex-sm-row justify-content-md-end gap-2.5">
              <Form.Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ maxWidth: "160px" }}
                className="bg-light"
              >
                <option value="All">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Reserved">Reserved</option>
              </Form.Select>

              <InputGroup style={{ maxWidth: "220px" }}>
                <InputGroup.Text className="bg-light border-end-0 text-muted">
                  <i className="fa-solid fa-magnifying-glass"></i>
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search room..."
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
                <span className="fw-semibold">Add Room</span>
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Main Table Card */}
      <Card className="custom-card shadow-sm">
        <Card.Header className="bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <span className="fw-semibold text-dark">All Rooms Directory</span>
            {(searchTerm || filterStatus !== "All") && (
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
                <th style={{ width: "70px" }}>ID</th>
                <th>Room No</th>
                <th>Floor</th>
                <th>Room Type</th>
                <th>Rent Price</th>
                <th>Service Fee</th>
                <th>Room Key</th>
                <th>Status</th>
                <th style={{ width: "230px" }} className="text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedRooms && displayedRooms.length > 0 ? (
                displayedRooms.map((room) => (
                  <tr key={room.id}>
                    <td className="fw-semibold text-secondary">#{room.id}</td>
                    <td className="fw-semibold text-dark">
                      Room {room.roomNo}
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border px-2.5 py-1.5 fw-medium">
                        Floor {room.floor?.floorNo || room.floorId}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-info bg-opacity-10 text-dark border-0 px-2.5 py-1.5 fw-medium">
                        {room.roomtype?.roomtypeName || `Type #${room.roomtypeId}`}
                      </span>
                    </td>
                    <td className="fw-bold text-success">
                      ${Number(room.price || 0).toFixed(2)}
                    </td>
                    <td className="text-muted small">
                      ${Number(room.serviceCharge || 0).toFixed(2)}
                    </td>
                    <td>
                      <code className="text-dark bg-light px-2 py-1 rounded">
                        {room.roomKey || "—"}
                      </code>
                    </td>
                    <td>{getStatusBadge(room.status)}</td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center align-items-center gap-2" style={{ gap: "8px" }}>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="rounded-2 px-2 py-1 d-flex align-items-center gap-1"
                          onClick={() => handleOpenRoomDetails(room)}
                          title="Manage Room Items & Inventory"
                        >
                          <i className="fa-solid fa-boxes-stacked"></i>
                          <span className="small">Items</span>
                        </Button>
                        <Button
                          type="button"
                          className="btn-action-edit"
                          onClick={() => handleEdit(room)}
                          title="Edit Room"
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          className="btn-action-delete"
                          onClick={() => handleDelete(room.id)}
                          title="Delete Room"
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
                    <i className="fa-solid fa-door-open fs-2 mb-2 d-block text-secondary opacity-50"></i>
                    No rooms found. Click <strong>Add Room</strong> above to create one.
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

      {/* ========================================================================= */}
      {/* 1. Add / Edit Room Modal                                                  */}
      {/* ========================================================================= */}
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
              {editingId > 0 ? "Edit Room" : "Add New Room"}
            </Modal.Title>
            <p className="text-muted small mb-0">
              {editingId > 0
                ? "Update room information, pricing, and status"
                : "Fill in the room details to register a new unit"}
            </p>
          </div>
        </Modal.Header>

        <Modal.Body className="px-4 py-3">
          <Form onSubmit={handleSubmit} id="roomForm">
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small text-secondary">
                    Room Number <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="roomNo"
                    value={formData.roomNo}
                    required
                    placeholder="e.g. 101, 202A"
                    onChange={handleChange}
                    autoFocus
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small text-secondary">
                    Room Key Code / Card ID
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="roomKey"
                    value={formData.roomKey}
                    placeholder="e.g. KEY-101 or RFID #12"
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small text-secondary">
                    Floor <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    name="floorId"
                    value={formData.floorId}
                    onChange={handleChange}
                    required
                  >
                    <option value={0}>-- Select Floor --</option>
                    {floors.map((fl) => (
                      <option key={fl.id} value={fl.id}>
                        Floor {fl.floorNo} ({fl.building?.nameEnglish || "Main Building"})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small text-secondary">
                    Room Type <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    name="roomtypeId"
                    value={formData.roomtypeId}
                    onChange={handleChange}
                    required
                  >
                    <option value={0}>-- Select Room Type --</option>
                    {roomTypes.map((rt) => (
                      <option key={rt.id} value={rt.id}>
                        {rt.roomtypeName} ({rt.roomtypeKH})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small text-secondary">
                    Monthly Rent ($) <span className="text-danger">*</span>
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

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small text-secondary">
                    Service Charge ($)
                  </Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="serviceCharge"
                    value={formData.serviceCharge}
                    min="0"
                    placeholder="0.00"
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small text-secondary">
                    Room Status
                  </Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Reserved">Reserved</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold small text-secondary">
                Room Notes / Description
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="note"
                value={formData.note}
                placeholder="Optional notes regarding this room"
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
            form="roomForm"
            className="btn-add-new px-4 shadow-sm"
            disabled={isSubmitting}
          >
            <i className="fa-solid fa-check me-2"></i>
            {isSubmitting
              ? "Saving..."
              : editingId > 0
              ? "Update Room"
              : "Save Room"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ========================================================================= */}
      {/* 2. Room Items & Inventory Detail Modal                                   */}
      {/* ========================================================================= */}
      <Modal
        show={detailModalOpen}
        onHide={() => setDetailModalOpen(false)}
        centered
        size="lg"
        className="custom-modal"
      >
        <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
          <div>
            <Modal.Title className="fw-bold fs-5 text-dark mb-1">
              Room {selectedRoom?.roomNo} — Items & Amenities
            </Modal.Title>
            <p className="text-muted small mb-0">
              Manage fixtures, furniture, and appliances assigned to this room
            </p>
          </div>
        </Modal.Header>

        <Modal.Body className="px-4 py-3">
          {/* Quick Add Form */}
          <Card className="p-3 bg-light border-0 rounded-3 mb-3">
            <Form onSubmit={handleAddRoomItem}>
              <Row className="align-items-end gy-2">
                <Col md={6}>
                  <Form.Label className="fw-semibold small text-secondary mb-1">
                    Select Item to Assign
                  </Form.Label>
                  <Form.Select
                    value={selectedItemId}
                    onChange={handleItemSelectChange}
                    required
                  >
                    {allItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.itemName} ({item.itemNameKH}) — ${Number(item.price || 0).toFixed(2)}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Label className="fw-semibold small text-secondary mb-1">
                    Item Price ($)
                  </Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(parseFloat(e.target.value) || 0)}
                    required
                    min="0"
                  />
                </Col>
                <Col md={3}>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 btn-add-new d-flex align-items-center justify-content-center gap-1.5"
                    disabled={isAddingDetail || !selectedItemId}
                  >
                    <i className="fa-solid fa-plus"></i>
                    <span>{isAddingDetail ? "Adding..." : "Assign Item"}</span>
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card>

          {/* Assigned Items Table */}
          <div className="table-responsive border rounded-3 overflow-hidden">
            <Table className="custom-table align-middle mb-0" size="sm">
              <thead className="bg-light">
                <tr>
                  <th>Item Name (English)</th>
                  <th>Item Name (Khmer)</th>
                  <th>Value / Price</th>
                  <th style={{ width: "90px" }} className="text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {roomDetailsList && roomDetailsList.length > 0 ? (
                  roomDetailsList.map((detail) => (
                    <tr key={detail.id}>
                      <td className="fw-semibold text-dark">
                        {detail.item?.itemName || `Item #${detail.itemId}`}
                      </td>
                      <td className="text-secondary">
                        {detail.item?.itemNameKH || "—"}
                      </td>
                      <td className="fw-bold text-success">
                        ${Number(detail.price || detail.item?.price || 0).toFixed(2)}
                      </td>
                      <td className="text-center">
                        <Button
                          size="sm"
                          variant="outline-danger"
                          className="rounded-2 px-2 py-1"
                          onClick={() => handleDeleteRoomDetail(detail.id)}
                          title="Remove item"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-muted">
                      <i className="fa-solid fa-boxes-stacked fs-3 mb-1 d-block opacity-50"></i>
                      No items currently assigned to this room.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0 pb-4 px-4">
          <Button
            variant="secondary"
            onClick={() => setDetailModalOpen(false)}
            className="rounded-3 px-4 fw-medium"
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
