
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
      {/* <div className="controller-info">
        {!currentUser.isAnonymous && (
          <span className="user-email">{currentUser.email}</span>
        )}
      </div> */}
      <div className="controller-body">
        <div className="dpad">
          <button className={`dpad-btn left ${props.folder === "trash" ? "active" : ""}`} aria-label="Left" onClick={() => {
              props.setFolder("trash");
              window.history.replaceState(null, "Cosmopapers", "/trash");
            }}>&lt;-</button>
          <button className={`dpad-btn center ${props.folder === "inbox" ? "active" : ""}`} aria-label="Center" onClick={() => {
              props.setFolder("inbox");
              window.history.replaceState(null, "Cosmopapers", "/inbox");
            }}>🕊</button>
          <button className={`dpad-btn right ${props.folder === "archive" ? "active" : ""}`} aria-label="Right" onClick={() => {
              props.setFolder("archive");
              window.history.replaceState(null, "Cosmopapers", "/archive");
            }}>-&gt;</button>
        </div>
        <div className="controller-buttons">
          <button className="btn-e" aria-label="E" onClick={() => navigate(currentUser.isAnonymous ? '/signup' : '/update-profile')}>{currentUser.isAnonymous ? '🐣' : '🐥'}</button>
          <button className="btn-x" aria-label="X" onClick={handleLogout}>X</button>
        </div>
      </div>
      <div className="controller-terminal">
        {logMessages.map((message, i) => (
          <p key={`message_${i}`} style={{ marginBottom: 0 }}>
            {message}
            {i === logMessages.length - 1 && <span className="terminal-cursor">&#9608;</span>}
          </p>
        ))}
      </div>
    </nav>
  );
}
