"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface User {
  id: string
  name: string
  email: string
  phone: string
  referralCode: string
  referralPoints: number
  referralCount: number
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (
    name: string,
    email: string,
    phone: string,
    password: string,
    usedReferralCode?: string,
  ) => Promise<boolean>
  logout: () => void
  updateProfile: (data: { name: string; email: string; phone: string }) => Promise<boolean>
  resetPassword: (currentPassword: string, newPassword: string) => Promise<boolean>
  generateReferralCode: () => string
  redeemPoints: (points: number) => Promise<boolean>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = "RESTAT-"
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("restat_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem("restat_users") || "[]")
    const foundUser = users.find((u: User & { password: string }) => u.email === email && u.password === password)

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem("restat_user", JSON.stringify(userWithoutPassword))
      return true
    }
    return false
  }

  const register = async (
    name: string,
    email: string,
    phone: string,
    password: string,
    usedReferralCode?: string,
  ): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem("restat_users") || "[]")

    if (users.some((u: User) => u.email === email)) {
      return false
    }

    if (usedReferralCode) {
      const referrerIndex = users.findIndex((u: User) => u.referralCode === usedReferralCode)
      if (referrerIndex !== -1) {
        users[referrerIndex].referralPoints = (users[referrerIndex].referralPoints || 0) + 10000
        users[referrerIndex].referralCount = (users[referrerIndex].referralCount || 0) + 1
      }
    }

    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      phone,
      password,
      referralCode: "",
      referralPoints: 0,
      referralCount: 0,
    }

    users.push(newUser)
    localStorage.setItem("restat_users", JSON.stringify(users))

    const { password: _, ...userWithoutPassword } = newUser
    setUser(userWithoutPassword)
    localStorage.setItem("restat_user", JSON.stringify(userWithoutPassword))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("restat_user")
  }

  const updateProfile = async (data: { name: string; email: string; phone: string }): Promise<boolean> => {
    if (!user) return false

    const users = JSON.parse(localStorage.getItem("restat_users") || "[]")
    const userIndex = users.findIndex((u: User) => u.id === user.id)

    if (userIndex === -1) return false

    // Check if new email is already taken by another user
    if (data.email !== user.email && users.some((u: User) => u.email === data.email && u.id !== user.id)) {
      return false
    }

    users[userIndex] = { ...users[userIndex], ...data }
    localStorage.setItem("restat_users", JSON.stringify(users))

    const updatedUser = { ...user, ...data }
    setUser(updatedUser)
    localStorage.setItem("restat_user", JSON.stringify(updatedUser))
    return true
  }

  const resetPassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false

    const users = JSON.parse(localStorage.getItem("restat_users") || "[]")
    const userIndex = users.findIndex(
      (u: User & { password: string }) => u.id === user.id && u.password === currentPassword,
    )

    if (userIndex === -1) return false

    users[userIndex].password = newPassword
    localStorage.setItem("restat_users", JSON.stringify(users))
    return true
  }

  const generateReferralCode = (): string => {
    if (!user) return ""

    const users = JSON.parse(localStorage.getItem("restat_users") || "[]")
    const userIndex = users.findIndex((u: User) => u.id === user.id)

    if (userIndex === -1) return ""

    // If user already has a code, return it
    if (users[userIndex].referralCode) {
      return users[userIndex].referralCode
    }

    const newCode = generateCode()
    users[userIndex].referralCode = newCode
    localStorage.setItem("restat_users", JSON.stringify(users))

    const updatedUser = { ...user, referralCode: newCode }
    setUser(updatedUser)
    localStorage.setItem("restat_user", JSON.stringify(updatedUser))

    return newCode
  }

  const redeemPoints = async (points: number): Promise<boolean> => {
    if (!user || user.referralPoints < points) return false

    const users = JSON.parse(localStorage.getItem("restat_users") || "[]")
    const userIndex = users.findIndex((u: User) => u.id === user.id)

    if (userIndex === -1) return false

    users[userIndex].referralPoints -= points
    localStorage.setItem("restat_users", JSON.stringify(users))

    const updatedUser = { ...user, referralPoints: user.referralPoints - points }
    setUser(updatedUser)
    localStorage.setItem("restat_user", JSON.stringify(updatedUser))

    return true
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateProfile,
        resetPassword,
        generateReferralCode,
        redeemPoints,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
