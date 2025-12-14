import React from "react";
import { NavLink } from "react-router-dom";
import logo from "@/assets/images/Verticallogo.svg";
const SideMenu = () => {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Side Menu */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6 font-bold text-xl border-b">
          <img src={logo} className="w-20" />
        </div>

        <nav className="p-4 space-y-2">
          <NavLink
            to="/home"
            end
            className={({ isActive }) =>
              `block px-4 py-2 rounded ${
                isActive
                  ? "bg-green-500 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/home/testoo"
            className={({ isActive }) =>
              `block px-4 py-2 rounded ${
                isActive
                  ? "bg-green-500 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            Testoo
          </NavLink>

          <NavLink
            to="/home/testooo"
            className={({ isActive }) =>
              `block px-4 py-2 rounded ${
                isActive
                  ? "bg-green-500 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            Testooo
          </NavLink>
        </nav>
      </aside>
    </div>
  );
};

export default SideMenu;
