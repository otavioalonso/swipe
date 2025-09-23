import { useRef, useState, useEffect } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
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
      <Card className="auth-card">
        <Card.Body>
          <h2 className="text-center">Log In</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="form-group" id="email">
              <Form.Label className="form-label">Email</Form.Label>
              <Form.Control className="form-control" type="email" ref={emailRef} required />
            </Form.Group>
            <Form.Group className="form-group" id="password">
              <Form.Label className="form-label">Password</Form.Label>
              <Form.Control className="form-control" type="password" ref={passwordRef} required />
            </Form.Group>
            <Button disabled={loading} className="btn-primary w-100" type="submit">
              Log In
            </Button>
            <Button
              variant="secondary"
              className="btn-secondary w-100 mt-2"
              onClick={handleGuestLogin}
            >
              Continue as Guest
            </Button>
          </Form>
          <div className="text-center mt-3">
            <Link className="forgot-link" to="/forgot-password">Forgot Password?</Link>
          </div>
        </Card.Body>
        <div className="text-center mt-2">
          <span>Need an account? </span>
          <Link className="signup-link" to="/signup">Sign Up</Link>
        </div>
      </Card>
    </div>
  );
}
