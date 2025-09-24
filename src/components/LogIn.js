import { useRef, useState, useEffect } from "react";
// ...existing code...
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "./AuthForm.css";

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login, signInAnonymously, currentUser } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  async function handleGuestLogin() {
    setError("");
    setLoading(true);
    try {
      await signInAnonymously();
      navigate("/");
    } catch {
      setError("Failed to log in as guest");
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      await login(emailRef.current.value, passwordRef.current.value);
      navigate("/");
    } catch {
      setError("Failed to log in");
    }

    setLoading(false);
  }

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="card-body">
          <h2>Log In</h2>
          {error && <div className="alert alert-danger auth-card__alert">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group" id="email">
              <label className="form-label" htmlFor="login-email">Email</label>
              <input className="form-control" id="login-email" type="email" ref={emailRef} required />
            </div>
            <div className="form-group" id="password">
              <label className="form-label" htmlFor="login-password">Password</label>
              <input className="form-control" id="login-password" type="password" ref={passwordRef} required />
            </div>
            <button disabled={loading} className="btn btn-primary w-100" type="submit">
              Log In
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={handleGuestLogin}
            >
              Continue as Guest
            </button>
          </form>
          <div className="text-center">
            <Link className="link" to="/forgot-password">Forgot Password?</Link>
          </div>
        </div>
        <div className="text-center">
          <span>Need an account? </span>
          <Link className="link" to="/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
