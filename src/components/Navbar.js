////////////////////////////////////////////////////////////////////
import React, { useState, useEffect, useRef } from "react";
import * as FaIcons from "react-icons/fa";

import { Link } from "react-router-dom";
import { SidebarData } from "./SidebarData";
import "./Navbar.css";
import { IconContext } from "react-icons";
import Auth from "./Auth";
import Calendar from "../pages/Calendar";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

function Navbar() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [sidebar, setSidebar] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const sidebarRef = useRef(null); // initialize sidebar ref
  const authRef = useRef(null); // initialize auth modal ref
  // const [registering, setRegistering] = useState(false);

  const closeAuthModal = () => setShowAuth(false);

  /*
  const onRegister = () => {
    setRegistering(true);
  };
*/

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        const docRef = doc(db, "users", user.uid);
        getDoc(docRef)
          .then((docSnapshot) => {
            if (docSnapshot.exists()) {
              setUsername(docSnapshot.data().userInfo.name);
            } else {
              console.log("No such document!");
            }
          })
          .catch((error) => {
            console.log("Error getting document:", error);
          });
      } else {
        setUsername("");
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const openSidebar = () => setSidebar(true);
  const closeSidebar = () => setSidebar(false);

  const handleShowAuth = () => setShowAuth(!showAuth);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        console.log("User signed out");
      })
      .catch((error) => {
        // An error occurred.
        console.error("Error signing out: ", error);
      });
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        sidebar &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        setSidebar(false); // close sidebar if click was outside sidebar
      }

      if (showAuth && authRef.current && !authRef.current.contains(e.target)) {
        setShowAuth(false); // close auth modal if click was outside auth modal
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [sidebar, showAuth]); // added sidebar in the array of dependencies

  return (
    <>
      <IconContext.Provider value={{ color: "#fff" }}>
        <div className="navbar">
          <Link to="#" className="menu-bars">
            {sidebar ? (
              <FaIcons.FaTimes
                onClick={closeSidebar}
                style={{ marginLeft: "10px" }}
              />
            ) : (
              <FaIcons.FaBars
                onClick={openSidebar}
                style={{ marginLeft: "10px" }}
              />
            )}
          </Link>

          <h2 className="navbar-logo">Obey the Bell</h2>
          {user ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <h4 style={{ marginRight: "10px" }}>{username}</h4>
              <button onClick={handleLogout} className="auth-button">
                Sign Out
              </button>
            </div>
          ) : (
            <button onClick={handleShowAuth} className="auth-button">
              Sign In
            </button>
          )}

          <nav
            ref={authRef}
            className={showAuth ? "auth-modal show" : "auth-modal"}
          >
            <Auth closeAuthModal={closeAuthModal} onRegister={closeAuthModal} />
          </nav>
        </div>
        <nav
          ref={sidebarRef}
          className={sidebar ? "nav-menu active" : "nav-menu"}
        >
          <ul className="nav-menu-items">
            {SidebarData.map((item, index) => {
              return (
                <li key={index} className={item.cName} onClick={closeSidebar}>
                  <Link to={item.path}>
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })}

            <Calendar closeSidebar={closeSidebar} />
          </ul>
        </nav>
      </IconContext.Provider>
    </>
  );
}

export default Navbar;
