import "./MyAccount.css";

function AccountSidebar({ activeSection, setActiveSection }) {

  const menu = [
    {
      id: "personal",
      icon: "👤",
      label: "Personal Info",
    },
    {
      id: "security",
      icon: "🔒",
      label: "Security",
    },
    {
      id: "language",
      icon: "🌐",
      label: "Language",
    },
    {
      id: "appearance",
      icon: "🎨",
      label: "Appearance",
    },
    {
      id: "notifications",
      icon: "🔔",
      label: "Notifications",
    },
    {
      id: "activity",
      icon: "📊",
      label: "Activity",
    },
    {
      id:"about",
      icon: " ℹ",
      label:"About",
    },
    {
      id: "logout",
      icon: "🚪",
      label: "Logout",
    },
  ];

  return (
    <div className="account-sidebar">

      {menu.map((item) => (

        <button
          key={item.id}
          className={
            activeSection === item.id
              ? "sidebar-item active"
              : "sidebar-item"
          }
          onClick={() => setActiveSection(item.id)}
        >

          <span>{item.icon}</span>

          {item.label}

        </button>

      ))}

    </div>
  );
}

export default AccountSidebar;