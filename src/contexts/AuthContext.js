import React, { useContext, useState, useEffect } from "react";
import { auth, db, EmailAuthProvider } from "../firebase";
import { doc, deleteDoc } from "firebase/firestore";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);

  function signup(email, password) {
    return auth.createUserWithEmailAndPassword(email, password);
  }

  // Link anonymous account to permanent account
  function linkAnonymousAccount(email, password) {
  const credential = EmailAuthProvider.credential(email, password);
    if (!currentUser || !currentUser.isAnonymous) {
      return Promise.reject(new Error("No anonymous user to link."));
    }
    return currentUser.linkWithCredential(credential);
  }

  function login(email, password) {
    return auth.signInWithEmailAndPassword(email, password);
  }

  function logout() {
    // If user is anonymous, delete their Firestore data and Auth user
    if (currentUser && currentUser.isAnonymous) {
      const userDocRef = doc(db, "users", currentUser.uid);
      // Delete Firestore user data
      deleteDoc(userDocRef).catch((error) => {
        console.error('Error deleting Firestore user data:', error);
      });
      // Delete Auth user
      return currentUser.delete().catch((error) => {
        console.error('Error deleting anonymous Auth user:', error);
      }).then(() => auth.signOut());
    }
    // Regular logout
    return auth.signOut();
  }

  function resetPassword(email) {
    return auth.sendPasswordResetEmail(email);
  }

  function updateEmail(email) {
    return currentUser.updateEmail(email);
  }

  function updatePassword(password) {
    return currentUser.updatePassword(password);
  }

  function signInAnonymously() {
    return auth.signInAnonymously();
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);


  const value = {
    currentUser,
    login,
    signup,
    logout,
    resetPassword,
    updateEmail,
    updatePassword,
    signInAnonymously,
    linkAnonymousAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
