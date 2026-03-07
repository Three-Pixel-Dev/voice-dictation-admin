import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { ThemeProvider } from "@/lib/theme-provider"
import { SidebarProvider } from "@/lib/sidebar-context"
import { Toaster } from "@/components/ui/sonner"
import { MainLayout } from "@/components/layout/MainLayout"
import { SignIn } from "@/features/auth/pages/SignIn"
import { Unauthorized } from "@/features/auth/pages/Unauthorized"
import { Dashboard } from "@/features/dashboard/pages/Dashboard"
import { VoiceNotes } from "@/features/voice-notes/pages/VoiceNotes"
import { VoiceNoteDetail } from "@/features/voice-notes/pages/VoiceNoteDetail"
import { MemberLevels } from "@/features/member-levels/pages/MemberLevels"
import { MemberLevelCodes } from "@/features/member-levels/pages/MemberLevelCodes"
import { Users } from "@/features/users/pages/Users"
import { Settings } from "@/features/settings/pages/Settings"
import { authService } from "@/features/auth/services/auth.service"
import "./App.css"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated())

  useEffect(() => {
    const checkAuthStatus = () => {
      setIsAuthenticated(authService.isAuthenticated())
    }

    window.addEventListener("auth-logout", checkAuthStatus)
    window.addEventListener("storage", checkAuthStatus)
    return () => {
      window.removeEventListener("auth-logout", checkAuthStatus)
      window.removeEventListener("storage", checkAuthStatus)
    }
  }, [])

  const isAdmin = authService.isAdmin()

  return (
    <ThemeProvider defaultTheme="system" storageKey="voice-dictation-theme">
      <SidebarProvider>
        <Toaster />
        <BrowserRouter>
      <Routes>
        <Route
          path="/signin"
          element={
            isAuthenticated
              ? isAdmin
                ? <Navigate to="/dashboard" replace />
                : <Navigate to="/unauthorized" replace />
              : <SignIn />
          }
        />
        <Route
          path="/unauthorized"
          element={
            !isAuthenticated
              ? <Navigate to="/signin" replace />
              : <Unauthorized />
          }
        />
        <Route
          path="/"
          element={
            !isAuthenticated
              ? <Navigate to="/signin" replace />
              : !isAdmin
                ? <Unauthorized />
                : (
              <MainLayout>
                <Dashboard />
              </MainLayout>
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            !isAuthenticated
              ? <Navigate to="/signin" replace />
              : !isAdmin
                ? <Unauthorized />
                : (
              <MainLayout>
                <Dashboard />
              </MainLayout>
            )
          }
        />
        <Route
          path="/voice-notes"
          element={
            !isAuthenticated
              ? <Navigate to="/signin" replace />
              : !isAdmin
                ? <Unauthorized />
                : (
              <MainLayout>
                <VoiceNotes />
              </MainLayout>
            )
          }
        />
        <Route
          path="/voice-notes/:id"
          element={
            !isAuthenticated
              ? <Navigate to="/signin" replace />
              : !isAdmin
                ? <Unauthorized />
                : (
              <MainLayout>
                <VoiceNoteDetail />
              </MainLayout>
            )
          }
        />
        <Route
          path="/member-levels"
          element={
            !isAuthenticated
              ? <Navigate to="/signin" replace />
              : !isAdmin
                ? <Unauthorized />
                : (
              <MainLayout>
                <MemberLevels />
              </MainLayout>
            )
          }
        />
        <Route
          path="/member-level-codes"
          element={
            !isAuthenticated
              ? <Navigate to="/signin" replace />
              : !isAdmin
                ? <Unauthorized />
                : (
              <MainLayout>
                <MemberLevelCodes />
              </MainLayout>
            )
          }
        />
        <Route
          path="/users"
          element={
            !isAuthenticated
              ? <Navigate to="/signin" replace />
              : !isAdmin
                ? <Unauthorized />
                : (
              <MainLayout>
                <Users />
              </MainLayout>
            )
          }
        />
        <Route
          path="/settings"
          element={
            !isAuthenticated
              ? <Navigate to="/signin" replace />
              : !isAdmin
                ? <Unauthorized />
                : (
              <MainLayout>
                <Settings />
              </MainLayout>
            )
          }
        />
      </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </ThemeProvider>
  )
}

export default App
