import React, { useEffect } from "react";
import { useState } from "react";
import "./Auth.css";
import { auth, googleProvider, db } from "../config/firebase";
import {
  // createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  //FacebookAuthProvider,
  TwitterAuthProvider,
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Auth(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const goToRegister = () => {
    navigate("/Register");
    props.onRegister();
  };

  if (auth.currentUser) {
    console.log("User is signed in");
  } else {
    console.log("No user is signed in");
  }

  /*const register = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      props.closeAuthModal();
    } catch (err) {
      console.error(err);
    }
  };*/

  const signIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      props.closeAuthModal();
    } catch (err) {
      console.error(err);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);

      if (result.user) {
        const { uid, displayName, email, photoURL } = result.user;

        // Create a reference to this user's document
        const userDoc = doc(db, "users", uid);

        // Set the user document
        props.closeAuthModal();
        await setDoc(userDoc, {
          userInfo: {
            email: email,
            name: displayName,
            photoURL: photoURL,
          },
        });

        console.log(`User signed in as ${displayName} with email ${email}`);
        console.log(`Profile picture URL: ${photoURL}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* 
  const signInWithFacebook = () => {
    const provider = new FacebookAuthProvider();

    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        const credential = FacebookAuthProvider.credentialFromResult(result);
        const accessToken = credential.accessToken;

        // Create a reference to this user's document
        const userDoc = doc(db, "users", user.uid);

        // Set the user document
        props.closeAuthModal();
        setDoc(userDoc, {
          userInfo: {
            email: user.email,
            name: user.displayName,
            photoURL: user.photoURL,
          },
        });

        console.log(
          `User signed in as ${user.displayName} with email ${user.email}`
        );
        console.log(`Profile picture URL: ${user.photoURL}`);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData ? error.customData.email : null; // Protect against null customData
        // The AuthCredential type that was used.
        const credential = FacebookAuthProvider.credentialFromError(error);

        // Handle error here
        console.error(errorCode, errorMessage, email, credential);
      });
  };
*/
  const signInWithTwitter = async () => {
    const provider = new TwitterAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);

      if (result.user) {
        const { uid, displayName, email, photoURL } = result.user;

        // Create a reference to this user's document
        const userDoc = doc(db, "users", uid);
        props.closeAuthModal();
        // Set the user document
        await setDoc(userDoc, {
          userInfo: {
            email: email,
            name: displayName,
            photoURL: photoURL,
          },
        });

        console.log(`User signed in as ${displayName} with email ${email}`);
        console.log(`Profile picture URL: ${photoURL}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User is signed in");
      } else {
        console.log("No user is signed in");
      }
    });

    // Cleanup function
    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div className="container">
      <h1>Sign In</h1>
      <input
        className="input-box"
        placeholder="Email..."
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="input-box-bottom"
        placeholder="Password..."
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="center-div">
        <div className="inline-div">
          <button onClick={signIn}>Sign In</button>
          <button className="button-spacing" onClick={goToRegister}>
            Register
          </button>
        </div>
      </div>
      <button className="full-width-button" onClick={signInWithGoogle}>
        Sign In With Google
      </button>
      {/* <button className="full-width-button" onClick={signInWithFacebook}>
        Sign In With Facebook
      </button>*/}
      <button className="full-width-button" onClick={signInWithTwitter}>
        Sign In With Twitter
      </button>

      {auth.currentUser && (
        <button onClick={logout} className="logout-button">
          Log Out
        </button>
      )}
    </div>
  );
}

export default Auth;
