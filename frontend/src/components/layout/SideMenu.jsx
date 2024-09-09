import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const menuItem = [
  { name: "profile", url: "/me/profile", icon: "fas fa-user" },
  { name: "Update Profile", url: "/me/update_profile", icon: "fas fa-user" },
  {
    name: "Upload Avatar",
    url: "/me/upload_avatar",
    icon: "fas fa-user-circle",
  },
  {
    name: "Update Password",
    url: "/me/update_password",
    icon: "fas fa-lock",
  },
];

const SideMenu = () => {
  const location = useLocation();
  const [activeMenuItem, setActiveMenuItem] = useState(location.pathname);

  const handdleMenuClick = (url) => {
    setActiveMenuItem(url);
  };

  return (
    <div className="list-group mt-5 pl-4">
      {menuItem?.map((menuItem, index) => (
        <Link
          key={index}
          to={menuItem?.url}
          className={`fw-bold list-group-item list-group-item-action ${
            activeMenuItem.includes(menuItem.url) ? "active" : ""
          }`}
          aria-current={
            activeMenuItem.includes(menuItem.url) ? "true" : "false"
          }
          onClick={() => handdleMenuClick(menuItem.url)}
        >
          <i className={`${menuItem.icon} fa-fw pe-2`}></i> {menuItem.name}
        </Link>
      ))}
    </div>
  );
};

export default SideMenu;
