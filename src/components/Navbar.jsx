import { Link } from "react-router-dom";

function Navbar() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="logo">
        <Link to="/">FinWise</Link>
      </div>

      {/* Nav Links */}
      <div className="nav-links">
        <Link to="/">Home</Link>

        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/sip">SIP</Link>
            <Link to="/emi">EMI</Link>
            <Link to="/expense">Expense</Link>
            <Link to="/goal">Goal</Link>

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