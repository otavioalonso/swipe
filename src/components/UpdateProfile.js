import { useRef, useState } from "react";
// ...existing code...
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "./AuthForm.css";

export default function UpdateProfile() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const { currentUser, updatePassword, updateEmail } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError("Passwords do not match");
    }

    const promises = [];
    setLoading(true);
    setError("");

    if (emailRef.current.value !== currentUser.email) {
      promises.push(updateEmail(emailRef.current.value));
    }
    if (passwordRef.current.value) {
      promises.push(updatePassword(passwordRef.current.value));
    }

    Promise.all(promises)
      .then(() => {
        navigate("/");
      })
      .catch(() => {
        setError("Failed to update account");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="card-body">
          <h2>Update Profile</h2>
          {error && <div className="alert alert-danger auth-card__alert">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group" id="email">
              <label className="form-label" htmlFor="update-email">Email</label>
              <input
                className="form-control"
                id="update-email"
                type="email"
                ref={emailRef}
                required
                defaultValue={currentUser.email}
              />
            </div>
            <div className="form-group" id="password">
              <label className="form-label" htmlFor="update-password">Password</label>
              <input
                className="form-control"
                id="update-password"
                type="password"
                ref={passwordRef}
                placeholder="Leave blank to keep the same"
              />
            </div>
            <div className="form-group" id="password-confirm">
              <label className="form-label" htmlFor="update-password-confirm">Password Confirmation</label>
              <input
                className="form-control"
                id="update-password-confirm"
                type="password"
                ref={passwordConfirmRef}
                placeholder="Leave blank to keep the same"
              />
            </div>
            <button disabled={loading} className="btn btn-primary" type="submit">
              Update
            </button>
          </form>
          <div className="text-center">
            <Link className="forgot-link" to="/">Cancel</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
