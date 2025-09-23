
import { useAuth } from "../contexts/AuthContext";
import { useLog } from "../contexts/LogContext";
import { useNavigate } from "react-router-dom";
import "./NavBar.css";

export default function NavBar(props) {
  const { currentUser, logout } = useAuth();
  const { log, logMessages } = useLog();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      log('Failed to log out.', true);
      log(`Error: ${error.message}`, true);
    }
  }

  return (
    <nav className="navbar navbar-expand-md flex-column">
      {!currentUser.isAnonymous && (
      <div className="flex-row">
          <h6 className="navbar-text container" style={{ textAlign: "center" }}>
            <strong>User:</strong> {currentUser.email}
          </h6>
      </div>
        )}
      <div className="flex-column">
        {!currentUser.isAnonymous && 
        <a href="/update-profile" className="btn btn-outline-primary mx-2 my-2">
          Update Profile
        </a>
        }
        {currentUser.isAnonymous && 
        <a href="/signup" className="btn btn-outline-primary mx-2 my-2">
          Register Account
        </a>
        }
        <button
          className="btn btn-outline-danger mx-2 my-2"
          onClick={handleLogout}
        >
          {currentUser.isAnonymous ? 'End Guest Session' : 'Log Out'}
        </button>
      </div>
      <ul className="nav nav-pills nav-fill mt-3 mb-0">
        <li className="nav-item mx-1">
          <button
            className={`nav-link trash ${props.folder === "trash" && "active"}`}
            onClick={() => {
              props.setFolder("trash");
              window.history.replaceState(null, "Cosmopapers", "/trash");
            }}
          >
            Trash
          </button>
        </li>
        <li className="nav-item mx-1">
          <button
            className={`nav-link ${props.folder === "inbox" && "active"}`}
            onClick={() => {
              props.setFolder("inbox");
              window.history.replaceState(null, "Cosmopapers", "/inbox");
            }}
          >
            Inbox
          </button>
        </li>
        <li className="nav-item mx-1">
          <button
            className={`nav-link archive ${
              props.folder === "archive" && "active"
            }`}
            onClick={() => {
              props.setFolder("archive");
              window.history.replaceState(null, "Cosmopapers", "/archive");
            }}
          >
            Archive
          </button>
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
