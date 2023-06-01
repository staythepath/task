import React, { useState, useEffect } from "react";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import { Link } from "react-router-dom";
import { SidebarData } from "./SidebarData";
import "./Navbar.css";
import { IconContext } from "react-icons";
import Auth from "./Auth";
 

function Navbar() {
  const [sidebar, setSidebar] = useState(false);
  const [showAuth, setShowAuth] = useState(false); 

  const showSidebar = () => setSidebar(!sidebar);
  const handleShowAuth = (e) => {
    e.stopPropagation();
    setShowAuth(true);
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (showAuth) {
        handleCloseAuth(e);
      }
    }

    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    }
  }, [showAuth]);

  const handleCloseAuth = (e) => {
    e.stopPropagation();
    setShowAuth(false);
  };

  return (
    <>
      <IconContext.Provider value={{ color: "#fff" }}>
        <div className="navbar" >
          <Link to="#" className="menu-bars">
            <FaIcons.FaBars onClick={showSidebar} style={{marginLeft:"10px"}} />
          </Link>
          <h2 className="navbar-logo">
            Always continue,<br/> especially when it's hard.
          </h2>
          <button onClick={handleShowAuth} className="auth-button">Sign In</button>
          {showAuth && (
            <div onClick={e => e.stopPropagation()} className={showAuth ? "auth-modal show" : "auth-modal"}>

              <Auth />
            </div>
          )}

        </div>
        <nav className={sidebar ? "nav-menu active" : "nav-menu"}>
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
