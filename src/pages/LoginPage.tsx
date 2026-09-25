import { useState } from "react";
import { Button, Form, InputGroup, Spinner } from "react-bootstrap";
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

  const onLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.password.trim()) {
      toast.warning("Please fill in both username and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await AuthService.login(formData);
      localStorage.setItem("token", response.data.token);
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      if (response.data.roles) {
        localStorage.setItem("roles", JSON.stringify(response.data.roles));
      }
      toast.success("Welcome back! Logged in successfully.");
      navigate("/");
    } catch (error) {
      toast.error(`${error}`);
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
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "#ffffff",
              fontSize: "22px",
            }}
          >
            <i className="fa-solid fa-building-user"></i>
          </div>
          <h3 className="fw-bold text-dark mb-1">Welcome Back</h3>
          <p className="text-muted small mb-0">
            Sign in to access your apartment management system
          </p>
        </div>

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
                disabled={loading}
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
                disabled={loading}
              />
              <InputGroup.Text
                className="pe-3 cursor-pointer"
                style={{ cursor: "pointer" }}
                onClick={() => setShowPassword(!showPassword)}
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

          {/* Remember Me & Security Notice */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Form.Check
              type="checkbox"
              id="rememberMe"
              label="Remember me"
              className="small text-muted"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-100 btn-login-submit d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" />
                <span>Signing In...</span>
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

