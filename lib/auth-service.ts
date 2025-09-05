//lib/auth-service.ts
import axios from "axios";
import { z } from "zod";

const API_BASE_URL = "https://fixit-dashboard-api.onrender.com";
//const API_BASE_URL = "http://localhost:3001";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export const authService = {
  async register(userData: z.infer<typeof registerSchema>) {
    const validatedData = registerSchema.parse(userData);

    try {
      // Check if user already exists
      const response = await axios.get(`${API_BASE_URL}/users`);
      const users = response.data;

      const existingUser = users.find(
        (u: any) => u.email === validatedData.email
      );
      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      // In a real app, you would hash the password here
      // const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      // For now, we'll just store the plain password (NOT recommended for production)
      const newUser = {
        id: users.length + 1,
        name: validatedData.name,
        email: validatedData.email,
        password: validatedData.password, // In real app, use hashedPassword
        role: "admin",
        createdAt: new Date().toISOString(),
        lastLogin: null,
        isActive: true,
      };

      await axios.post(`${API_BASE_URL}/users`, newUser);

      return { success: true };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error("Network error. Please try again.");
      }
      throw error;
    }
  },

  async login(credentials: z.infer<typeof loginSchema>) {
    console.log("AuthService.login called with:", credentials); // Debug log
    const validatedData = loginSchema.parse(credentials);

    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      const users = response.data;

      const user = users.find((u: any) => u.email === validatedData.email);

      if (!user) {
        throw new Error("Invalid email or password");
      }

      // In a real app, you would compare hashed passwords
      // const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);

      // For now, we'll compare plain text passwords (NOT recommended for production)
      if (validatedData.password !== user.password) {
        throw new Error("Invalid email or password");
      }

      const token = `token_${user.id}_${Date.now()}`;

      await axios.patch(`${API_BASE_URL}/users/${user.id}`, {
        lastLogin: new Date().toISOString(),
      });

      console.log("AuthService returning:", { user, token }); // Debug log

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error("Network error. Please try again.");
      }
      throw error;
    }
  },
};
