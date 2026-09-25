import { Card, Col, Row, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <div className="container-fluid px-0">
      {/* Header Banner */}
      <Card className="border-0 shadow-sm rounded-4 mb-4 bg-primary text-white overflow-hidden">
        <Card.Body className="p-4 p-md-5">
          <Badge bg="light" text="primary" className="px-3 py-2 rounded-pill fw-semibold mb-3">
            <i className="fa-solid fa-circle-info me-1"></i> About System
          </Badge>
          <h2 className="fw-bold mb-2">Apartment Management System</h2>
          <p className="opacity-75 mb-0 fs-6 col-md-10">
            A centralized, enterprise-grade apartment and tenant management platform designed for efficiency, secure access control, and complete property lifecycle tracking.
          </p>
        </Card.Body>
      </Card>

      {/* Feature Cards */}
      <Row className="g-4 mb-4">
        <Col xs={12} md={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100 p-3">
            <Card.Body>
              <div
                className="rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center mb-3"
                style={{ width: "50px", height: "50px", fontSize: "22px" }}
              >
                <i className="fa-solid fa-building"></i>
              </div>
              <h5 className="fw-bold text-dark mb-2">Property Hierarchy</h5>
              <p className="text-muted small mb-0">
                Easily organize and manage multi-building complexes, configure distinct floor layouts, and track room categorizations across properties.
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100 p-3">
            <Card.Body>
              <div
                className="rounded-3 bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center mb-3"
                style={{ width: "50px", height: "50px", fontSize: "22px" }}
              >
                <i className="fa-solid fa-user-check"></i>
              </div>
              <h5 className="fw-bold text-dark mb-2">Guest & Tenant Records</h5>
              <p className="text-muted small mb-0">
                Complete digital profiles with bilingual name support (Khmer / English), passport/SSN verification, phone contact details, and photo identification.
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100 p-3">
            <Card.Body>
              <div
                className="rounded-3 bg-warning bg-opacity-10 text-warning d-flex align-items-center justify-content-center mb-3"
                style={{ width: "50px", height: "50px", fontSize: "22px" }}
              >
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <h5 className="fw-bold text-dark mb-2">Security & Access Control</h5>
              <p className="text-muted small mb-0">
                Granular Role-Based Access Control (RBAC), multi-role user assignment, secure cryptographic password hashing, and JWT token authentication.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Technical Specifications */}
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-4">
          <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
            <i className="fa-solid fa-code text-primary"></i>
            Technology Stack & Architecture
          </h5>
          <Row className="g-3">
            <Col xs={12} sm={6} md={3}>
              <div className="p-3 rounded-3 bg-light border">
                <div className="text-muted small fw-semibold">Backend API</div>
                <div className="fw-bold text-dark fs-6 mt-1">ASP.NET Core 8 Web API</div>
                <small className="text-muted">C# REST Architecture</small>
              </div>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <div className="p-3 rounded-3 bg-light border">
                <div className="text-muted small fw-semibold">Database</div>
                <div className="fw-bold text-dark fs-6 mt-1">Oracle Database XE</div>
                <small className="text-muted">Entity Framework Core 8</small>
              </div>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <div className="p-3 rounded-3 bg-light border">
                <div className="text-muted small fw-semibold">Frontend</div>
                <div className="fw-bold text-dark fs-6 mt-1">React 19 + TypeScript</div>
                <small className="text-muted">Vite + React-Bootstrap</small>
              </div>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <div className="p-3 rounded-3 bg-light border">
                <div className="text-muted small fw-semibold">Security</div>
                <div className="fw-bold text-dark fs-6 mt-1">JWT Bearer & RBAC</div>
                <small className="text-muted">PBKDF2 Password Hashing</small>
              </div>
            </Col>
          </Row>

          <div className="mt-4 pt-3 border-top d-flex flex-wrap gap-2 justify-content-between align-items-center">
            <span className="text-muted small">
              Apartment System Version 1.0.0 &bull; Year 3 Semester 1 Project
            </span>
            <div className="d-flex gap-2">
              <Link to="/" className="btn btn-primary rounded-3 px-3 py-2">
                <i className="fa-solid fa-house me-1"></i> Back to Dashboard
              </Link>
              <Link to="/guest" className="btn btn-outline-primary rounded-3 px-3 py-2">
                <i className="fa-solid fa-users me-1"></i> View Guests
              </Link>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}