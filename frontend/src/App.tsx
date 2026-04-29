import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminBrokers } from "./pages/AdminBrokers";
import { AdminProperties } from "./pages/AdminProperties";
import { AdminRequests } from "./pages/AdminRequests";
import { Agios } from "./pages/Agios";
import { BrokerDashboard } from "./pages/BrokerDashboard";
import { CustomerFavorites } from "./pages/CustomerFavorites";
import { Home } from "./pages/Home";
import { EditProperty } from "./pages/EditProperty";
import { EditAgio } from "./pages/EditAgio";
import { Login } from "./pages/Login";
import { InviteRegister } from "./pages/InviteRegister";
import { PropertyDetails } from "./pages/PropertyDetails";
import { Register } from "./pages/Register";
import { SalesControls } from "./pages/SalesControls";
import { ProtectedRoute } from "./routes/ProtectedRoute";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/agios", element: <Agios /> },
      { path: "/properties/:id", element: <PropertyDetails /> },
      { path: "/invite/:token", element: <InviteRegister /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      {
        element: <ProtectedRoute roles={["ADMIN_IMOBILIARIA"]} />,
        children: [{ path: "/planilhas", element: <SalesControls /> }]
      },
      {
        element: <ProtectedRoute roles={["ADMIN_IMOBILIARIA"]} />,
        children: [
          { path: "/admin", element: <AdminDashboard /> },
          { path: "/admin/imoveis", element: <AdminProperties /> },
          { path: "/admin/pedidos", element: <AdminRequests /> },
          { path: "/admin/corretores", element: <AdminBrokers /> },
          { path: "/admin/imoveis/:id/editar", element: <EditProperty /> },
          { path: "/admin/agios/:id/editar", element: <EditAgio /> }
        ]
      },
      {
        element: <ProtectedRoute roles={["CORRETOR"]} />,
        children: [{ path: "/broker", element: <BrokerDashboard /> }]
      },
      {
        element: <ProtectedRoute roles={["CLIENTE"]} />,
        children: [{ path: "/cliente/favoritos", element: <CustomerFavorites /> }]
      }
    ]
  }
]);

export function App() {
  return <RouterProvider router={router} />;
}
