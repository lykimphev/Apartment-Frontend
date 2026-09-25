import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Row,
  Table,
  Spinner,
} from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import type { Permission } from "../model/Permission";
import type { Role } from "../model/Role";
import { PermissionService } from "../services/PermissionService";
import { RoleService } from "../services/RoleService";

// Definition of ONLY completed modules and their subcategories
interface ModuleConfig {
  id: string;
  name: string;
  subcategories: {
    key: string;
    label: string;
    icon: string;
    actions: ("View" | "Create" | "Edit" | "Delete")[];
  }[];
}

const COMPLETED_MODULES: ModuleConfig[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    subcategories: [
      {
        key: "Dashboard",
        label: "Dashboard Analytics",
        icon: "bi bi-speedometer2",
        actions: ["View"],
      },
    ],
  },
  {
    id: "facility",
    name: "Facility & Infrastructure",
    subcategories: [
      {
        key: "Building",
        label: "Buildings",
        icon: "bi bi-building",
        actions: ["View", "Create", "Edit", "Delete"],
      },
      {
        key: "Floor",
        label: "Floors",
        icon: "bi bi-layers",
        actions: ["View", "Create", "Edit", "Delete"],
      },
      {
        key: "Roomtype",
        label: "Room Types",
        icon: "bi bi-grid-3x3-gap",
        actions: ["View", "Create", "Edit", "Delete"],
      },
    ],
  },
  {
    id: "guest",
    name: "Guests Management",
    subcategories: [
      {
        key: "Guest",
        label: "Guest Directory",
        icon: "bi bi-person-check",
        actions: ["View", "Create", "Edit", "Delete"],
      },
    ],
  },
  {
    id: "security",
    name: "System & Administration",
    subcategories: [
      {
        key: "User",
        label: "Users",
        icon: "bi bi-people",
        actions: ["View", "Create", "Edit", "Delete"],
      },
      {
        key: "Role",
        label: "Roles",
        icon: "bi bi-key",
        actions: ["View", "Create", "Edit", "Delete"],
      },
      {
        key: "Permission",
        label: "Permissions",
        icon: "bi bi-shield-check",
        actions: ["View", "Create", "Edit", "Delete"],
      },
    ],
  },
];

export default function PermissionPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [activePermKeys, setActivePermKeys] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Initialize and ensure all module permissions exist in DB
  const initializePermissions = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        RoleService.getRoles(),
        PermissionService.getAll(),
      ]);

      const fetchedRoles = rolesRes.data || [];
      let fetchedPerms = permsRes.data || [];
      setRoles(fetchedRoles);

      // Collect all required permission keys
      const requiredKeys: { name: string; desc: string }[] = [];
      COMPLETED_MODULES.forEach((mod) => {
        mod.subcategories.forEach((sub) => {
          sub.actions.forEach((act) => {
            const key = `${sub.key}.${act}`;
            requiredKeys.push({
              name: key,
              desc: `Can ${act.toLowerCase()} ${sub.label.toLowerCase()}`,
            });
          });
        });
      });

      // Auto-create any missing permissions in the DB
      const existingNames = new Set(fetchedPerms.map((p) => p.name.toLowerCase()));
      for (const req of requiredKeys) {
        if (!existingNames.has(req.name.toLowerCase())) {
          try {
            const created = await PermissionService.create({
              name: req.name,
              description: req.desc,
            });
            if (created.data) {
              fetchedPerms.push(created.data);
            }
          } catch {
            // Already exists or DB constraint
          }
        }
      }

      setAllPermissions(fetchedPerms);

      // Select initial role from URL param or first role
      const paramRoleId = searchParams.get("roleId");
      let currentRole = fetchedRoles[0] || null;
      if (paramRoleId) {
        const found = fetchedRoles.find((r) => r.id === parseInt(paramRoleId));
        if (found) currentRole = found;
      }

      setSelectedRole(currentRole);
      if (currentRole) {
        await loadRolePermissions(currentRole.id);
      }
    } catch (error) {
      console.error(error);
      toast.error(`Error loading permissions: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const loadRolePermissions = async (roleId: number) => {
    try {
      const res = await PermissionService.getByRole(roleId);
      const assigned = res.data || [];
      const keys = new Set<string>(assigned.map((p) => p.name));
      setActivePermKeys(keys);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    initializePermissions();
  }, []);

  const handleRoleChange = async (roleId: number) => {
    const role = roles.find((r) => r.id === roleId) || null;
    setSelectedRole(role);
    setSearchParams({ roleId: roleId.toString() });
    if (role) {
      await loadRolePermissions(role.id);
    }
  };

  // Toggle individual permission switch
  const handleToggle = (permKey: string) => {
    setActivePermKeys((prev) => {
      const next = new Set(prev);
      if (next.has(permKey)) {
        next.delete(permKey);
      } else {
        next.add(permKey);
      }
      return next;
    });
  };

  // Toggle all permissions inside a specific card module
  const handleToggleModule = (module: ModuleConfig) => {
    const moduleKeys: string[] = [];
    module.subcategories.forEach((sub) => {
      sub.actions.forEach((act) => {
        moduleKeys.push(`${sub.key}.${act}`);
      });
    });

    const allActive = moduleKeys.every((k) => activePermKeys.has(k));
    setActivePermKeys((prev) => {
      const next = new Set(prev);
      if (allActive) {
        moduleKeys.forEach((k) => next.delete(k));
      } else {
        moduleKeys.forEach((k) => next.add(k));
      }
      return next;
    });
  };

  // Quick Action: Select All
  const handleSelectAll = () => {
    const allKeys = new Set<string>();
    COMPLETED_MODULES.forEach((mod) => {
      mod.subcategories.forEach((sub) => {
        sub.actions.forEach((act) => {
          allKeys.add(`${sub.key}.${act}`);
        });
      });
    });
    setActivePermKeys(allKeys);
    toast.info("All permissions selected.");
  };

  // Quick Action: Deselect All
  const handleDeselectAll = () => {
    setActivePermKeys(new Set());
    toast.info("All permissions deselected.");
  };

  // Save Permissions to Backend
  const handleSave = async () => {
    if (!selectedRole) {
      toast.warning("Please select a role first.");
      return;
    }

    setIsSaving(true);
    try {
      // Map active keys to database permission IDs
      const permMap = new Map(allPermissions.map((p) => [p.name, p.id]));
      const selectedIds: number[] = [];

      activePermKeys.forEach((key) => {
        const id = permMap.get(key);
        if (id) selectedIds.push(id);
      });

      await PermissionService.assignToRole({
        roleId: selectedRole.id,
        permissionIds: selectedIds,
      });

      toast.success(`Permissions saved successfully for '${selectedRole.name}'!`);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to save permissions: ${error}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container-fluid py-4" style={{ maxWidth: "1400px" }}>
      {/* 1. TOP BANNER HEADER (Matching Image 2) */}
      <Card
        className="border-0 shadow-sm rounded-4 text-white mb-4 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)",
        }}
      >
        <Card.Body className="p-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-20 shadow-sm"
              style={{ width: "48px", height: "48px", fontSize: "22px" }}
            >
              <i className="bi bi-shield-lock-fill"></i>
            </div>
            <div>
              <h4 className="fw-bold mb-1">
                Role Permissions:{" "}
                <span className="text-warning">
                  {selectedRole ? selectedRole.name : "Select a Role"}
                </span>
              </h4>
              <div className="d-flex align-items-center gap-2 small text-white text-opacity-75">
                <i className="bi bi-info-circle"></i>
                <span>{selectedRole?.description || "Manage module access and granular user privileges"}</span>
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            {/* Role Switcher */}
            <div className="d-flex align-items-center gap-2">
              <span className="small fw-semibold text-white">Switch Role:</span>
              <Form.Select
                size="sm"
                className="rounded-3 fw-bold border-0 shadow-sm py-2 px-3"
                style={{ width: "180px" }}
                value={selectedRole?.id || ""}
                onChange={(e) => handleRoleChange(parseInt(e.target.value))}
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </Form.Select>
            </div>

            {/* Back Button */}
            <Button
              variant="light"
              size="sm"
              className="rounded-3 px-3 py-2 fw-semibold text-dark shadow-sm d-flex align-items-center gap-2"
              onClick={() => navigate("/user")}
            >
              <i className="bi bi-arrow-left"></i>
              <span>← Back to Users</span>
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* 2. QUICK ACTIONS BAR (Matching Image 2) */}
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="fw-bold text-secondary me-2 small d-flex align-items-center gap-1">
              <i className="bi bi-sliders"></i> Quick Actions:
            </span>

            {/* Select All Button */}
            <Button
              variant="outline-primary"
              size="sm"
              className="rounded-pill px-3 py-1 fw-semibold d-flex align-items-center gap-1"
              onClick={handleSelectAll}
            >
              <i className="bi bi-check-lg"></i>
              <span>✓ Select All</span>
            </Button>

            {/* Deselect All Button */}
            <Button
              variant="outline-secondary"
              size="sm"
              className="rounded-pill px-3 py-1 fw-semibold d-flex align-items-center gap-1"
              onClick={handleDeselectAll}
            >
              <i className="bi bi-x-lg"></i>
              <span>✕ Deselect All</span>
            </Button>
          </div>

          {/* Save Permissions Button */}
          <Button
            variant="primary"
            className="px-4 py-2 rounded-3 shadow-sm fw-bold d-flex align-items-center gap-2"
            style={{ backgroundColor: "#4361ee", borderColor: "#4361ee" }}
            onClick={handleSave}
            disabled={isSaving || loading}
          >
            {isSaving ? (
              <>
                <Spinner size="sm" className="me-1" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <i className="bi bi-floppy-fill"></i>
                <span>💾 Save Permissions</span>
              </>
            )}
          </Button>
        </Card.Body>
      </Card>

      {/* 3. 2x2 GRID OF PERMISSION CARDS (Matching Image 2) */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading permission matrix...</p>
        </div>
      ) : (
        <Row xs={1} lg={2} className="g-4">
          {COMPLETED_MODULES.map((mod) => (
            <Col key={mod.id}>
              <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                {/* Card Header matching Image 2 */}
                <Card.Header className="bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-folder2-open text-primary fs-5"></i>
                    <h5 className="fw-bold text-dark mb-0">{mod.name}</h5>
                  </div>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="rounded-pill px-3 py-1 fw-semibold"
                    style={{ fontSize: "12px" }}
                    onClick={() => handleToggleModule(mod)}
                  >
                    ✓ Toggle All
                  </Button>
                </Card.Header>

                {/* Subcategory Table with Switch Toggles matching Image 2 */}
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <Table className="align-middle mb-0 text-center">
                      <thead className="table-light">
                        <tr style={{ fontSize: "13px" }}>
                          <th className="text-start px-4 py-2 text-secondary">Sub Category</th>
                          <th className="py-2 text-primary" style={{ width: "90px" }}>
                            👁️ View
                          </th>
                          <th className="py-2 text-success" style={{ width: "90px" }}>
                            ➕ Create
                          </th>
                          <th className="py-2 text-warning" style={{ width: "90px" }}>
                            ✏️ Edit
                          </th>
                          <th className="py-2 text-danger" style={{ width: "90px" }}>
                            🗑️ Delete
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {mod.subcategories.map((sub) => (
                          <tr key={sub.key}>
                            {/* Sub Category Name */}
                            <td className="text-start px-4 py-3">
                              <div className="d-flex align-items-center gap-2">
                                <i className={`${sub.icon} text-primary`}></i>
                                <span className="fw-bold text-dark">{sub.label}</span>
                              </div>
                            </td>

                            {/* View Switch */}
                            <td>
                              {sub.actions.includes("View") ? (
                                <div className="d-flex justify-content-center">
                                  <Form.Check
                                    type="switch"
                                    id={`switch-${sub.key}-View`}
                                    checked={activePermKeys.has(`${sub.key}.View`)}
                                    onChange={() => handleToggle(`${sub.key}.View`)}
                                  />
                                </div>
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </td>

                            {/* Create Switch */}
                            <td>
                              {sub.actions.includes("Create") ? (
                                <div className="d-flex justify-content-center">
                                  <Form.Check
                                    type="switch"
                                    id={`switch-${sub.key}-Create`}
                                    checked={activePermKeys.has(`${sub.key}.Create`)}
                                    onChange={() => handleToggle(`${sub.key}.Create`)}
                                  />
                                </div>
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </td>

                            {/* Edit Switch */}
                            <td>
                              {sub.actions.includes("Edit") ? (
                                <div className="d-flex justify-content-center">
                                  <Form.Check
                                    type="switch"
                                    id={`switch-${sub.key}-Edit`}
                                    checked={activePermKeys.has(`${sub.key}.Edit`)}
                                    onChange={() => handleToggle(`${sub.key}.Edit`)}
                                  />
                                </div>
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </td>

                            {/* Delete Switch */}
                            <td>
                              {sub.actions.includes("Delete") ? (
                                <div className="d-flex justify-content-center">
                                  <Form.Check
                                    type="switch"
                                    id={`switch-${sub.key}-Delete`}
                                    checked={activePermKeys.has(`${sub.key}.Delete`)}
                                    onChange={() => handleToggle(`${sub.key}.Delete`)}
                                  />
                                </div>
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
