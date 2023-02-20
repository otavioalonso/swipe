import React from "react";

import { useAuth } from "../contexts/AuthContext";
import { useLog } from "../contexts/LogContext";
import { useNavigate } from "react-router-dom";

export default function NavBar(props) {
  const { currentUser, logout } = useAuth();
  const { log, logMessages } = useLog();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch {
      log("Error: Failed to log out", true);
    }
  }

  return (
    <nav className="navbar navbar-expand-md flex-column">
      <div className="flex-row">
        <h6 className="navbar-text container" style={{ textAlign: "center" }}>
          <strong>User:</strong> {currentUser.email}
        </h6>
      </div>
      <div className="flex-column">
        {"importArxiv" in props && props.importArxiv && (
          <button
            className="btn btn-primary mx-2 my-2"
            onClick={props.importArxiv}
          >
            Sync with arXiv
          </button>
        )}
        <a href="/update-profile" className="btn btn-outline-primary mx-2 my-2">
          Update Profile
        </a>
        <button
          className="btn btn-outline-danger mx-2 my-2"
          onClick={handleLogout}
        >
          Log Out
        </button>
      </div>
      <ul className="nav nav-pills nav-fill mt-3 mb-0">
        <li className="nav-item">
          <a
            className={`nav-link ${props.folder == "trash" && "active"}`}
            href="/trash"
          >
            Trash
          </a>
        </li>
        <li className="nav-item">
          <a
            className={`nav-link ${props.folder == "inbox" && "active"}`}
            href="/inbox"
          >
            Inbox
          </a>
        </li>
        <li className="nav-item">
          <a
            className={`nav-link ${props.folder == "archive" && "active"}`}
            href="/archive"
          >
            Archive
          </a>
        </li>
      </ul>
      <div className="flex-row">
        <h6 className="navbar-text container" style={{ textAlign: "center" }}>
          {logMessages.map((message, i) => (
            <p key={`message_${i}`} style={{ marginBottom: 0 }}>
              {message}
            </p>
          ))}
        </h6>
      </div>
    </nav>
  );
}
