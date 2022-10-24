import React from "react";
import Signup from "./Signup";
import { AuthProvider } from "../contexts/AuthContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import PrivateRoute from "./PrivateRoute";
import ForgotPassword from "./ForgotPassword";
import UpdateProfile from "./UpdateProfile";
import ArticleSwiper from "./ArticleSwiper";
import AccountPage from "./AccountPage";

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
                <ArticleSwiper />
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
                <Signup />
              </AccountPage>
            }
          />
          <Route
            path="/login"
            element={
              <AccountPage>
                <Login />
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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
