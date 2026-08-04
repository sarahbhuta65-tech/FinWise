import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Faq from "./pages/Faq";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import ManageBlogs from "./pages/ManageBlogs";
import ManageFAQs from "./pages/ManageFAQs";
import CreateBlog from "./pages/CreateBlog";
import CreateFAQs from "./pages/CreateFAQs";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import SipCalculator from "./pages/sipCalculator";
import EmiCalculator from "./pages/emiCalculator";
import ExpenseTracker from "./pages/ExpenseTracker";
import SavingsGoal from "./pages/SavingsGoal";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MyAccount from "./pages/MyAccount";
import Blogs from "./pages/Blogs";
import BlogDetails from "./pages/BlogDetails";
import {Toaster} from "react-hot-toast";
import FloatingAIButton from "./components/FloatingAIButton";
import AIDrawer from "./components/AIDrawer";
import AIAssistant from "./pages/AIAssistant";
import "./App.css";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );
  const [openAI, setOpenAI] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme !== null) {
      setDarkMode(JSON.parse(savedTheme));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        user={user}
        setUser={setUser}
      />
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "12px",
            background: "#1f2937",
            color: "#fff",
          },
          success: {
            iconTheme: {
              primary: "#10B981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#EF4444",
              secondary: "#fff",
            },
          },
        }}
      />
      
      <Routes>

        <Route path="/" element={<Home darkMode={darkMode} />} />
        <Route path="/login" element={<Login darkMode={darkMode} setUser={setUser} />} />
        <Route path="/signup" element={<Signup darkMode={darkMode} />} />
        <Route path="/faq" element={<Faq darkMode={darkMode} />} />
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard darkMode={darkMode} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sip"
          element={
            <ProtectedRoute>
              <SipCalculator darkMode={darkMode} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/emi"
          element={
            <ProtectedRoute>
              <EmiCalculator darkMode={darkMode} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/expense"
          element={
            <ProtectedRoute>
              <ExpenseTracker darkMode={darkMode} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/goal"
          element={
            <ProtectedRoute>
              <SavingsGoal darkMode={darkMode} />
            </ProtectedRoute>
          }
        />

        <Route path="/blogs" element={<Blogs darkMode={darkMode} />} />

        <Route path="/blog/:id" element={<BlogDetails darkMode={darkMode} />} />

        <Route path="*" element={<Navigate to="/" />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MyAccount
                  darkMode={darkMode}
                  setDarkMode={setDarkMode}
                  setUser={setUser}
              />
            </ProtectedRoute>
          }
        />

        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/blogs" element={<ManageBlogs />} />
        <Route path="/admin/blogs/create" element={<CreateBlog />} />
        <Route path="/admin/blogs/edit/:id" element={<CreateBlog />} />
        <Route path="/admin/faqs" element={<ManageFAQs />} />
        <Route path="/admin/faqs/create" element={<CreateFAQs />} />
        <Route path="/admin/faqs/edit/:id" element={<CreateFAQs />} />
      </Routes>
      {user && (
        <>
          <FloatingAIButton
            onClick={() => setOpenAI(true)}
          />

          <AIDrawer
              open={openAI}
              onClose={() => setOpenAI(false)}
          />
        </>
      )}

    </div>
  );
}

export default App;