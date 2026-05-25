import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Search, Users, X } from "lucide-react";

function initials(name = "") {
  return (
    name
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "--"
  );
}

const AVATAR_COLORS = [
  { bg: "rgba(56,189,248,0.12)", color: "#38bdf8" },
  { bg: "rgba(251,191,36,0.12)", color: "#fbbf24" },
  { bg: "rgba(167,139,250,0.12)", color: "#a78bfa" },
  { bg: "rgba(52,211,153,0.12)", color: "#34d399" },
  { bg: "rgba(248,113,113,0.12)", color: "#f87171" },
];

function avatarColor(name = "") {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

export default function Peserta() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://127.0.0.1:8000/api/users", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setUsers(response.data.data || []);
      } catch (err) {
        console.log(err);
        setError(err.response?.data?.message || "Gagal memuat data user.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const roles = useMemo(
    () => [...new Set(users.map((u) => u.role).filter(Boolean))],
    [users],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((user) => {
      const matchSearch =
        !q ||
        user.name?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.username?.toLowerCase().includes(q);
      const matchRole = filterRole === "all" || user.role === filterRole;
      const matchStatus =
        filterStatus === "all" || user.status === filterStatus;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, filterRole, filterStatus]);

  const hasActiveFilter =
    search !== "" || filterRole !== "all" || filterStatus !== "all";

  const clearFilters = () => {
    setSearch("");
    setFilterRole("all");
    setFilterStatus("all");
  };

  return (
    <div className="min-h-full">
      <div
        style={{
          background: "#0f172a",
          border: "0.5px solid rgba(255,255,255,0.07)",
          borderRadius: "14px",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "0.5px solid rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Users size={16} style={{ color: "#64748b" }} />
            <span
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "#e2e8f0",
              }}
            >
              Daftar user
            </span>
          </div>
          <span
            style={{
              fontSize: "11px",
              color: "#64748b",
              background: "rgba(255,255,255,0.05)",
              border: "0.5px solid rgba(255,255,255,0.08)",
              borderRadius: "999px",
              padding: "3px 10px",
            }}
          >
            {filtered.length}
            {hasActiveFilter && users.length !== filtered.length
              ? ` dari ${users.length}`
              : ""}{" "}
            user
          </span>
        </div>

        {/* Filter Bar */}
        <div
          style={{
            padding: "10px 20px",
            borderBottom: "0.5px solid rgba(255,255,255,0.07)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "8px",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          {/* Search */}
          <div
            style={{
              position: "relative",
              flex: 1,
              minWidth: 160,
              maxWidth: 280,
            }}
          >
            <Search
              size={13}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#475569",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              placeholder="Cari nama, email, username…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "7px 10px 7px 30px",
                fontSize: "12px",
                background: "rgba(255,255,255,0.05)",
                border: "0.5px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
                color: "#cbd5e1",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Role filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={{
              fontSize: "12px",
              padding: "7px 10px",
              background: "rgba(255,255,255,0.05)",
              border: "0.5px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              color: "#94a3b8",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="all">Semua role</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              fontSize: "12px",
              padding: "7px 10px",
              background: "rgba(255,255,255,0.05)",
              border: "0.5px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              color: "#94a3b8",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="all">Semua status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Reset */}
          {hasActiveFilter && (
            <button
              onClick={clearFilters}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "12px",
                color: "#64748b",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "6px 8px",
                borderRadius: "6px",
              }}
            >
              <X size={12} />
              Reset
            </button>
          )}
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  borderBottom: "0.5px solid rgba(255,255,255,0.06)",
                }}
              >
                {["#", "Nama", "Email", "Role", "Status", "Aksi"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 16px",
                      textAlign: "left",
                      fontSize: "10px",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#475569",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#475569",
                      fontSize: "13px",
                    }}
                  >
                    Memuat…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#f87171",
                      fontSize: "13px",
                    }}
                  >
                    {error}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div
                      style={{
                        padding: "48px 16px",
                        textAlign: "center",
                      }}
                    >
                      <p
                        style={{
                          color: "#475569",
                          fontSize: "13px",
                          margin: "0 0 6px",
                        }}
                      >
                        Tidak ada user ditemukan.
                      </p>
                      {hasActiveFilter && (
                        <button
                          onClick={clearFilters}
                          style={{
                            fontSize: "12px",
                            color: "#64748b",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                        >
                          Reset filter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((user, index) => {
                  const ac = avatarColor(user.name || "");
                  const isActive = user.status === "active";
                  return (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom: "0.5px solid rgba(255,255,255,0.05)",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(255,255,255,0.03)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {/* # */}
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: "12px",
                          color: "#334155",
                          width: 40,
                        }}
                      >
                        {index + 1}
                      </td>

                      {/* Nama */}
                      <td style={{ padding: "12px 16px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: "8px",
                              background: ac.bg,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "11px",
                              fontWeight: 500,
                              color: ac.color,
                              flexShrink: 0,
                            }}
                          >
                            {initials(user.name)}
                          </div>
                          <div>
                            <div
                              style={{
                                fontSize: "13px",
                                fontWeight: 500,
                                color: "#e2e8f0",
                              }}
                            >
                              {user.name}
                            </div>
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#475569",
                                marginTop: "1px",
                              }}
                            >
                              @{user.username || "user"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: "12px",
                          color: "#64748b",
                        }}
                      >
                        {user.email}
                      </td>

                      {/* Role */}
                      <td style={{ padding: "12px 16px" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 500,
                            padding: "3px 10px",
                            borderRadius: "999px",
                            background: "rgba(255,255,255,0.06)",
                            border: "0.5px solid rgba(255,255,255,0.08)",
                            color: "#94a3b8",
                          }}
                        >
                          {user.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "12px 16px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            fontSize: "11px",
                            fontWeight: 500,
                            padding: "3px 10px",
                            borderRadius: "999px",
                            background: isActive
                              ? "rgba(52,211,153,0.1)"
                              : "rgba(248,113,113,0.1)",
                            color: isActive ? "#34d399" : "#f87171",
                          }}
                        >
                          <span
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              background: isActive ? "#34d399" : "#f87171",
                              flexShrink: 0,
                            }}
                          />
                          {user.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
