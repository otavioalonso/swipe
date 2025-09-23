import { useRef, useState } from "react"
import { Form, Button, Card, Alert } from "react-bootstrap"
import { useAuth } from "../contexts/AuthContext"
import { Link } from "react-router-dom"
import "./AuthForm.css"

export default function ForgotPassword() {
  const emailRef = useRef()
  const { resetPassword } = useAuth()
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      setMessage("")
      setError("")
      setLoading(true)
      await resetPassword(emailRef.current.value)
      setMessage("Check your inbox for further instructions")
    } catch {
      setError("Failed to reset password")
    }

    setLoading(false)
  }

  return (
    <div className="auth-bg">
      <Card className="auth-card">
        <Card.Body>
          <h2 className="text-center">Password Reset</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="form-group" id="email">
              <Form.Label className="form-label">Email</Form.Label>
              <Form.Control className="form-control" type="email" ref={emailRef} required />
            </Form.Group>
            <Button disabled={loading} className="btn-primary w-100" type="submit">
              Reset Password
            </Button>
          </Form>
          <div className="text-center mt-3">
            <Link className="forgot-link" to="/login">Login</Link>
          </div>
        </Card.Body>
        <div className="text-center mt-2">
          <span>Need an account? </span>
          <Link className="signup-link" to="/signup">Sign Up</Link>
        </div>
      </Card>
    </div>
  )
}
