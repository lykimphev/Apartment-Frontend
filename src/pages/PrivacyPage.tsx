import { Card, Col, Row, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function PrivacyPage() {
  return (
    <div className="container-fluid px-0">
      {/* Header Banner */}
      <Card className="border-0 shadow-sm rounded-4 mb-4 bg-primary text-white overflow-hidden">
        <Card.Body className="p-4 p-md-5">
          <Badge bg="light" text="primary" className="px-3 py-2 rounded-pill fw-semibold mb-3">
            <i className="fa-solid fa-lock me-1"></i> Privacy & Security Policy
          </Badge>
          <h2 className="fw-bold mb-2">Data Privacy & Protection</h2>
          <p className="opacity-75 mb-0 fs-6 col-md-10">
            How guest records, identification documents, and user account information are securely stored, managed, and protected within the Apartment Management System.
          </p>
        </Card.Body>
      </Card>

      {/* Policy Sections */}
      <Row className="g-4 mb-4">
        <Col xs={12} md={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100 p-3">
            <Card.Body>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div
                  className="rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center"
                  style={{ width: "44px", height: "44px", fontSize: "20px" }}
                >
                  <i className="fa-solid fa-id-card"></i>
                </div>
                <h5 className="fw-bold text-dark mb-0">1. Guest & Tenant Data</h5>
              </div>
              <p className="text-muted small">
                We collect essential personal information required for apartment leasing and regulatory tenant registration:
              </p>
              <ul className="text-muted small ps-3 mb-0">
                <li className="mb-1">Full Legal Name and Khmer Name</li>
                <li className="mb-1">Identification numbers (National ID / SSN / Passport)</li>
                <li className="mb-1">Verified phone number and email address</li>
                <li>Physical identity photo stored securely on protected server storage</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100 p-3">
            <Card.Body>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div
                  className="rounded-3 bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center"
                  style={{ width: "44px", height: "44px", fontSize: "20px" }}
                >
                  <i className="fa-solid fa-shield-virus"></i>
                </div>
                <h5 className="fw-bold text-dark mb-0">2. Password & Token Security</h5>
              </div>
              <p className="text-muted small">
                System access credentials follow strict enterprise-level encryption and token lifecycle rules:
              </p>
              <ul className="text-muted small ps-3 mb-0">
                <li className="mb-1">Passwords are one-way hashed with salted PBKDF2 cryptographic hashing.</li>
                <li className="mb-1">Plaintext passwords are never logged or stored in the database.</li>
                <li className="mb-1">API communication is authenticated via signed JSON Web Tokens (JWT).</li>
                <li>Session tokens automatically expire and require secure re-authentication.</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100 p-3">
            <Card.Body>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div
                  className="rounded-3 bg-warning bg-opacity-10 text-warning d-flex align-items-center justify-content-center"
                  style={{ width: "44px", height: "44px", fontSize: "20px" }}
                >
                  <i className="fa-solid fa-user-lock"></i>
                </div>
                <h5 className="fw-bold text-dark mb-0">3. Role-Based Access Control</h5>
              </div>
              <p className="text-muted small">
                User permissions are strictly enforced according to assigned roles:
              </p>
              <ul className="text-muted small ps-3 mb-0">
                <li className="mb-1">Admins hold authorization to create, edit, or delete buildings, floors, and roles.</li>
                <li className="mb-1">Staff members only access guest registration and occupancy lists.</li>
                <li>Unauthorized requests are rejected with standard HTTP 401/403 status codes.</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100 p-3">
            <Card.Body>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div
                  className="rounded-3 bg-info bg-opacity-10 text-info d-flex align-items-center justify-content-center"
                  style={{ width: "44px", height: "44px", fontSize: "20px" }}
                >
                  <i className="fa-solid fa-database"></i>
                </div>
                <h5 className="fw-bold text-dark mb-0">4. Data Retention & Integrity</h5>
              </div>
              <p className="text-muted small">
                Records in the Oracle Database are protected with relational integrity constraints and transaction safety:
              </p>
              <ul className="text-muted small ps-3 mb-0">
                <li className="mb-1">Deleting a guest permanently removes their associated physical image file from storage.</li>
                <li className="mb-1">Roles assigned to active users cannot be removed to prevent orphaned security states.</li>
                <li>All data operations are logged with timestamps and execution metadata.</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Return to Dashboard Footer */}
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h6 className="fw-bold text-dark mb-1">Questions regarding data security?</h6>
            <p className="text-muted small mb-0">Review system settings or contact your system administrator.</p>
          </div>
          <Link to="/" className="btn btn-primary rounded-3 px-4 py-2">
            <i className="fa-solid fa-house me-1"></i> Back to Dashboard
          </Link>
        </Card.Body>
      </Card>
    </div>
  );
}