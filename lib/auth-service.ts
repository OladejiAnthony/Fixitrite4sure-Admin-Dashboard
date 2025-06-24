import axios from "axios"
import { z } from "zod"

const API_BASE_URL = "http://localhost:3001"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

export const authService = {
  async login(credentials: z.infer<typeof loginSchema>) {
    const validatedData = loginSchema.parse(credentials)

    try {
      // Get all users from db.json
      const response = await axios.get(`${API_BASE_URL}/users`)
      const users = response.data

      // Find user with matching email
      const user = users.find((u: any) => u.email === validatedData.email)

      if (!user) {
        throw new Error("Invalid email or password")
      }

      // In a real app, you'd verify the hashed password
      // For demo purposes, we'll check if password is 'password123'
      if (validatedData.password !== "password123") {
        throw new Error("Invalid email or password")
      }

      // Generate a simple token (in real app, use JWT)
      const token = `token_${user.id}_${Date.now()}`

      // Update last login
      await axios.patch(`${API_BASE_URL}/users/${user.id}`, {
        lastLogin: new Date().toISOString(),
      })

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error("Network error. Please try again.")
      }
      throw error
    }
  },

  async register(userData: z.infer<typeof registerSchema>) {
    const validatedData = registerSchema.parse(userData)

    try {
      // Check if user already exists
      const response = await axios.get(`${API_BASE_URL}/users`)
      const users = response.data

      const existingUser = users.find((u: any) => u.email === validatedData.email)
      if (existingUser) {
        throw new Error("User with this email already exists")
      }

      // Create new user
      const newUser = {
        id: users.length + 1,
        name: validatedData.name,
        email: validatedData.email,
        password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // hashed 'password123'
        role: "admin",
        createdAt: new Date().toISOString(),
        lastLogin: null,
        isActive: true,
      }

      await axios.post(`${API_BASE_URL}/users`, newUser)

      return { success: true }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error("Network error. Please try again.")
      }
      throw error
    }
  },
}
