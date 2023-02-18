import React from "react";
import SignUp from "./SignUp";
import { AuthProvider } from "../contexts/AuthContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LogIn from "./LogIn";
import PrivateRoute from "./PrivateRoute";
import ForgotPassword from "./ForgotPassword";
import UpdateProfile from "./UpdateProfile";
import AccountPage from "./AccountPage";
import Dashboard from "./Dashboard";
import ArticleViewer from "./ArticleViewer";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            exact
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
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
          <Route exact path="/pdf/:arxiv" element={<ArticleViewer />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
