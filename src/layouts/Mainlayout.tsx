import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Dropdown, Badge } from "react-bootstrap";

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState<boolean>(false);

  // Auto-detect which group is active based on path
  const isApartmentRoute = ["/building", "/floor", "/room"].some((p) => location.pathname.startsWith(p));
  const isSecurityRoute = ["/user", "/role", "/permission", "/user-role"].some((p) => location.pathname.startsWith(p));
  const isStaffRoute = ["/staff", "/position", "/salary", "/payslip"].some((p) => location.pathname.startsWith(p));
  const isExpenseRoute = ["/expense-type", "/expense"].some((p) => location.pathname.startsWith(p));

  // Keep all dropdown groups collapsed by default (never auto-open upon refresh)
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({
    apartment: false,
    security: false,
    staff: false,
    expense: false,
  });

  const toggleGroup = (groupKey: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  // User Profile Data
  const userJson = localStorage.getItem("user");
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const username = currentUser?.username || "Admin";
  const email = currentUser?.email || "admin@example.com";
  const fullName = currentUser?.fullName || "Alex Johnson";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("roles");
    navigate("/login");
  };

  // Helper for Top Bar Title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/") return "Dashboard Overview";
    if (path.startsWith("/building")) return "Buildings Management";
    if (path.startsWith("/floor")) return "Floors Management";
    if (path.startsWith("/room")) return "Rooms Management";
    if (path.startsWith("/item")) return "Items Management";
    if (path.startsWith("/exchange")) return "Exchange Rates";
    if (path.startsWith("/booking")) return "Bookings & Reservations";
    if (path.startsWith("/guest")) return "Guests Management";
    if (path.startsWith("/staff")) return "Staff & Employee Management";
    if (path.startsWith("/position")) return "Positions & Roles Management";
    if (path.startsWith("/salary")) return "Staff Base Salaries";
    if (path.startsWith("/payslip")) return "Monthly Payslips & Payroll";
    if (path.startsWith("/user-role")) return "User Role Assignment";
    if (path.startsWith("/user")) return "Users Management";
    if (path.startsWith("/role")) return "Roles Management";
    if (path.startsWith("/permission")) return "Permissions & Access";
    if (path.startsWith("/expense-type")) return "Expense Categories";
    if (path.startsWith("/expense")) return "Other Expenses & Receipts";
    if (path.startsWith("/about")) return "About System";
    if (path.startsWith("/privacy")) return "Privacy Policy";
    return "Apartment System";
  };

  return (
    <div className="d-flex min-vh-100 w-100" style={{ backgroundColor: "#f8fafc" }}>
      <style>{`
        .header-profile-btn::after {
          display: none !important;
        }
        .header-profile-btn:hover {
          background-color: #f1f5f9;
        }
      `}</style>
      {/* ========================================================================= */}
      {/* 1. ULTRA-CLEAN MODERN DARK SIDEBAR WITH SPACIOUS MARGINS                  */}
      {/* ========================================================================= */}
      <aside
        className="d-flex flex-column text-white shadow-sm"
        style={{
          width: collapsed ? "80px" : "265px",
          minWidth: collapsed ? "80px" : "265px",
          height: "100vh",
          backgroundColor: "#0d1b2a",
          background: "linear-gradient(180deg, #0d1b2a 0%, #08121d 100%)",
          zIndex: 1040,
          transition: "all 0.25s ease",
          position: "sticky",
          top: 0,
          left: 0,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {/* Brand Header */}
        <div
          className="d-flex align-items-center justify-content-center gap-3 px-3 border-bottom"
          style={{ borderColor: "rgba(255, 255, 255, 0.08)", height: "68px" }}
        >
          <div
            className="d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm"
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "#ffffff",
              fontSize: "18px",
            }}
          >
            <i className="fa-solid fa-hotel"></i>
          </div>
          {!collapsed && (
            <span className="fw-bold text-white fs-5 text-nowrap tracking-wide">
              Apartment<span style={{ color: "#38bdf8" }}>System</span>
            </span>
          )}
        </div>

        {/* Navigation Menu with Spacious Vertical Spacing */}
        <div
          className={`flex-grow-1 py-3 d-flex flex-column gap-1.5 overflow-y-auto ${
            collapsed ? "px-2" : "px-3"
          }`}
        >
          {/* Dashboard */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `sidebar-nav-item d-flex align-items-center rounded-3 text-decoration-none ${
                collapsed ? "justify-content-center py-2.5 px-0" : "justify-content-between px-3 py-2.5"
              } ${isActive ? "active" : ""}`
            }
            title={collapsed ? "Dashboard" : undefined}
          >
            <div className={`d-flex align-items-center ${collapsed ? "justify-content-center" : "gap-3"}`}>
              <i className="fa-solid fa-gauge-high nav-icon"></i>
              {!collapsed && <span>Dashboard</span>}
            </div>
          </NavLink>

          {/* Group 1: Apartment Structure */}
          <div className="nav-group">
            <div
              onClick={() => !collapsed && toggleGroup("apartment")}
              className={`sidebar-nav-item d-flex align-items-center rounded-3 ${
                collapsed ? "justify-content-center py-2.5 px-0" : "justify-content-between px-3 py-2.5"
              } ${isApartmentRoute && !openGroups.apartment ? "group-active" : ""}`}
              title={collapsed ? "Apartment (Expand sidebar to view options)" : undefined}
            >
              <div className={`d-flex align-items-center ${collapsed ? "justify-content-center" : "gap-3"}`}>
                <i className="fa-solid fa-building nav-icon"></i>
                {!collapsed && <span>Apartment</span>}
              </div>
              {!collapsed && (
                <i
                  className={`fa-solid ${openGroups.apartment ? "fa-chevron-down" : "fa-chevron-right"} chevron-icon`}
                ></i>
              )}
            </div>

            {/* Sub-items with clean tree line and comfortable vertical margins */}
            {!collapsed && openGroups.apartment && (
              <div className="sub-menu-tree mt-2 mb-1 d-flex flex-column gap-1.5">
                <NavLink
                  to="/building"
                  className={({ isActive }) => `sub-nav-item ${isActive ? "active" : ""}`}
                >
                  <span className="sub-dot"></span>
                  <span>Buildings</span>
                </NavLink>

                <NavLink
                  to="/floor"
                  className={({ isActive }) => `sub-nav-item ${isActive ? "active" : ""}`}
                >
                  <span className="sub-dot"></span>
                  <span>Floors</span>
                </NavLink>

                <NavLink
                  to="/room"
                  className={({ isActive }) => `sub-nav-item ${isActive ? "active" : ""}`}
                >
                  <span className="sub-dot"></span>
                  <span>Rooms</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Single Item: Products & Items */}
          <NavLink
            to="/item"
            className={({ isActive }) =>
              `sidebar-nav-item d-flex align-items-center rounded-3 text-decoration-none ${
                collapsed ? "justify-content-center py-2.5 px-0" : "justify-content-between px-3 py-2.5"
              } ${isActive ? "active" : ""}`
            }
            title={collapsed ? "Products & Items" : undefined}
          >
            <div className={`d-flex align-items-center ${collapsed ? "justify-content-center" : "gap-3"}`}>
              <i className="fa-solid fa-boxes-stacked nav-icon"></i>
              {!collapsed && <span>Items</span>}
            </div>
          </NavLink>

          {/* Single Item: Exchange Rates */}
          <NavLink
            to="/exchange"
            className={({ isActive }) =>
              `sidebar-nav-item d-flex align-items-center rounded-3 text-decoration-none ${
                collapsed ? "justify-content-center py-2.5 px-0" : "justify-content-between px-3 py-2.5"
              } ${isActive ? "active" : ""}`
            }
            title={collapsed ? "Exchange Rates" : undefined}
          >
            <div className={`d-flex align-items-center ${collapsed ? "justify-content-center" : "gap-3"}`}>
              <i className="fa-solid fa-money-bill-transfer nav-icon"></i>
              {!collapsed && <span>Exchange Rates</span>}
            </div>
          </NavLink>

          {/* Single Item: Room Bookings */}
          <NavLink
            to="/booking"
            className={({ isActive }) =>
              `sidebar-nav-item d-flex align-items-center rounded-3 text-decoration-none ${
                collapsed ? "justify-content-center py-2.5 px-0" : "justify-content-between px-3 py-2.5"
              } ${isActive ? "active" : ""}`
            }
            title={collapsed ? "Bookings & Reservations" : undefined}
          >
            <div className={`d-flex align-items-center ${collapsed ? "justify-content-center" : "gap-3"}`}>
              <i className="fa-solid fa-calendar-check nav-icon"></i>
              {!collapsed && <span>Bookings</span>}
            </div>
          </NavLink>

          {/* Single Item: Customers & Guests */}
          <NavLink
            to="/guest"
            className={({ isActive }) =>
              `sidebar-nav-item d-flex align-items-center rounded-3 text-decoration-none ${
                collapsed ? "justify-content-center py-2.5 px-0" : "justify-content-between px-3 py-2.5"
              } ${isActive ? "active" : ""}`
            }
            title={collapsed ? "Customers & Guests" : undefined}
          >
            <div className={`d-flex align-items-center ${collapsed ? "justify-content-center" : "gap-3"}`}>
              <i className="fa-solid fa-users nav-icon"></i>
              {!collapsed && <span>Guests</span>}
            </div>
          </NavLink>

          {/* Group: Staff & HR */}
          <div className="nav-group">
            <div
              onClick={() => !collapsed && toggleGroup("staff")}
              className={`sidebar-nav-item d-flex align-items-center rounded-3 ${
                collapsed ? "justify-content-center py-2.5 px-0" : "justify-content-between px-3 py-2.5"
              } ${isStaffRoute && !openGroups.staff ? "group-active" : ""}`}
              title={collapsed ? "Staff & HR" : undefined}
            >
              <div className={`d-flex align-items-center ${collapsed ? "justify-content-center" : "gap-3"}`}>
                <i className="fa-solid fa-user-tie nav-icon"></i>
                {!collapsed && <span>Staff & HR</span>}
              </div>
              {!collapsed && (
                <i
                  className={`fa-solid ${openGroups.staff ? "fa-chevron-down" : "fa-chevron-right"} chevron-icon`}
                ></i>
              )}
            </div>

            {!collapsed && openGroups.staff && (
              <div className="sub-menu-tree mt-2 mb-1 d-flex flex-column gap-1.5">
                <NavLink
                  to="/staff"
                  className={({ isActive }) => `sub-nav-item ${isActive ? "active" : ""}`}
                >
                  <span className="sub-dot"></span>
                  <span>Staff Members</span>
                </NavLink>

                <NavLink
                  to="/position"
                  className={({ isActive }) => `sub-nav-item ${isActive ? "active" : ""}`}
                >
                  <span className="sub-dot"></span>
                  <span>Positions</span>
                </NavLink>

                <NavLink
                  to="/salary"
                  className={({ isActive }) => `sub-nav-item ${isActive ? "active" : ""}`}
                >
                  <span className="sub-dot"></span>
                  <span>Base Salaries</span>
                </NavLink>

                <NavLink
                  to="/payslip"
                  className={({ isActive }) => `sub-nav-item ${isActive ? "active" : ""}`}
                >
                  <span className="sub-dot"></span>
                  <span>Monthly Payslips</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Group 3: Expenses Management */}
          <div className="nav-group">
            <div
              onClick={() => !collapsed && toggleGroup("expense")}
              className={`sidebar-nav-item d-flex align-items-center rounded-3 ${
                collapsed ? "justify-content-center py-2.5 px-0" : "justify-content-between px-3 py-2.5"
              } ${isExpenseRoute && !openGroups.expense ? "group-active" : ""}`}
              title={collapsed ? "Expenses Management" : undefined}
            >
              <div className={`d-flex align-items-center ${collapsed ? "justify-content-center" : "gap-3"}`}>
                <i className="fa-solid fa-file-invoice-dollar nav-icon"></i>
                {!collapsed && <span>Expenses</span>}
              </div>
              {!collapsed && (
                <i
                  className={`fa-solid ${openGroups.expense ? "fa-chevron-down" : "fa-chevron-right"} chevron-icon`}
                ></i>
              )}
            </div>

            {/* Sub-items with clean tree line */}
            {!collapsed && openGroups.expense && (
              <div className="sub-menu-tree mt-2 mb-1 d-flex flex-column gap-1.5">
                <NavLink
                  to="/expense"
                  className={({ isActive }) => `sub-nav-item ${isActive ? "active" : ""}`}
                >
                  <span className="sub-dot"></span>
                  <span>Other Expenses</span>
                </NavLink>

                <NavLink
                  to="/expense-type"
                  className={({ isActive }) => `sub-nav-item ${isActive ? "active" : ""}`}
                >
                  <span className="sub-dot"></span>
                  <span>Expense Categories</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Group 2: User & Security */}
          <div className="nav-group">
            <div
              onClick={() => !collapsed && toggleGroup("security")}
              className={`sidebar-nav-item d-flex align-items-center rounded-3 ${
                collapsed ? "justify-content-center py-2.5 px-0" : "justify-content-between px-3 py-2.5"
              } ${isSecurityRoute && !openGroups.security ? "group-active" : ""}`}
              title={collapsed ? "User & Security" : undefined}
            >
              <div className={`d-flex align-items-center ${collapsed ? "justify-content-center" : "gap-3"}`}>
                <i className="fa-solid fa-user-shield nav-icon"></i>
                {!collapsed && <span>User & Security</span>}
              </div>
              {!collapsed && (
                <i
                  className={`fa-solid ${openGroups.security ? "fa-chevron-down" : "fa-chevron-right"} chevron-icon`}
                ></i>
              )}
            </div>

            {/* Sub-items with clean tree line and comfortable vertical margins */}
            {!collapsed && openGroups.security && (
              <div className="sub-menu-tree mt-2 mb-1 d-flex flex-column gap-1.5">
                <NavLink
                  to="/user"
                  className={({ isActive }) => `sub-nav-item ${isActive ? "active" : ""}`}
                >
                  <span className="sub-dot"></span>
                  <span>Users</span>
                </NavLink>

                <NavLink
                  to="/role"
                  className={({ isActive }) => `sub-nav-item ${isActive ? "active" : ""}`}
                >
                  <span className="sub-dot"></span>
                  <span>Roles</span>
                </NavLink>

                <NavLink
                  to="/permission"
                  className={({ isActive }) => `sub-nav-item ${isActive ? "active" : ""}`}
                >
                  <span className="sub-dot"></span>
                  <span>Permissions</span>
                </NavLink>

                <NavLink
                  to="/user-role"
                  className={({ isActive }) => `sub-nav-item ${isActive ? "active" : ""}`}
                >
                  <span className="sub-dot"></span>
                  <span>Assign Roles</span>
                </NavLink>
              </div>
            )}
          </div>
        </div>

        {/* Collapse Button at Bottom of Sidebar */}
        <div
          className={`border-top mt-auto ${collapsed ? "px-2 py-3" : "px-3 py-3"}`}
          style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="btn btn-link text-white-50 p-2 text-decoration-none d-flex align-items-center justify-content-center gap-2 w-100 rounded-3 hover-light-bg hover-white"
            style={{ fontSize: "13px" }}
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <i
              className={`fa-solid ${collapsed ? "fa-chevron-right" : "fa-chevron-left"}`}
              style={{ width: "16px", textAlign: "center" }}
            ></i>
            {!collapsed && <span>Collapse Sidebar</span>}
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. RIGHT MAIN CONTENT AREA                                                */}
      {/* ========================================================================= */}
      <div className="d-flex flex-column flex-grow-1 min-vw-0 overflow-hidden">
        {/* Top Header Bar */}
        <header
          className="bg-white border-bottom px-4 d-flex align-items-center justify-content-between sticky-top shadow-xs"
          style={{ height: "64px", zIndex: 1020 }}
        >
          <div className="d-flex align-items-center gap-3">
            <h5 className="fw-bold mb-0 text-dark">{getPageTitle()}</h5>
          </div>

          <div className="d-flex align-items-center">
            {/* User Profile Dropdown Pill */}
            <Dropdown align="end">
              <Dropdown.Toggle
                as="div"
                className="header-profile-btn d-flex align-items-center cursor-pointer user-select-none transition-all shadow-xs"
                style={{
                  cursor: "pointer",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#ffffff",
                  padding: "7px 22px 7px 14px",
                  borderRadius: "9999px",
                  gap: "12px",
                }}
              >
                {/* Avatar with Status indicator */}
                <div className="position-relative flex-shrink-0">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-xs"
                    style={{
                      width: "38px",
                      height: "38px",
                      background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                      fontSize: "14.5px",
                    }}
                  >
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <span
                    className="position-absolute bg-success rounded-circle"
                    style={{
                      width: "10px",
                      height: "10px",
                      bottom: "1px",
                      right: "1px",
                      border: "2px solid #ffffff",
                    }}
                  ></span>
                </div>

                {/* User Name & Email */}
                <div className="text-start d-none d-sm-block lh-sm" style={{ paddingRight: "4px" }}>
                  <div
                    className="fw-bold text-dark small text-truncate"
                    style={{ fontSize: "14px", maxWidth: "160px", lineHeight: "1.25" }}
                  >
                    {fullName || username}
                  </div>
                  <div
                    className="text-muted text-truncate"
                    style={{ fontSize: "11.5px", maxWidth: "160px", marginTop: "2px" }}
                  >
                    {email}
                  </div>
                </div>

                {/* Single Clean Chevron Icon */}
                <i className="fa-solid fa-chevron-down text-muted ms-1" style={{ fontSize: "11px" }}></i>
              </Dropdown.Toggle>

              <Dropdown.Menu className="shadow-lg border-0 rounded-4 p-2 mt-2" style={{ minWidth: "240px" }}>
                {/* User Card inside Menu */}
                <div className="px-3 py-2.5 bg-light rounded-3 mb-2">
                  <div className="fw-bold text-dark small">{fullName || username}</div>
                  <div className="text-muted small text-truncate" style={{ fontSize: "12px" }}>
                    {email}
                  </div>
                  <Badge bg="primary" className="mt-1.5 px-2 py-0.5 rounded-pill fw-semibold" style={{ fontSize: "10px" }}>
                    Administrator
                  </Badge>
                </div>

                <Dropdown.Item
                  as={Link}
                  to="/user"
                  className="rounded-3 py-2 text-secondary d-flex align-items-center gap-2.5"
                >
                  <i className="fa-regular fa-user text-primary" style={{ width: "18px" }}></i>
                  <span className="small fw-semibold">My Account</span>
                </Dropdown.Item>

                <Dropdown.Item
                  as={Link}
                  to="/permission"
                  className="rounded-3 py-2 text-secondary d-flex align-items-center gap-2.5"
                >
                  <i className="fa-solid fa-shield-halved text-info" style={{ width: "18px" }}></i>
                  <span className="small fw-semibold">Permissions</span>
                </Dropdown.Item>

                <Dropdown.Item
                  as={Link}
                  to="/about"
                  className="rounded-3 py-2 text-secondary d-flex align-items-center gap-2.5"
                >
                  <i className="fa-solid fa-circle-info text-secondary" style={{ width: "18px" }}></i>
                  <span className="small fw-semibold">System Info</span>
                </Dropdown.Item>

                <Dropdown.Divider className="my-1" />

                <Dropdown.Item
                  onClick={handleLogout}
                  className="rounded-3 py-2 text-danger d-flex align-items-center gap-2.5"
                >
                  <i className="fa-solid fa-right-from-bracket" style={{ width: "18px" }}></i>
                  <span className="small fw-semibold">Sign Out</span>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow-1 p-4 overflow-y-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white border-top py-3 px-4 text-muted small mt-auto">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
            <span>
              &copy; {new Date().getFullYear()} Apartment Management System. All rights
              reserved.
            </span>
            <div className="d-flex gap-3">
              <Link to="/about" className="text-muted text-decoration-none">
                About
              </Link>
              <Link to="/privacy" className="text-muted text-decoration-none">
                Privacy Policy
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
