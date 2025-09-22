
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "../contexts/AuthContext";
import { LogProvider } from "../contexts/LogContext";

import PrivateRoute from "./PrivateRoute";

import LogIn from "./LogIn";
import SignUp from "./SignUp";
import ForgotPassword from "./ForgotPassword";
import UpdateProfile from "./UpdateProfile";
import AccountPage from "./AccountPage";

import Dashboard from "./Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LogProvider>
          <Routes>
            <Route
              exact
              path="/"
              element={
                <PrivateRoute>
                  <Navigate to="/inbox" />
                </PrivateRoute>
              }
            />
            <Route
              path="/inbox"
              element={
                <PrivateRoute>
                  <Dashboard folder="inbox" />
                </PrivateRoute>
              }
            />
            <Route
              path="/archive"
              element={
                <PrivateRoute>
                  <Dashboard folder="archive" />
                </PrivateRoute>
              }
            />
            <Route
              path="/trash"
              element={
                <PrivateRoute>
                  <Dashboard folder="trash" />
                </PrivateRoute>
              }
            />
            <Route
              path="/update-profile"
              element={
                <PrivateRoute>
                  <AccountPage>
                    <UpdateProfile />
                  </AccountPage>
                </PrivateRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <AccountPage>
                  <SignUp />
                </AccountPage>
              }
            />
            <Route
              path="/login"
              element={
                <AccountPage>
                  <LogIn />
                </AccountPage>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <AccountPage>
                  <ForgotPassword />
                </AccountPage>
              }
            />
          </Routes>
        </LogProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
