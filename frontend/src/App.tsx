import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminBrokers } from "./pages/AdminBrokers";
import { AdminProperties } from "./pages/AdminProperties";
import { AdminRequests } from "./pages/AdminRequests";
import { BrokerDashboard } from "./pages/BrokerDashboard";
import { Home } from "./pages/Home";
import { EditProperty } from "./pages/EditProperty";
import { Login } from "./pages/Login";
import { InviteRegister } from "./pages/InviteRegister";
import { PropertyDetails } from "./pages/PropertyDetails";
import { Register } from "./pages/Register";
import { ProtectedRoute } from "./routes/ProtectedRoute";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/properties/:id", element: <PropertyDetails /> },
      { path: "/invite/:token", element: <InviteRegister /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      {
        element: <ProtectedRoute roles={["ADMIN_IMOBILIARIA"]} />,
        children: [
          { path: "/admin", element: <AdminDashboard /> },
          { path: "/admin/imoveis", element: <AdminProperties /> },
          { path: "/admin/pedidos", element: <AdminRequests /> },
          { path: "/admin/corretores", element: <AdminBrokers /> },
          { path: "/admin/imoveis/:id/editar", element: <EditProperty /> }
        ]
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
