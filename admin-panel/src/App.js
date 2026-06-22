import { BrowserRouter } from "react-router-dom";
import { AdminAuthProvider } from "./context/AuthContext";
import AdminRoutes from "./routes/AdminRoutes";

function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <AdminRoutes />
      </AdminAuthProvider>
    </BrowserRouter>
  );
}

export default App;
