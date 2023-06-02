import React, { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../config/firebase";
import { setDoc, doc } from "firebase/firestore"; // import setDoc and doc from Firestore

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(null);
  const [emailValid, setEmailValid] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(emailRegex.test(email));

    if (confirmPassword !== "") {
      setPasswordMatch(password === confirmPassword);
    }
    // Check that all fields are filled and passwords match
    setCanSubmit(
      name !== "" &&
        emailValid &&
        password !== "" &&
        password === confirmPassword
    );
  }, [name, email, password, confirmPassword, emailValid]);

  const register = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredential.user.uid;

      // Create a reference to this user's document
      const userDoc = doc(db, "users", uid);

      // Set the user document
      await setDoc(userDoc, {
        userInfo: {
          email: email,
          name: name,
        },
      });

      setRegisterSuccess(true);
      // Assuming you have set up React Router and have a way to navigate
      // You'd navigate to another page here, for example:
      // history.push('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        maxWidth: "300px",
        margin: "auto",
      }}
    >
      <h1>Register</h1>
      <input
        className="register-input"
        placeholder="Name..."
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="register-input"
        placeholder="Email..."
        onChange={(e) => setEmail(e.target.value)}
      />
      {!emailValid && email !== "" && (
        <p>
          Use a fake email if you want, but it needs to be an email address.
        </p>
      )}
      <input
        className="register-input"
        placeholder="Password..."
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        className="register-input"
        placeholder="Confirm Password..."
        type="password"
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      {passwordMatch === false && <p>Passwords do not match!</p>}
      {registerSuccess && (
        <p style={{ textAlign: "center" }}>
          Registration successful!
          <br /> You are logged in!
        </p>
      )}
      <button
        style={{ width: "fit-content" }}
        onClick={register}
        disabled={!canSubmit}
      >
        Register
      </button>
    </div>
  );
}

export default Register;
