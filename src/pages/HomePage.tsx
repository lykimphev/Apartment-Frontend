import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Row,
  Table,
  Badge,
  Spinner,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import type { Guest } from "../model/Guest";
import type { Building } from "../model/Building";
import type { Role } from "../model/Role";
import { GuestService } from "../services/GuestService";
import { BuildingService } from "../services/BuildingService";
import { FloorService } from "../services/FloorService";
import { UserService } from "../services/UserService";
import { RoleService } from "../services/RoleService";

export default function HomePage() {
  const [stats, setStats] = useState({
    totalBuildings: 0,
    totalFloors: 0,
    totalGuests: 0,
    totalUsers: 0,
    totalRoles: 0,
  });

  const [recentGuests, setRecentGuests] = useState<Guest[]>([]);
  const [buildingsList, setBuildingsList] = useState<Building[]>([]);
  const [rolesList, setRolesList] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    const cleanPath = imagePath.replace(/\\/g, "/");
    return `http://localhost:5000/${cleanPath.startsWith("/") ? cleanPath.slice(1) : cleanPath}`;
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [
        buildingsRes,
        floorsRes,
        guestsRes,
        usersRes,
        rolesRes,
      ] = await Promise.all([
        BuildingService.getBuildings(1, 10).catch(() => ({ data: { totalRecords: 0, data: [] } })),
        FloorService.getFloorByPage(1, 10).catch(() => ({ data: { totalRecords: 0, data: [] } })),
        GuestService.getAllGuests().catch(() => ({ data: [] })),
        UserService.getAllUsers().catch(() => ({ data: [] })),
        RoleService.getRoles().catch(() => ({ data: [] })),
      ]);

      const guests = guestsRes.data || [];
      const buildings = buildingsRes.data?.data || [];
      const roles = rolesRes.data || [];
      const users = usersRes.data || [];

      setStats({
        totalBuildings: buildingsRes.data?.totalRecords || buildings.length,
        totalFloors: floorsRes.data?.totalRecords || 0,
        totalGuests: guests.length,
        totalUsers: users.length,
        totalRoles: roles.length,
      });

      // Keep recent 5 guests
      setRecentGuests(guests.slice(0, 5));
      setBuildingsList(buildings.slice(0, 5));
      setRolesList(roles.slice(0, 5));
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="container-fluid px-0">
      {/* Welcome Banner */}
      <Card className="border-0 shadow-sm rounded-4 mb-4 bg-primary text-white overflow-hidden position-relative">
        <Card.Body className="p-4 p-md-5">
          <Row className="align-items-center">
            <Col xs={12} md={8}>
              <Badge bg="light" text="primary" className="px-3 py-2 rounded-pill fw-semibold mb-3">
                <i className="fa-solid fa-hotel me-1"></i> Apartment Management System
              </Badge>
              <h2 className="fw-bold mb-2 text-white" style={{ color: "#ffffff" }}>
                Welcome to Your Dashboard
              </h2>
              <p className="mb-0 fs-6 text-white" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                Monitor your buildings, manage tenant guests, and control user access from a centralized interface.
              </p>
            </Col>
            <Col xs={12} md={4} className="text-md-end mt-3 mt-md-0">
              <Button
                variant="light"
                onClick={fetchDashboardData}
                disabled={loading}
                className="px-4 py-2 rounded-3 fw-medium shadow-sm d-inline-flex align-items-center gap-2"
              >
                <i className={`fa-solid fa-arrows-rotate ${loading ? "fa-spin" : ""}`}></i>
                Refresh Data
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* KPI Stats Cards */}
      <Row className="g-3 mb-4">
        {/* Buildings Card */}
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100 transition-hover">
            <Card.Body className="p-4 d-flex align-items-center">
              <div
                className="rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center me-3"
                style={{ width: "56px", height: "56px", fontSize: "24px" }}
              >
                <i className="fa-solid fa-building"></i>
              </div>
              <div className="flex-grow-1">
                <div className="text-muted small fw-semibold text-uppercase">Buildings</div>
                <h3 className="fw-bold text-dark mb-0">
                  {loading ? <Spinner animation="border" size="sm" /> : stats.totalBuildings}
                </h3>
              </div>
              <Link to="/building" className="text-primary text-decoration-none small">
                <i className="fa-solid fa-chevron-right fs-6"></i>
              </Link>
            </Card.Body>
          </Card>
        </Col>

        {/* Floors Card */}
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100 transition-hover">
            <Card.Body className="p-4 d-flex align-items-center">
              <div
                className="rounded-3 bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center me-3"
                style={{ width: "56px", height: "56px", fontSize: "24px" }}
              >
                <i className="fa-solid fa-layer-group"></i>
              </div>
              <div className="flex-grow-1">
                <div className="text-muted small fw-semibold text-uppercase">Floors</div>
                <h3 className="fw-bold text-dark mb-0">
                  {loading ? <Spinner animation="border" size="sm" /> : stats.totalFloors}
                </h3>
              </div>
              <Link to="/floor" className="text-success text-decoration-none small">
                <i className="fa-solid fa-chevron-right fs-6"></i>
              </Link>
            </Card.Body>
          </Card>
        </Col>

        {/* Guests Card */}
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100 transition-hover">
            <Card.Body className="p-4 d-flex align-items-center">
              <div
                className="rounded-3 bg-info bg-opacity-10 text-info d-flex align-items-center justify-content-center me-3"
                style={{ width: "56px", height: "56px", fontSize: "24px" }}
              >
                <i className="fa-solid fa-user-check"></i>
              </div>
              <div className="flex-grow-1">
                <div className="text-muted small fw-semibold text-uppercase">Guests</div>
                <h3 className="fw-bold text-dark mb-0">
                  {loading ? <Spinner animation="border" size="sm" /> : stats.totalGuests}
                </h3>
              </div>
              <Link to="/guest" className="text-info text-decoration-none small">
                <i className="fa-solid fa-chevron-right fs-6"></i>
              </Link>
            </Card.Body>
          </Card>
        </Col>

        {/* Users & Roles Card */}
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100 transition-hover">
            <Card.Body className="p-4 d-flex align-items-center">
              <div
                className="rounded-3 bg-warning bg-opacity-10 text-warning d-flex align-items-center justify-content-center me-3"
                style={{ width: "56px", height: "56px", fontSize: "24px" }}
              >
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <div className="flex-grow-1">
                <div className="text-muted small fw-semibold text-uppercase">Users / Roles</div>
                <h3 className="fw-bold text-dark mb-0">
                  {loading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    `${stats.totalUsers} / ${stats.totalRoles}`
                  )}
                </h3>
              </div>
              <Link to="/user-role" className="text-warning text-decoration-none small">
                <i className="fa-solid fa-chevron-right fs-6"></i>
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions Shortcuts */}
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-4">
          <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
            <i className="fa-solid fa-bolt text-primary"></i>
            Quick Actions
          </h5>
          <div className="d-flex flex-wrap gap-2">
            <Link to="/guest" className="btn btn-outline-primary rounded-3 px-3 py-2 d-flex align-items-center gap-2">
              <i className="fa-solid fa-user-plus"></i> Register Guest
            </Link>
            <Link to="/building" className="btn btn-outline-primary rounded-3 px-3 py-2 d-flex align-items-center gap-2">
              <i className="fa-solid fa-plus"></i> Add Building
            </Link>
            <Link to="/floor" className="btn btn-outline-primary rounded-3 px-3 py-2 d-flex align-items-center gap-2">
              <i className="fa-solid fa-layer-group"></i> Manage Floors
            </Link>
            <Link to="/user" className="btn btn-outline-secondary rounded-3 px-3 py-2 d-flex align-items-center gap-2">
              <i className="fa-solid fa-users"></i> Add User
            </Link>
            <Link to="/role" className="btn btn-outline-secondary rounded-3 px-3 py-2 d-flex align-items-center gap-2">
              <i className="fa-solid fa-shield-halved"></i> Roles
            </Link>
            <Link to="/user-role" className="btn btn-outline-secondary rounded-3 px-3 py-2 d-flex align-items-center gap-2">
              <i className="fa-solid fa-user-gear"></i> Assign Roles
            </Link>
          </div>
        </Card.Body>
      </Card>

      {/* Main Content Grid */}
      <Row className="g-4">
        {/* Recent Guests Section */}
        <Col xs={12} lg={8}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                  <i className="fa-solid fa-users text-primary"></i>
                  Recent Registered Guests
                </h5>
                <Link to="/guest" className="btn btn-sm btn-link text-decoration-none fw-semibold">
                  View All Guests &rarr;
                </Link>
              </div>

              <div className="table-responsive rounded-3 border">
                <Table hover className="align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="py-3 px-3 text-secondary">Guest</th>
                      <th className="py-3 px-3 text-secondary">Gender</th>
                      <th className="py-3 px-3 text-secondary">Phone</th>
                      <th className="py-3 px-3 text-secondary text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-muted">
                          <Spinner animation="border" size="sm" className="me-2" />
                          Loading recent guests...
                        </td>
                      </tr>
                    ) : recentGuests.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-muted">
                          No guests registered yet.
                        </td>
                      </tr>
                    ) : (
                      recentGuests.map((guest) => (
                        <tr key={guest.id}>
                          <td className="px-3">
                            <div className="d-flex align-items-center gap-2">
                              {guest.imagePath ? (
                                <img
                                  src={getImageUrl(guest.imagePath)}
                                  alt={guest.name}
                                  className="rounded-circle object-fit-cover shadow-sm border"
                                  style={{ width: "36px", height: "36px" }}
                                />
                              ) : (
                                <div
                                  className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold"
                                  style={{ width: "36px", height: "36px", fontSize: "14px" }}
                                >
                                  {guest.name?.charAt(0).toUpperCase() || "G"}
                                </div>
                              )}
                              <div>
                                <div className="fw-semibold text-dark">{guest.name}</div>
                                {guest.nameKH && (
                                  <small className="text-muted">{guest.nameKH}</small>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 text-dark">{guest.gender || "—"}</td>
                          <td className="px-3 text-muted">{guest.phone || "—"}</td>
                          <td className="px-3 text-center">
                            <Badge
                              bg={guest.status?.toLowerCase() === "active" ? "success" : "secondary"}
                              className="px-2 py-1 rounded-pill fw-normal"
                            >
                              {guest.status || "Active"}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Side Overview Column */}
        <Col xs={12} lg={4}>
          <div className="d-flex flex-column gap-4">
            {/* Buildings Summary Card */}
            <Card className="border-0 shadow-sm rounded-4">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                    <i className="fa-solid fa-building text-primary"></i>
                    Buildings
                  </h6>
                  <Link to="/building" className="text-decoration-none small fw-semibold">
                    View All
                  </Link>
                </div>

                {loading ? (
                  <div className="text-center py-3 text-muted">
                    <Spinner animation="border" size="sm" />
                  </div>
                ) : buildingsList.length === 0 ? (
                  <p className="text-muted small mb-0">No buildings created yet.</p>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {buildingsList.map((b) => (
                      <div
                        key={b.id}
                        className="p-3 rounded-3 bg-light d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <div className="fw-semibold text-dark">{b.nameEnglish}</div>
                          {b.nameKhmer && (
                            <small className="text-muted">{b.nameKhmer}</small>
                          )}
                        </div>
                        <Badge bg="primary" className="rounded-pill px-2 py-1">
                          ID: {b.id}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Roles Summary Card */}
            <Card className="border-0 shadow-sm rounded-4">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                    <i className="fa-solid fa-shield-halved text-warning"></i>
                    System Roles
                  </h6>
                  <Link to="/role" className="text-decoration-none small fw-semibold">
                    Manage
                  </Link>
                </div>

                {loading ? (
                  <div className="text-center py-3 text-muted">
                    <Spinner animation="border" size="sm" />
                  </div>
                ) : rolesList.length === 0 ? (
                  <p className="text-muted small mb-0">No roles defined.</p>
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    {rolesList.map((r) => (
                      <Badge
                        key={r.id}
                        bg={r.isActive === 1 ? "primary" : "secondary"}
                        className="p-2 rounded-3 fw-medium d-flex align-items-center gap-1"
                      >
                        <i className="fa-solid fa-key small"></i>
                        {r.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
}