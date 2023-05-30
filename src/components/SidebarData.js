import React from "react";

import * as AiIcons from "react-icons/ai";
import * as IoIcons from "react-icons/io";
import * as FaIcons from "react-icons/fa";
import * as BsIcons from "react-icons/bs";

export const SidebarData = [
  {
    title: "Home",
    path: "/",
    icon: <AiIcons.AiFillHome />,
    cName: "nav-text",
  },
  {
    title: "To Do List",
    path: "/ToDoList",
    icon: <IoIcons.IoIosPaper />,
    cName: "nav-text",
  },
  {
    title: "Prioritize",
    path: "/Prio",
    icon: <FaIcons.FaSortAlphaDown />,
    cName: "nav-text",
  },
  {
    title: "Run",
    path: "/ToDoRun",
    icon: <BsIcons.BsPlayFill />,
    cName: "nav-text",
  },
  {
    title: "Auth",
    path: "/Auth",
    icon: <BsIcons.BsPlayFill />,
    cName: "nav-text",
  },
];
