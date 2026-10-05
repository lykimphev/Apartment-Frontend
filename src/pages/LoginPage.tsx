import { useState, useEffect } from "react";
import { Button, Form, InputGroup, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { AuthLogin } from "../model/AuthLogin";
import { AuthService } from "../services/AuthService";

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [formData, setFormData] = useState<AuthLogin>({
    username: "",
    password: "",
  });

  // 5-Attempt & 3-Minute Lockout State
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    const saved = localStorage.getItem("login_failed_attempts");
    return saved ? parseInt(saved, 10) : 0;
  });

  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  // Initialize and tick countdown timer
  useEffect(() => {
    const checkLockout = () => {
      const lockoutUntilStr = localStorage.getItem("login_lockout_until");
      if (lockoutUntilStr) {
        const lockoutUntil = parseInt(lockoutUntilStr, 10);
        const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
        if (remaining > 0) {
          setIsLocked(true);
          setSecondsLeft(remaining);
          return true;
        } else {
          // Cooldown expired
          setIsLocked(false);
          setSecondsLeft(0);
          setFailedAttempts(0);
          localStorage.removeItem("login_lockout_until");
          localStorage.removeItem("login_failed_attempts");
        }
      }
      return false;
    };

    checkLockout();

    const interval = setInterval(() => {
      const active = checkLockout();
      if (!active) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked]);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const onLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLocked) {
      toast.error(`Account is locked. Please wait ${formatTime(secondsLeft)}.`);
      return;
    }

    if (!formData.username.trim() || !formData.password.trim()) {
      toast.warning("Please fill in both username and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await AuthService.login(formData);

      // Successful login: clear lockout tracking
      localStorage.removeItem("login_lockout_until");
      localStorage.removeItem("login_failed_attempts");
      setFailedAttempts(0);
      setIsLocked(false);

      localStorage.setItem("token", response.data.token);
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      if (response.data.roles) {
        localStorage.setItem("roles", JSON.stringify(response.data.roles));
      }

      toast.success("Welcome back! Logged in successfully.");
      navigate("/");
    } catch (error: any) {
      const errorMsg = String(error || "");

      // Check if backend locked the account or if attempts hit 5
      if (
        errorMsg.toLowerCase().includes("locked") ||
        errorMsg.toLowerCase().includes("too many failed") ||
        failedAttempts + 1 >= 5
      ) {
        const lockoutTime = Date.now() + 180 * 1000; // 3 minutes
        localStorage.setItem("login_lockout_until", lockoutTime.toString());
        localStorage.setItem("login_failed_attempts", "5");
        setFailedAttempts(5);
        setIsLocked(true);
        setSecondsLeft(180);
        toast.error("Too many failed attempts (5/5). Your account is locked for 3 minutes.");
      } else {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        localStorage.setItem("login_failed_attempts", newAttempts.toString());
        const remaining = 5 - newAttempts;
        toast.error(`Invalid credentials. ${remaining} attempt(s) remaining before a 3-minute lockout.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card p-4 p-sm-5">
        {/* Brand Header */}
        <div className="text-center mb-4">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-4 mb-3 shadow-sm"
            style={{
              width: "56px",
              height: "56px",
              background: isLocked
                ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "#ffffff",
              fontSize: "22px",
              transition: "all 0.3s ease",
            }}
          >
            <i className={`fa-solid ${isLocked ? "fa-shield-halved" : "fa-building-user"}`}></i>
          </div>
          <h3 className="fw-bold text-dark mb-1">
            {isLocked ? "Account Locked" : "Welcome Back"}
          </h3>
          <p className="text-muted small mb-0">
            {isLocked
              ? "Security protection triggered due to repeated failed logins"
              : "Sign in to access your apartment management system"}
          </p>
        </div>

        {/* Lockout Banner Alert */}
        {isLocked && (
          <Alert
            variant="danger"
            className="rounded-4 p-3 shadow-sm border-0 mb-4 text-center bg-danger bg-opacity-10 border border-danger border-opacity-25"
          >
            <div className="d-flex align-items-center justify-content-center gap-2 mb-1 fw-bold text-danger">
              <i className="fa-solid fa-clock-rotate-left fs-5"></i>
              <span>Security Lockout Active</span>
            </div>
            <div className="small text-muted mb-2">
              You entered an incorrect username or password 5 times. Please wait for the cooldown timer:
            </div>
            <div className="fs-3 fw-bold text-danger font-monospace">
              ⏳ {formatTime(secondsLeft)}
            </div>
          </Alert>
        )}

        {/* Login Form */}
        <Form onSubmit={onLogin}>
          {/* Username Input */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary mb-1">
              Username
            </Form.Label>
            <InputGroup className="login-input-group">
              <InputGroup.Text className="ps-3">
                <i className="fa-solid fa-user"></i>
              </InputGroup.Text>
              <Form.Control
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="Enter your username"
                required
                autoFocus
                disabled={loading || isLocked}
              />
            </InputGroup>
          </Form.Group>

          {/* Password Input */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary mb-1">
              Password
            </Form.Label>
            <InputGroup className="login-input-group">
              <InputGroup.Text className="ps-3">
                <i className="fa-solid fa-lock"></i>
              </InputGroup.Text>
              <Form.Control
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Enter your password"
                required
                disabled={loading || isLocked}
              />
              <InputGroup.Text
                className="pe-3 cursor-pointer"
                style={{ cursor: isLocked ? "not-allowed" : "pointer" }}
                onClick={() => !isLocked && setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                <i
                  className={`fa-solid ${
                    showPassword ? "fa-eye-slash" : "fa-eye"
                  }`}
                ></i>
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>

          {/* Remember Me & Remaining Attempts Row */}
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <Form.Check
              type="checkbox"
              id="rememberMe"
              label="Remember me"
              className="small text-muted user-select-none mb-0"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading || isLocked}
            />

            {!isLocked && failedAttempts > 0 && (
              <div
                className="d-inline-flex align-items-center gap-1.5 px-2.5 py-1 rounded-pill bg-warning bg-opacity-10 text-dark border border-warning border-opacity-25 shadow-xs"
                style={{ fontSize: "12px", fontWeight: 500 }}
              >
                <i className="fa-solid fa-triangle-exclamation text-warning" style={{ fontSize: "11px" }}></i>
                <span>
                  <strong>{5 - failedAttempts}</strong> attempt{5 - failedAttempts > 1 ? "s" : ""} left
                </span>
                <span
                  className="badge bg-warning text-dark rounded-pill ms-1"
                  style={{ fontSize: "10px", padding: "2px 6px" }}
                >
                  {failedAttempts}/5
                </span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant={isLocked ? "secondary" : "primary"}
            className={`w-100 btn-login-submit d-flex align-items-center justify-content-center gap-2 ${
              isLocked ? "bg-secondary border-secondary" : ""
            }`}
            disabled={loading || isLocked}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" />
                <span>Signing In...</span>
              </>
            ) : isLocked ? (
              <>
                <i className="fa-solid fa-lock"></i>
                <span>Locked ({formatTime(secondsLeft)})</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <i className="fa-solid fa-arrow-right fs-6"></i>
              </>
            )}
          </Button>
        </Form>
      </div>
    </div>
  );
}
