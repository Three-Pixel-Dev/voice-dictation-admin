import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "@/lib/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { MainLayout } from "@/components/layout/MainLayout"
import { SignIn } from "@/features/auth/pages/SignIn"
import { Dashboard } from "@/features/dashboard/pages/Dashboard"
import { MemberLevels } from "@/features/member-levels/pages/MemberLevels"
import { Users } from "@/features/users/pages/Users"
import { Settings } from "@/features/settings/pages/Settings"
import "./App.css"

function App() {
  // TODO: Add authentication check
  const isAuthenticated = true // Replace with actual auth check

  return (
    <ThemeProvider defaultTheme="system" storageKey="voice-dictation-theme">
      <Toaster />
      <BrowserRouter>
      <Routes>
        <Route
          path="/signin"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <SignIn />}
        />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <MainLayout>
                <Dashboard />
              </MainLayout>
            ) : (
              <Navigate to="/signin" />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <MainLayout>
                <Dashboard />
              </MainLayout>
            ) : (
              <Navigate to="/signin" />
            )
          }
        />
        <Route
          path="/member-levels"
          element={
            isAuthenticated ? (
              <MainLayout>
                <MemberLevels />
              </MainLayout>
            ) : (
              <Navigate to="/signin" />
            )
          }
        />
        <Route
          path="/users"
          element={
            isAuthenticated ? (
              <MainLayout>
                <Users />
              </MainLayout>
            ) : (
              <Navigate to="/signin" />
            )
          }
        />
        <Route
          path="/settings"
          element={
            isAuthenticated ? (
              <MainLayout>
                <Settings />
              </MainLayout>
            ) : (
              <Navigate to="/signin" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
