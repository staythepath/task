import React, { useState, useEffect, useRef } from "react";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import { Link } from "react-router-dom";
import { SidebarData } from "./SidebarData";
import "./Navbar.css";
import { IconContext } from "react-icons";
import Auth from "./Auth";
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from "../config/firebase";



 

function Navbar() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [sidebar, setSidebar] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const sidebarRef = useRef(null); // initialize sidebar ref
  const authRef = useRef(null); // initialize auth modal ref 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        getDoc(docRef).then((docSnapshot) => {
          if (docSnapshot.exists()) {
            setUsername(docSnapshot.data().userInfo.name);
          } else {
            console.log("No such document!");
          }
        }).catch((error) => {
          console.log("Error getting document:", error);
        });
      } else {
        setUsername("");
      }
    });
  
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const showSidebar = () => setSidebar(!sidebar);
  const handleShowAuth = (e) => {
    e.stopPropagation();
    setShowAuth(true);
  };

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
      if (sidebar && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebar(false); // close sidebar if click was outside sidebar
      }

      if (showAuth && authRef.current && !authRef.current.contains(e.target)) {
        setShowAuth(false); // close auth modal if click was outside auth modal
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    }
  }, [sidebar, showAuth]); // added sidebar in the array of dependencies



  return (
    <>
      <IconContext.Provider value={{ color: "#fff" }}>
        <div className="navbar" >
          <Link to="#" className="menu-bars">
            <FaIcons.FaBars onClick={showSidebar} style={{marginLeft:"10px"}} />
          </Link>
          <h2 className="navbar-logo">
            Obey the Bell
          </h2>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h4 style={{marginRight: "10px"}}>{username}</h4>
              <button onClick={handleLogout} className="auth-button">Sign Out</button>
            </div>
          ) : (
            <button onClick={handleShowAuth} className="auth-button">Sign In</button>
          )}
          {showAuth && (
        <div ref={authRef} onClick={e => e.stopPropagation()} className={showAuth ? "auth-modal show" : "auth-modal"}>
          <Auth />
        </div>
      )}

        </div>
        <nav ref={sidebarRef} className={sidebar ? "nav-menu active" : "nav-menu"}>
          <ul className="nav-menu-items" onClick={showSidebar}>
            <li className="navbar-toggle">
              <Link to="#" className="menu-bars">
                <div style={{marginLeft: "10px"}}>
                <AiIcons.AiOutlineClose />
                </div>
              </Link>
            </li>
            {SidebarData.map((item, index) => {
              return (
                <li key={index} className={item.cName}>
                  <Link to={item.path}>
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </IconContext.Provider>
    </>
  );
}

export default Navbar;
