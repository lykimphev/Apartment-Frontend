import { useEffect, useState } from "react";
import type { ExchangeReq, ExchangeRes } from "../model/Exchange";
import { ExchangeService } from "../services/ExchangeService";
import { toast } from "react-toastify";
import {
  Button,
  Form,
  Modal,
  Table,
  Card,
  Badge,
  Row,
  Col,
  InputGroup,
  Spinner,
} from "react-bootstrap";

export default function ExchangePage() {
  const [exchanges, setExchanges] = useState<ExchangeRes[]>([]);
  const [activeExchange, setActiveExchange] = useState<ExchangeRes | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Quick Calculator State
  const [calcUsd, setCalcUsd] = useState<number>(100);

  // Form State
  const [formData, setFormData] = useState<ExchangeReq>({
    rate: 4050,
    status: "Active",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allRes, activeRes] = await Promise.all([
        ExchangeService.getAll(),
        ExchangeService.getActive(),
      ]);
      setExchanges(allRes.data || []);
      setActiveExchange(activeRes.data || null);
      if (activeRes.data?.rate) {
        setFormData((prev) => ({ ...prev, rate: activeRes.data.rate }));
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load exchange rates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      rate: activeExchange?.rate || 4050,
      status: "Active",
    });
    setOpenModal(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.rate || formData.rate <= 0) {
      toast.warning("Please enter a valid exchange rate.");
      return;
    }

    setIsSubmitting(true);
    try {
      await ExchangeService.create(formData);
      toast.success("New exchange rate updated successfully!");
      setOpenModal(false);
      await fetchData();
    } catch (error) {
      toast.error(`${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format Date cleanly
  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? dateString : d.toLocaleString("en-GB");
  };

  const activeRateValue = activeExchange?.rate || 4050;
  const calculatedRiel = calcUsd * activeRateValue;

  return (
    <div className="pb-5">
      {/* Top Header Card */}
      <Card className="border-0 shadow-sm rounded-4 mb-4 bg-white p-3 p-md-4">
        <Row className="align-items-center gy-3">
          <Col md={7}>
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-3 shadow-xs"
                style={{
                  width: "48px",
                  height: "48px",
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "#ffffff",
                  fontSize: "22px",
                }}
              >
                <i className="fa-solid fa-money-bill-transfer"></i>
              </div>
              <div>
                <h4 className="fw-bold mb-1 text-dark">Exchange Rates</h4>
                <p className="text-muted small mb-0">
                  Manage official currency exchange rates (USD ⇄ KHR) for rentals & bookings
                </p>
              </div>
            </div>
          </Col>

          <Col md={5} className="text-md-end">
            <Button
              variant="success"
              onClick={handleOpenAdd}
              className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3 shadow-sm text-white fw-semibold"
            >
              <i className="fa-solid fa-plus fs-6"></i>
              <span>Set New Market Rate</span>
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Hero Stats & Quick Calculator Row */}
      <Row className="g-4 mb-4">
        {/* Current Active Rate Card */}
        <Col lg={7}>
          <Card
            className="border-0 shadow-sm rounded-4 text-white h-100 p-4"
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            }}
          >
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <span className="text-white-50 small text-uppercase tracking-wider fw-semibold">
                  Official Active Rate
                </span>
                <h5 className="fw-bold text-white mb-0 mt-1">Current Exchange Rate</h5>
              </div>
              <Badge
                bg="success"
                className="px-3 py-1.5 rounded-pill fw-semibold fs-7 shadow-xs"
              >
                <i className="fa-solid fa-circle-check me-1"></i> Live Active
              </Badge>
            </div>

            <div className="d-flex align-items-baseline gap-3 my-2">
              <span className="fs-1 fw-bolder text-white">1 USD</span>
              <span className="fs-3 text-secondary">=</span>
              <span className="fs-1 fw-bolder text-warning">
                {activeRateValue.toLocaleString()} ៛
              </span>
            </div>

            <div className="border-top border-secondary border-opacity-25 pt-3 mt-3 d-flex justify-content-between align-items-center text-white-50 small">
              <span>
                <i className="fa-regular fa-clock me-1.5"></i>
                Effective Date: {formatDate(activeExchange?.date)}
              </span>
              <span>Record ID: #{activeExchange?.id || "—"}</span>
            </div>
          </Card>
        </Col>

        {/* Quick Calculator Card */}
        <Col lg={5}>
          <Card className="border-0 shadow-sm rounded-4 bg-white h-100 p-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <i className="fa-solid fa-calculator text-primary fs-5"></i>
              <h6 className="fw-bold mb-0 text-dark">Quick Currency Converter</h6>
            </div>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-muted mb-1">
                Enter Amount (USD $)
              </Form.Label>
              <InputGroup>
                <InputGroup.Text className="bg-light fw-bold text-secondary">
                  $
                </InputGroup.Text>
                <Form.Control
                  type="number"
                  min="0"
                  step="any"
                  value={calcUsd}
                  onChange={(e) => setCalcUsd(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 100"
                  className="fw-bold"
                />
              </InputGroup>
            </Form.Group>

            <div
              className="rounded-3 p-3 text-center border"
              style={{ backgroundColor: "#f8fafc" }}
            >
              <span className="text-muted small">Converted Value in Cambodian Riel:</span>
              <div className="fs-3 fw-bold text-success mt-1">
                {calculatedRiel.toLocaleString()} ៛
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Historical Rates Table Card */}
      <Card className="custom-card shadow-sm rounded-4 border-0 bg-white">
        <Card.Header className="bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <i className="fa-solid fa-clock-rotate-left text-muted"></i>
            <span className="fw-semibold text-dark">Historical Exchange Rate Logs</span>
          </div>
          <Badge bg="secondary" className="bg-opacity-10 text-secondary px-3 py-1.5 rounded-pill">
            Total Logs: {exchanges.length}
          </Badge>
        </Card.Header>

        <div className="table-responsive">
          <Table className="custom-table align-middle mb-0" hover>
            <thead>
              <tr>
                <th style={{ width: "80px" }}>ID</th>
                <th>Effective Date</th>
                <th>Exchange Rate (1 USD)</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    <Spinner animation="border" size="sm" variant="primary" />
                    <span className="ms-2 text-muted">Loading exchange rates...</span>
                  </td>
                </tr>
              ) : exchanges.length > 0 ? (
                exchanges.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-semibold text-secondary">#{item.id}</td>
                    <td className="fw-medium text-dark">{formatDate(item.date)}</td>
                    <td>
                      <span className="fw-bold text-dark fs-6">
                        {Number(item.rate).toLocaleString()} ៛
                      </span>
                    </td>
                    <td>
                      <Badge
                        bg={item.status === "Active" ? "success" : "secondary"}
                        className={`px-3 py-1.5 rounded-pill ${
                          item.status === "Active"
                            ? "bg-opacity-10 text-success"
                            : "bg-opacity-10 text-secondary"
                        }`}
                      >
                        {item.status === "Active" ? "● Active Rate" : "Inactive (Archived)"}
                      </Badge>
                    </td>
                    <td className="small text-muted">
                      {item.status === "Active"
                        ? "Currently used in new bookings & invoices"
                        : "Historical rate record"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted">
                    No exchange rate records found. Click "Set New Market Rate" to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* Modal: Set New Exchange Rate */}
      <Modal show={openModal} onHide={() => setOpenModal(false)} centered backdrop="static">
        <Modal.Header closeButton className="border-bottom px-4 py-3">
          <Modal.Title className="fw-bold text-dark fs-5">
            <i className="fa-solid fa-plus-circle text-success me-2"></i>
            Set New Exchange Rate
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSubmit}>
          <Modal.Body className="p-4">
            <div className="alert alert-info py-2 px-3 small rounded-3 mb-3 border-0 bg-info bg-opacity-10 text-info-emphasis">
              <i className="fa-solid fa-circle-info me-1.5"></i>
              Setting this rate as <strong>Active</strong> will automatically mark previous rates as <strong>Inactive</strong>.
            </div>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small text-secondary mb-1">
                Rate in Cambodian Riel (៛ per 1 USD) <span className="text-danger">*</span>
              </Form.Label>
              <InputGroup>
                <Form.Control
                  type="number"
                  min="1"
                  required
                  value={formData.rate}
                  onChange={(e) =>
                    setFormData({ ...formData, rate: parseInt(e.target.value) || 0 })
                  }
                  placeholder="e.g. 4050"
                  className="fw-bold text-dark"
                  autoFocus
                />
                <InputGroup.Text className="bg-light fw-semibold">៛ / $1</InputGroup.Text>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small text-secondary mb-1">Status</Form.Label>
              <Form.Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active (Apply immediately)</option>
                <option value="Inactive">Inactive (Draft/Archived)</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer className="border-top px-4 py-3 bg-light">
            <Button variant="outline-secondary" onClick={() => setOpenModal(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="success" type="submit" disabled={isSubmitting} className="text-white fw-semibold">
              {isSubmitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Updating...
                </>
              ) : (
                "Save & Apply Rate"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
