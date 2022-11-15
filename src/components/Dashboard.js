import React, { useState } from "react";
import {
  Card,
  Button,
  Alert,
  Navbar,
  Nav,
  NavItem,
  Container,
} from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";

import ArticleSwiper from "./ArticleSwiper";

export default function Dashboard() {
  const [error, setError] = useState("");
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    setError("");

    try {
      await logout();
      navigate("/login");
    } catch {
      setError("Failed to log out");
    }
  }

  return (
    <>
      <Navbar bg="light" expand="lg">
        <Nav>
          {/* <NavItem eventKey={1} href="#">
            Link
          </NavItem>
          <NavItem eventKey={2} href="#">
            Link
          </NavItem> */}
          <h6>
            <strong>User:</strong> {currentUser.email}
          </h6>
          <Link to="/update-profile" className="btn btn-primary mx-2">
            Update Profile
          </Link>
          <Button className="btn btn-primary mx-2" onClick={handleLogout}>
            Log Out
          </Button>
        </Nav>
      </Navbar>
      <ArticleSwiper />
    </>
  );
}
