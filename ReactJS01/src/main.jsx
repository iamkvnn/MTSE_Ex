import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import HomePage from './pages/home.jsx'
import UserPage from './pages/user.jsx'
import RegisterPage from './pages/register.jsx'
import LoginPage from './pages/login.jsx'
import ProductsPage from './pages/products.jsx'
import AdminPage from './pages/admin.jsx'
import CartPage from './pages/cart.jsx'
import { AuthWrapper } from './components/context/auth.context.jsx'
import { ApolloProvider } from '@apollo/client/react'
import { apolloClient } from './utils/apolloClient.js'


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "user",
        element: <UserPage />,
      },
      {
        path: "products",
        element: <ProductsPage />,
      },
      {
        path: "admin",
        element: <AdminPage />,
      },
      {
        path: "cart",
        element: <CartPage />,
      },
    ],
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <AuthWrapper>
        <RouterProvider router={router} />
      </AuthWrapper>
    </ApolloProvider>
  </StrictMode>,
)
