import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './views/Auth/Login'
import ForgotPassword from './views/Auth/Forgotpassword'
import VerifyOtp from './views/Auth/Verifyotp'

import Layout from './views/Layout/Layout'
import Dashboard from './views/Dashboard/Dashboard'
import Users from './views/Users/Users'
import Recipes from './views/Recipes/Recipes'
import Profile from './views/Profile/Profile'
import Employees from './views/Employees/Employees'
import Categories from './views/Categories/Categories'
import AddRecipe from './views/Recipes/AddRecipe'
import RecipeDetail from './views/Recipes/RecipeDetail'
import Posts from './views/Posts/Posts'
import PostDetail from './views/Posts/PostDetail'
import ProtectedRoute from './routes/ProtectedRoute'
import Analytics from './views/Analytics/Analytics'
import AuditLog from './views/AuditLog/AuditLog'
import Notifications from './views/Notifications/Notifications';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"           element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp"      element={<VerifyOtp />} />


        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"      element={<Dashboard />} />
          <Route path="recipes"        element={<Recipes />} />
          <Route path="recipes/add"    element={<AddRecipe />} />
          <Route path="recipes/:id" element={<RecipeDetail />} />
          <Route path="profile"        element={<Profile />} />
          <Route path="categories"     element={<Categories />} />
          <Route path="users"          element={<Users />} />
          <Route path="posts"          element={<Posts />} />
          <Route path="posts/:id"       element={<PostDetail />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="audit-log" element={
  <ProtectedRoute requiredRole="admin">
    <AuditLog />
  </ProtectedRoute>
} />
          <Route path="/notifications" element={<Notifications />} />

          {/* Admin فقط */}
          <Route path="employees" element={
            <ProtectedRoute requiredRole="admin">
              <Employees />
            </ProtectedRoute>
          } />
        </Route>

        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App