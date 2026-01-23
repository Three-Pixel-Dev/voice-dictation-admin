import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Key, Eye, EyeOff, Shield, Edit, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { authService } from "@/features/auth/services/auth.service"
import { profileService } from "@/features/profile/services/profile.service"
import type { Profile } from "@/features/profile/services/profile.service"

export function Settings() {
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [apiKeyMode, setApiKeyMode] = useState<"default" | "custom">("default")
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [isEditingApiKey, setIsEditingApiKey] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [savingApiKey, setSavingApiKey] = useState(false)

  // Fetch current user's profile
  useEffect(() => {
    const fetchProfile = async () => {
      const user = authService.getUser()
      if (!user?.userId) {
        setLoadingProfile(false)
        return
      }

      try {
        setLoadingProfile(true)
        const profileData = await profileService.getByUserId(user.userId)
        setProfile(profileData)
        
        // Auto-fill profile form data
        setProfileData({
          name: profileData.name || "",
          email: user.email || "",
          phone: "", // Phone number is blank
        })
        
        // Auto-select based on useDefaultApiKey
        if (profileData.useDefaultApiKey === false) {
          setApiKeyMode("custom")
          setApiKey(profileData.apiKey || "")
        } else {
          setApiKeyMode("default")
          setApiKey("")
        }
      } catch (error: any) {
        console.error("Failed to fetch profile:", error)
        toast.error("Failed to load profile settings")
      } finally {
        setLoadingProfile(false)
      }
    }

    fetchProfile()
  }, [])

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement profile update
    console.log("Profile updated:", profileData)
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords do not match")
      return
    }
    // TODO: Implement password change
    console.log("Password changed")
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
  }

  const handleApiKeySubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    if (apiKeyMode === "custom" && !apiKey.trim()) {
      toast.error("Please enter your API key")
      return
    }

    try {
      setSavingApiKey(true)
      const updatedProfile = await profileService.updateApiKey({
        useDefaultApiKey: apiKeyMode === "default",
        apiKey: apiKeyMode === "custom" ? apiKey : undefined,
      })
      
      setProfile(updatedProfile)
      toast.success("API key settings saved successfully")
      setIsEditingApiKey(false)
      if (apiKeyMode === "default") {
        setApiKey("")
      }
    } catch (error: any) {
      console.error("Failed to save API key:", error)
      toast.error(error.message || "Failed to save API key settings")
    } finally {
      setSavingApiKey(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Change Password</TabsTrigger>
          <TabsTrigger value="api-key">API Key</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your profile information and personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="" alt={profileData.name} />
                  <AvatarFallback className="text-lg">
                    {profileData.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    Change Avatar
                  </Button>
                  <p className="mt-2 text-sm text-muted-foreground">
                    JPG, GIF or PNG. Max size of 2MB.
                  </p>
                </div>
              </div>

              <Separator />

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({ ...profileData, email: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                  />
                </div>
                <Button type="submit">Save Changes</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <Button type="submit">Update Password</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-key" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-primary/10">
                  <Key className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle>Custom AI Model</CardTitle>
                  <CardDescription>Bring your own API key</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingProfile ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
              <form onSubmit={handleApiKeySubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        apiKeyMode === "default"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => {
                        if (loadingProfile) return
                        setApiKeyMode("default")
                        setIsEditingApiKey(false)
                        setApiKey("")
                      }}
                    >
                      <div className="mt-0.5">
                        <div
                          className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                            apiKeyMode === "default"
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {apiKeyMode === "default" && (
                            <div className="h-2 w-2 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <Label className="text-base font-medium cursor-pointer">
                          Use Default API Key
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Use the system default API key for AI operations
                        </p>
                      </div>
                    </div>

                    <div
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        apiKeyMode === "custom"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      } ${loadingProfile ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() => {
                        if (loadingProfile) return
                        setApiKeyMode("custom")
                        setIsEditingApiKey(true)
                      }}
                    >
                      <div className="mt-0.5">
                        <div
                          className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                            apiKeyMode === "custom"
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {apiKeyMode === "custom" && (
                            <div className="h-2 w-2 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-medium cursor-pointer">
                            Use Your API Key
                          </Label>
                          {apiKeyMode === "custom" && !isEditingApiKey && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setIsEditingApiKey(true)
                              }}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Use your own API key for AI operations
                        </p>
                      </div>
                    </div>
                  </div>

                  {apiKeyMode === "custom" && isEditingApiKey && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="space-y-2">
                        <Label htmlFor="apiKey">API Key</Label>
                        <div className="relative">
                          <Input
                            id="apiKey"
                            type={showApiKey ? "text" : "password"}
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="sk-..."
                            className="pr-10"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowApiKey(!showApiKey)}
                          >
                            {showApiKey ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          Your API key is stored securely on your device and never sent to our servers.
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditingApiKey(false)
                          // Reset to current profile values
                          if (profile) {
                            if (profile.useDefaultApiKey === false) {
                              setApiKey(profile.apiKey || "")
                            } else {
                              setApiKey("")
                            }
                          }
                        }}
                        disabled={savingApiKey}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}

                  {apiKeyMode === "custom" && !isEditingApiKey && apiKey && (
                    <div className="p-3 rounded-lg bg-muted/50 border">
                      <p className="text-sm text-muted-foreground">
                        API key is configured. Click "Edit" to change it.
                      </p>
                    </div>
                  )}

                  {/* Save Button */}
                  <div className="pt-4 border-t flex justify-end">
                    <Button 
                      type="button"
                      onClick={() => handleApiKeySubmit()}
                      disabled={savingApiKey || loadingProfile}
                      className="w-full sm:w-auto"
                    >
                      {savingApiKey ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save"
                      )}
                    </Button>
                  </div>
                </div>
              </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
