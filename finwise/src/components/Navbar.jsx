import { Link, NavLink } from "react-router-dom";
import toast from "react-hot-toast";

function Navbar({ darkMode, setDarkMode, user, setUser }){

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="logo">
        <Link to="/">💰 FinWise</Link>
      </div>

      {/* Nav Links */}
      <div className="nav-links">
        <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "nav-item active-link" : "nav-item"
              }
        >Home</NavLink>

        {user ? (
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? "nav-item active-link" : "nav-item"
              }
            >Dashboard</NavLink>
            <NavLink
              to="/sip"
              className={({ isActive }) =>
                isActive ? "nav-item active-link" : "nav-item"
              }
            >SIP</NavLink>
            <NavLink
              to="/emi"
              className={({ isActive }) =>
                isActive ? "nav-item active-link" : "nav-item"
              }
            >EMI</NavLink>
            <NavLink
              to="/expense"
              className={({ isActive }) =>
                isActive ? "nav-item active-link" : "nav-item"
              }
            >Expense</NavLink>
            <NavLink
              to="/goal"
              className={({ isActive }) =>
                isActive ? "nav-item active-link" : "nav-item"
              }
            >Goal</NavLink>

            <Link to="/profile" className="profile-btn">
              👤 
            </Link>
          </>
        ) : (
          <>
            <Link to="/login" className="login-btn">
              Login
            </Link>

            <Link to="/signup" className="signup-btn">
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;