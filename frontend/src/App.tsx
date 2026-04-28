import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AdminDashboard } from "./pages/AdminDashboard";
import { BrokerDashboard } from "./pages/BrokerDashboard";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { PropertyDetails } from "./pages/PropertyDetails";
import { Register } from "./pages/Register";
import { ProtectedRoute } from "./routes/ProtectedRoute";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/properties/:id", element: <PropertyDetails /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      {
        element: <ProtectedRoute roles={["ADMIN_IMOBILIARIA"]} />,
        children: [{ path: "/admin", element: <AdminDashboard /> }]
      },
      {
        element: <ProtectedRoute roles={["CORRETOR"]} />,
        children: [{ path: "/broker", element: <BrokerDashboard /> }]
      }
    ]
  }
]);

export function App() {
  return <RouterProvider router={router} />;
}
