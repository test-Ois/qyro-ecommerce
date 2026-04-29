import ChatWidget from "../components/ChatWidget";
import Footer from "../components/footer/Footer";
import Navbar from "../components/Navbar";

function MainLayout({ children, notifications, setNotifications, shouldShowChat, totalItems }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        totalItems={totalItems}
        notifications={notifications}
        setNotifications={setNotifications}
      />

      <main className="min-w-0 flex-1">{children}</main>

      {shouldShowChat && <ChatWidget />}
      <Footer />
    </div>
  );
}

export default MainLayout;
