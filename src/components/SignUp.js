import { useRef, useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "./AuthForm.css";

export default function Signup() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const { signup, currentUser, linkAnonymousAccount } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      <Card className="auth-card">
        <Card.Body>
          <h2 className="text-center">Sign Up</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {currentUser && currentUser.isAnonymous && (
            <div className="text-center mt-2">
              <span>This will link your current session to a new account. </span>
              <Button
                variant="link"
                className="signup-link"
                disabled={loading}
                style={{ textDecoration: "underline" }}
                onClick={async () => {
                  setLoading(true);
                  try {
                    await useAuth().logout();
                    navigate("/");
                  } catch (err) {
                    setError("Failed to destroy guest session.");
                  }
                  setLoading(false);
                }}
              >
                Start fresh
              </Button>
            </div>
        )}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="form-group" id="email">
              <Form.Label className="form-label">Email</Form.Label>
              <Form.Control className="form-control" type="email" ref={emailRef} required />
            </Form.Group>
            <Form.Group className="form-group" id="password">
              <Form.Label className="form-label">Password</Form.Label>
              <Form.Control className="form-control" type="password" ref={passwordRef} required />
            </Form.Group>
            <Form.Group className="form-group" id="password-confirm">
              <Form.Label className="form-label">Password Confirmation</Form.Label>
              <Form.Control className="form-control" type="password" ref={passwordConfirmRef} required />
            </Form.Group>
            <Button disabled={loading} className="btn-primary w-100" type="submit">
              Sign Up
            </Button>
            {currentUser && (
              <Button disabled={loading}
                variant="secondary" className="btn-secondary w-100" type="button" onClick={() => navigate("/")}>
                Back
              </Button>
            )}
          </Form>
        </Card.Body>

        {!currentUser && (
          <div className="text-center mt-2">
            <span>Already have an account? </span>
            <Link className="signup-link" to="/login">Log In</Link>
          </div>
        )}

      </Card>
    </div>
  );
}
