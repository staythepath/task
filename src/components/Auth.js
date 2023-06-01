import React, { useEffect } from "react";
import { useState } from "react";
import './Auth.css';
import { auth, googleProvider, db } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  FacebookAuthProvider,
  TwitterAuthProvider,
} from "firebase/auth";
import {
  setDoc,
  doc,

} from "firebase/firestore";


function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  if (auth.currentUser) {
    console.log("User is signed in");
  } else {
    console.log("No user is signed in");
  }

  const register = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
    }
  };

  const signIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
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
        const userDoc = doc(db, 'users', uid);

        // Set the user document
        await setDoc(userDoc, {
          userInfo: {
            email: email,
            name: displayName,
            photoURL: photoURL
          }
        });

        console.log(`User signed in as ${displayName} with email ${email}`);
        console.log(`Profile picture URL: ${photoURL}`);
      }

    } catch (err) {
      console.error(err);
    }
};


const signInWithFacebook = async () => {
  const provider = new FacebookAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    
    if (result.user) {
      const { uid, displayName, email, photoURL } = result.user;

      // Create a reference to this user's document
      const userDoc = doc(db, 'users', uid);

      // Set the user document
      await setDoc(userDoc, {
        userInfo: {
          email: email,
          name: displayName,
          photoURL: photoURL
        }
      });

      console.log(`User signed in as ${displayName} with email ${email}`);
      console.log(`Profile picture URL: ${photoURL}`);
    }
    
  } catch (error) {
    console.error(error);
  }
}
  
const signInWithTwitter = async () => {
  const provider = new TwitterAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    
    if (result.user) {
      const { uid, displayName, email, photoURL } = result.user;

      // Create a reference to this user's document
      const userDoc = doc(db, 'users', uid);

      // Set the user document
      await setDoc(userDoc, {
        userInfo: {
          email: email,
          name: displayName,
          photoURL: photoURL
        }
      });

      console.log(`User signed in as ${displayName} with email ${email}`);
      console.log(`Profile picture URL: ${photoURL}`);
    }
    
  } catch (error) {
    console.error(error);
  }
}


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
    <div style={{  borderStyle: "solid", borderRadius: "10px", borderColor: "#666", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "33vh", width: "250px"}}>
      <h1>Sign In</h1>
      <input
        style={{ margin: "10px", width: "200px" }}
        placeholder="Email..."
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        style={{ margin: "10px", width: "200px" }}
        placeholder="Password..."
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <div style={{ width: "100%", textAlign: "center", marginBottom: "5px" }}>
        <div style={{ marginRight: "10px", display: "inline-block" }}>
            <button onClick={signIn}>Sign In</button>
            <button style={{ marginLeft: "10px" }} onClick={register}>Register</button>
        </div>
      </div>
      <button style={{ width: "200px", margin:"5px" }} onClick={signInWithGoogle}>Sign In With Google</button>
      <button style={{ width: "200px", margin:"5px" }} onClick={signInWithFacebook}>Sign In With Facebook</button>
      <button style={{ width: "200px", margin:"5px" }} onClick={signInWithTwitter}>Sign In With Twitter</button>
  
      {auth.currentUser && (
        <button onClick={logout} style={{ marginTop: "20px" }}>Log Out</button>
      )}
    </div>
  );
  
}

export default Auth;
