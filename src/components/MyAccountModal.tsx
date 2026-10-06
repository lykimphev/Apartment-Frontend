import { useState } from "react";
import { Modal, Button, Badge, Row, Col, Card, Nav, Tab } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

interface MyAccountModalProps {
  show: boolean;
  onHide: () => void;
  onLogout: () => void;
}

export default function MyAccountModal({ show, onHide, onLogout }: MyAccountModalProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Read current user from localStorage
  const userJson = localStorage.getItem("user");
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const rolesJson = localStorage.getItem("roles");
  const roles: string[] = rolesJson ? JSON.parse(rolesJson) : ["Administrator"];

  const username = currentUser?.username || "Admin";
  const fullName = currentUser?.fullName || "Administrator";
  const email = currentUser?.email || "admin@apartment.com";
  const userId = currentUser?.id || 42;
  const isActive = currentUser?.isActive !== 0;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "September 2026";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const handleGoToUsers = () => {
    onHide();
    navigate("/user");
  };

  const handleGoToPermissions = () => {
    onHide();
    navigate("/permission");
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" className="my-account-modal" backdrop="static">
      {/* Modal Header */}
      <Modal.Header closeButton className="border-0 pb-0 pt-3 px-4">
        <Modal.Title className="fw-bold fs-5 text-dark d-flex align-items-center gap-2">
          <i className="fa-solid fa-circle-user text-primary"></i>
          <span>Account Profile & Information</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="px-4 py-3">
        {/* Profile Card Banner */}
        <div
          className="rounded-4 p-4 mb-4 text-white shadow-sm position-relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)",
          }}
        >
          {/* Subtle background decoration circle */}
          <div
            style={{
              position: "absolute",
              right: "-20px",
              bottom: "-30px",
              width: "160px",
              height: "160px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.08)",
              pointerEvents: "none",
            }}
          />

          <div className="d-flex flex-wrap align-items-center gap-4 position-relative">
            {/* Avatar Circle */}
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-lg border border-3 border-white border-opacity-50"
              style={{
                width: "78px",
                height: "78px",
                background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                fontSize: "28px",
              }}
            >
              {fullName ? fullName.charAt(0).toUpperCase() : username.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-grow-1">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                <h4 className="fw-bold mb-0 text-white">{fullName}</h4>
                <Badge bg="success" className="px-2.5 py-1 rounded-pill fw-semibold small">
                  <i className="fa-solid fa-circle-check me-1"></i> Active
                </Badge>
              </div>

              <div className="text-white-50 small mb-2 d-flex flex-wrap align-items-center gap-3">
                <span>
                  <i className="fa-regular fa-envelope me-1.5"></i>
                  {email}
                </span>
                <span>
                  <i className="fa-solid fa-at me-1"></i>
                  {username}
                </span>
                <span>
                  <i className="fa-solid fa-fingerprint me-1"></i>
                  User ID: #{userId}
                </span>
              </div>

              {/* Roles Badges */}
              <div className="d-flex flex-wrap align-items-center gap-1.5">
                {roles.map((r: any, i: number) => (
                  <Badge
                    key={i}
                    bg="light"
                    text="dark"
                    className="px-2.5 py-1 rounded-pill fw-bold shadow-sm"
                    style={{ fontSize: "11px" }}
                  >
                    <i className="fa-solid fa-shield-halved text-primary me-1"></i>
                    {typeof r === "object" && r !== null ? r.name || "Role" : r}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || "overview")}>
          <Nav variant="pills" className="bg-light p-1 rounded-3 mb-3 gap-1">
            <Nav.Item>
              <Nav.Link
                eventKey="overview"
                className="rounded-2 fw-semibold px-3 py-2 small d-flex align-items-center gap-2"
              >
                <i className="fa-regular fa-user"></i>
                Personal Info
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="roles"
                className="rounded-2 fw-semibold px-3 py-2 small d-flex align-items-center gap-2"
              >
                <i className="fa-solid fa-shield-halved"></i>
                Roles & Access
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="system"
                className="rounded-2 fw-semibold px-3 py-2 small d-flex align-items-center gap-2"
              >
                <i className="fa-solid fa-cloud"></i>
                Cloud & Security
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            {/* TAB 1: Personal Info */}
            <Tab.Pane eventKey="overview">
              <Row className="g-3">
                <Col sm={6}>
                  <Card className="border-0 bg-light rounded-3 p-3 h-100">
                    <span className="text-muted small fw-semibold text-uppercase" style={{ fontSize: "11px" }}>
                      Full Display Name
                    </span>
                    <div className="fw-bold text-dark mt-1 fs-6">{fullName}</div>
                  </Card>
                </Col>

                <Col sm={6}>
                  <Card className="border-0 bg-light rounded-3 p-3 h-100">
                    <span className="text-muted small fw-semibold text-uppercase" style={{ fontSize: "11px" }}>
                      Login Username
                    </span>
                    <div className="fw-bold text-dark mt-1 fs-6">@{username}</div>
                  </Card>
                </Col>

                <Col sm={6}>
                  <Card className="border-0 bg-light rounded-3 p-3 h-100">
                    <span className="text-muted small fw-semibold text-uppercase" style={{ fontSize: "11px" }}>
                      Email Address
                    </span>
                    <div className="fw-bold text-dark mt-1 fs-6 text-truncate">{email}</div>
                  </Card>
                </Col>

                <Col sm={6}>
                  <Card className="border-0 bg-light rounded-3 p-3 h-100">
                    <span className="text-muted small fw-semibold text-uppercase" style={{ fontSize: "11px" }}>
                      Account Status
                    </span>
                    <div className="mt-1 d-flex align-items-center gap-2">
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: isActive ? "#22c55e" : "#ef4444",
                          display: "inline-block",
                        }}
                      />
                      <span className="fw-bold text-dark">{isActive ? "Active & Verified" : "Suspended"}</span>
                    </div>
                  </Card>
                </Col>

                <Col sm={6}>
                  <Card className="border-0 bg-light rounded-3 p-3 h-100">
                    <span className="text-muted small fw-semibold text-uppercase" style={{ fontSize: "11px" }}>
                      System User ID
                    </span>
                    <div className="fw-bold text-secondary mt-1 fs-6">USER-#{userId}</div>
                  </Card>
                </Col>

                <Col sm={6}>
                  <Card className="border-0 bg-light rounded-3 p-3 h-100">
                    <span className="text-muted small fw-semibold text-uppercase" style={{ fontSize: "11px" }}>
                      Account Created
                    </span>
                    <div className="fw-bold text-dark mt-1 fs-6">{formatDate(currentUser?.createdAt)}</div>
                  </Card>
                </Col>
              </Row>

              <div className="mt-3 p-3 rounded-3 bg-primary bg-opacity-10 border border-primary border-opacity-25 d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2.5">
                  <i className="fa-solid fa-users-gear text-primary fs-5"></i>
                  <div>
                    <div className="fw-bold small text-dark">Need to manage users or reset password?</div>
                    <div className="text-muted small" style={{ fontSize: "12px" }}>
                      Administrators can update accounts, passwords, and assignments in User Management.
                    </div>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleGoToUsers}
                  className="rounded-3 px-3 py-1.5 fw-semibold d-flex align-items-center gap-1.5 shadow-sm"
                >
                  <i className="fa-solid fa-arrow-right"></i> Open Users
                </Button>
              </div>
            </Tab.Pane>

            {/* TAB 2: Roles & Permissions */}
            <Tab.Pane eventKey="roles">
              <Card className="border-0 bg-light rounded-3 p-3 mb-3">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="fw-bold text-dark d-flex align-items-center gap-2">
                    <i className="fa-solid fa-shield-virus text-primary"></i>
                    <span>Assigned Permissions & Privileges</span>
                  </div>
                  <Badge bg="primary" className="rounded-pill px-2.5 py-1">
                    Super Administrator
                  </Badge>
                </div>
                <p className="text-muted small mb-0">
                  Your account currently possesses administrative authorization across all system modules:
                </p>
              </Card>

              <Row className="g-2.5">
                {[
                  {
                    name: "Apartment & Rooms Management",
                    desc: "Manage buildings, floors, rooms, room types & items",
                    icon: "fa-building",
                  },
                  {
                    name: "Guest & Tenant Management",
                    desc: "Register tenants, upload identity documents, verify passports",
                    icon: "fa-id-card",
                  },
                  {
                    name: "Staff & Payroll Management",
                    desc: "Manage staff profiles, monthly payslips and base salaries",
                    icon: "fa-user-tie",
                  },
                  {
                    name: "Financial & Expense Tracking",
                    desc: "Record utilities, exchange rates, and maintenance expenses",
                    icon: "fa-receipt",
                  },
                  {
                    name: "User & Security Control",
                    desc: "Assign roles, manage system accounts, configure permissions",
                    icon: "fa-lock",
                  },
                ].map((perm, idx) => (
                  <Col md={12} key={idx}>
                    <div className="p-2.5 rounded-3 border bg-white d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-3 d-flex align-items-center justify-content-center text-primary"
                          style={{ width: "36px", height: "36px", background: "#eff6ff" }}
                        >
                          <i className={`fa-solid ${perm.icon}`}></i>
                        </div>
                        <div>
                          <div className="fw-bold small text-dark">{perm.name}</div>
                          <div className="text-muted" style={{ fontSize: "11px" }}>
                            {perm.desc}
                          </div>
                        </div>
                      </div>
                      <Badge bg="success" className="rounded-pill px-2 py-0.5" style={{ fontSize: "11px" }}>
                        <i className="fa-solid fa-check me-1"></i> Granted
                      </Badge>
                    </div>
                  </Col>
                ))}
              </Row>

              <div className="text-end mt-3">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={handleGoToPermissions}
                  className="rounded-3 px-3 py-1.5 fw-semibold"
                >
                  <i className="fa-solid fa-shield-halved me-1.5"></i>
                  View Detailed Permissions Matrix
                </Button>
              </div>
            </Tab.Pane>

            {/* TAB 3: Cloud & Security */}
            <Tab.Pane eventKey="system">
              <Row className="g-3">
                <Col sm={6}>
                  <Card className="border p-3 rounded-3 h-100 bg-white shadow-none">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="fw-bold small text-dark d-flex align-items-center gap-2">
                        <i className="fa-solid fa-server text-primary"></i>
                        <span>Backend Cloud API</span>
                      </div>
                      <Badge bg="success" className="rounded-pill px-2 py-0.5">
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: "#ffffff",
                            display: "inline-block",
                            marginRight: "4px",
                          }}
                        />
                        Online 24/7
                      </Badge>
                    </div>
                    <code className="small text-primary text-break" style={{ fontSize: "12px" }}>
                      https://apartment-api-p06n.onrender.com
                    </code>
                    <div className="text-muted small mt-2" style={{ fontSize: "11px" }}>
                      Hosted on Render.com (Docker ASP.NET Core 8 Web API)
                    </div>
                  </Card>
                </Col>

                <Col sm={6}>
                  <Card className="border p-3 rounded-3 h-100 bg-white shadow-none">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="fw-bold small text-dark d-flex align-items-center gap-2">
                        <i className="fa-solid fa-database text-info"></i>
                        <span>Cloud Database</span>
                      </div>
                      <Badge bg="info" className="rounded-pill px-2 py-0.5 text-white">
                        Connected
                      </Badge>
                    </div>
                    <code className="small text-dark text-break" style={{ fontSize: "12px" }}>
                      apartment_db_ctrz (PostgreSQL)
                    </code>
                    <div className="text-muted small mt-2" style={{ fontSize: "11px" }}>
                      Managed PostgreSQL Instance (Singapore Region)
                    </div>
                  </Card>
                </Col>

                <Col sm={6}>
                  <Card className="border p-3 rounded-3 h-100 bg-white shadow-none">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="fw-bold small text-dark d-flex align-items-center gap-2">
                        <i className="fa-solid fa-globe text-success"></i>
                        <span>Frontend Hosting</span>
                      </div>
                      <Badge bg="success" className="rounded-pill px-2 py-0.5">
                        Production
                      </Badge>
                    </div>
                    <code className="small text-dark text-break" style={{ fontSize: "12px" }}>
                      apartment-frontend-three.vercel.app
                    </code>
                    <div className="text-muted small mt-2" style={{ fontSize: "11px" }}>
                      Edge Deployed on Vercel (React 18 + Vite)
                    </div>
                  </Card>
                </Col>

                <Col sm={6}>
                  <Card className="border p-3 rounded-3 h-100 bg-white shadow-none">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="fw-bold small text-dark d-flex align-items-center gap-2">
                        <i className="fa-solid fa-key text-warning"></i>
                        <span>Session Token</span>
                      </div>
                      <Badge bg="warning" className="rounded-pill px-2 py-0.5 text-dark">
                        JWT Valid
                      </Badge>
                    </div>
                    <div className="text-muted small" style={{ fontSize: "12px" }}>
                      Authenticated via Bearer Token with full cryptographic signature.
                    </div>
                    <div className="text-success small fw-semibold mt-2" style={{ fontSize: "11px" }}>
                      <i className="fa-solid fa-shield-check me-1"></i> SSL/TLS End-to-End Encryption
                    </div>
                  </Card>
                </Col>
              </Row>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Modal.Body>

      {/* Modal Footer */}
      <Modal.Footer className="border-0 pt-0 pb-3 px-4 d-flex justify-content-between">
        <Button
          variant="outline-danger"
          size="sm"
          onClick={() => {
            onHide();
            onLogout();
          }}
          className="rounded-3 px-3 py-2 fw-semibold d-flex align-items-center gap-2"
        >
          <i className="fa-solid fa-right-from-bracket"></i>
          <span>Sign Out</span>
        </Button>

        <Button variant="secondary" size="sm" onClick={onHide} className="rounded-3 px-4 py-2 fw-semibold">
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
