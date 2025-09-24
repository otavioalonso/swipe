
import { useAuth } from "../contexts/AuthContext";
import { useLog } from "../contexts/LogContext";
import { useNavigate } from "react-router-dom";

import "./ArticleSwiper.css";

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
    <nav className="navbar">
      {!currentUser.isAnonymous && (
      <div className="flex-row">
          <h6 className="navbar-text">
            <strong>User:</strong> {currentUser.email}
          </h6>
      </div>
        )}
      <div className="flex-column">
        {!currentUser.isAnonymous && 
          <button
            className="btn-outline-primary"
            onClick={() => navigate('/update-profile')}
          >
            Update Profile
          </button>
        }
        {currentUser.isAnonymous && 
          <button
            className="btn-outline-primary"
            onClick={() => navigate('/signup')}
          >
            Register Account
          </button>
        }
        <button
          className="btn-outline-danger"
          onClick={handleLogout}
        >
          {currentUser.isAnonymous ? 'End Guest Session' : 'Log Out'}
        </button>
      </div>
  <ul className="nav-pills">
  <li className="nav-item">
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
  <li className="nav-item">
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
  <li className="nav-item">
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
        <div className="navbar-text">
          {logMessages.map((message, i) => (
            <p key={`message_${i}`} style={{ marginBottom: 0 }}>
              {message}
            </p>
          ))}
        </div>
      </div>
    </nav>
  );
}
