import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Faq from "./pages/Faq";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import ManageBlogs from "./pages/ManageBlogs";
import ManageFAQs from "./pages/ManageFAQs";
import CreateBlog from "./pages/CreateBlog";
import CreateFAQs from "./pages/CreateFAQs";
import ManagePlans from "./pages/ManagePlans";
import ManageSubscribers from "./pages/ManageSubscribers";
import ManageUsers from "./pages/ManageUsers";
import AdminShell from "./pages/AdminShell";
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
import FinancialSummary from "./pages/FinancialSummary";
import BlogDetails from "./pages/BlogDetails";
import {Toaster} from "react-hot-toast";
import FloatingAIButton from "./components/FloatingAIButton";
import AIDrawer from "./components/AIDrawer";
import AIAssistant from "./pages/AIAssistant";
import SmartCalendar from "./pages/SmartCalendar";
import BudgetPlanner from "./pages/BudgetPlanner";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AdminLogin from "./pages/AdminLogin";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import ManagePayments from "./pages/ManagePayments";
import "./App.css";

function App() {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );
  const [openAI, setOpenAI] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme !== null) {
      setDarkMode(JSON.parse(savedTheme));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className={darkMode ? "app dark" : "app"}>
      {!isAdminRoute && (
        <Navbar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          user={user}
          setUser={setUser}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      )}

      {/* Sidebar overlay and hamburger are handled inside Navbar to avoid duplicates */}

        <main className={isAdminRoute ? "admin-route-content" : `page-content ${sidebarOpen ? "sidebar-open" : ""}`}>
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
        <Route path="/financial-summary" element={<FinancialSummary darkMode={darkMode} />} />

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

        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminDashboard
                darkMode={darkMode}
                setDarkMode={setDarkMode}
              />
            </AdminProtectedRoute>
          }
        />

        <Route
            path="/admin-dashboard"
            element={
                <AdminProtectedRoute>
                    <AdminDashboard
                      darkMode={darkMode}
                      setDarkMode={setDarkMode}
                    />
                </AdminProtectedRoute>
            }
        />

        <Route
            path="/admin/blogs"
            element={
                <AdminProtectedRoute>
                    <AdminShell darkMode={darkMode} setDarkMode={setDarkMode}>
                        <ManageBlogs />
                    </AdminShell>
                </AdminProtectedRoute>
            }
        />

        <Route
            path="/admin/blogs/create"
            element={
                <AdminProtectedRoute>
                    <AdminShell darkMode={darkMode} setDarkMode={setDarkMode}>
                        <CreateBlog />
                    </AdminShell>
                </AdminProtectedRoute>
            }
        />

        <Route
            path="/admin/blogs/edit/:id"
            element={
                <AdminProtectedRoute>
                    <AdminShell darkMode={darkMode} setDarkMode={setDarkMode}>
                        <CreateBlog />
                    </AdminShell>
                </AdminProtectedRoute>
            }
        />

        <Route
            path="/admin/faqs"
            element={
                <AdminProtectedRoute>
                    <AdminShell darkMode={darkMode} setDarkMode={setDarkMode}>
                        <ManageFAQs />
                    </AdminShell>
                </AdminProtectedRoute>
            }
        />

        <Route
            path="/admin/faqs/create"
            element={
                <AdminProtectedRoute>
                    <AdminShell darkMode={darkMode} setDarkMode={setDarkMode}>
                        <CreateFAQs />
                    </AdminShell>
                </AdminProtectedRoute>
            }
        />

        <Route
            path="/admin/faqs/edit/:id"
            element={
                <AdminProtectedRoute>
                    <AdminShell darkMode={darkMode} setDarkMode={setDarkMode}>
                        <CreateFAQs />
                    </AdminShell>
                </AdminProtectedRoute>
            }
        />

        <Route
            path="/admin/users"
            element={
                <AdminProtectedRoute>
                    <AdminShell darkMode={darkMode} setDarkMode={setDarkMode}>
                        <ManageUsers />
                    </AdminShell>
                </AdminProtectedRoute>
            }
        />

        <Route
            path="/admin/subscriptions/plans"
            element={
                <AdminProtectedRoute>
                    <AdminShell darkMode={darkMode} setDarkMode={setDarkMode}>
                        <ManagePlans />
                    </AdminShell>
                </AdminProtectedRoute>
            }
        />

        <Route
            path="/admin/subscriptions/subscribers"
            element={
                <AdminProtectedRoute>
                    <AdminShell darkMode={darkMode} setDarkMode={setDarkMode}>
                        <ManageSubscribers />
                    </AdminShell>
                </AdminProtectedRoute>
            }
        />
        <Route
          path="/admin/subscriptions/payments"
          element={
              <AdminProtectedRoute>
                  <AdminShell darkMode={darkMode} setDarkMode={setDarkMode}>
                      <ManagePayments />
                  </AdminShell>
              </AdminProtectedRoute>
          }
      />

      <Route
          path="/admin/premium-users"
          element={
              <AdminProtectedRoute>
                  <AdminShell darkMode={darkMode} setDarkMode={setDarkMode}>
                      <ManageSubscribers />
                  </AdminShell>
              </AdminProtectedRoute>
          }
      />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <SmartCalendar darkMode={darkMode} />
            </ProtectedRoute>
          }
        />
        <Route
            path="/budget"
            element={
                <ProtectedRoute>
                    <BudgetPlanner darkMode={darkMode} />
                </ProtectedRoute>
            }
        />
        <Route
            path="/admin-login"
            element={<AdminLogin />}
        />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      </Routes>
      {user && !isAdminRoute && (
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
      </main>
    </div>
  );
}

export default App;