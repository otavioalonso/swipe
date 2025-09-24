import { useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "./AuthForm.css";

export default function Signup() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const { signup, currentUser, linkAnonymousAccount, logout } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate("/signup");
    } catch (error) {
      setError("Failed to destroy guest session.");
      console.error(error);
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError("Passwords do not match");
    }

    try {
      setError("");
      setLoading(true);
      if (currentUser && currentUser.isAnonymous) {
        // Link anonymous account to permanent account
        await linkAnonymousAccount(emailRef.current.value, passwordRef.current.value);
      } else {
        await signup(emailRef.current.value, passwordRef.current.value);
      }
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to create an account");
    }
    setLoading(false);
  }

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="card-body">
          <h2>Sign Up</h2>
          {error && <div className="alert alert-danger auth-card__alert">{error}</div>}
          {currentUser && currentUser.isAnonymous && (
            <div className="text-center">
              <span>This will link your current session to a new account. </span>
              <button
                className="btn btn-link signup-link"
                disabled={loading}
                style={{ textDecoration: "underline" }}
                onClick={handleLogout}
              >
                Start fresh
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group" id="email">
              <label className="form-label" htmlFor="signup-email">Email</label>
              <input className="form-control" id="signup-email" type="email" ref={emailRef} required />
            </div>
            <div className="form-group" id="password">
              <label className="form-label" htmlFor="signup-password">Password</label>
              <input className="form-control" id="signup-password" type="password" ref={passwordRef} required />
            </div>
            <div className="form-group" id="password-confirm">
              <label className="form-label" htmlFor="signup-password-confirm">Password Confirmation</label>
              <input className="form-control" id="signup-password-confirm" type="password" ref={passwordConfirmRef} required />
            </div>
            <button disabled={loading} className="btn btn-primary" type="submit">
              Sign Up
            </button>
            {currentUser && (
              <button disabled={loading} className="btn btn-secondary" type="button" onClick={() => navigate("/")}>
                Back
              </button>
            )}
          </form>
        </div>
        {!currentUser && (
          <div className="text-center">
            <span>Already have an account? </span>
            <Link className="link" to="/login">Log In</Link>
          </div>
        )}
      </div>
    </div>
  );
}
