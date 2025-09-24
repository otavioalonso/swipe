import { useRef, useState } from "react"
// ...existing code...
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
      <div className="auth-card">
        <div className="card-body">
          <h2>Password Reset</h2>
          {error && <div className="alert alert-danger auth-card__alert">{error}</div>}
          {message && <div className="alert alert-success auth-card__alert">{message}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group" id="email">
              <label className="form-label" htmlFor="forgot-email">Email</label>
              <input className="form-control" id="forgot-email" type="email" ref={emailRef} required />
            </div>
            <button disabled={loading} className="btn btn-primary" type="submit">
              Reset Password
            </button>
          </form>
          <div className="text-center">
            <Link className="link" to="/login">Login</Link>
          </div>
        </div>
        <div className="text-center">
          <span>Need an account? </span>
          <Link className="link" to="/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  )
}
