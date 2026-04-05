import prisma from "../models/db";
import { hashPassword, verifyPassword, userToDTO } from "../utils";
import { AppError, UserWithoutPassword, AuthResponse } from "../types";
import { CreateUserInput, UpdateUserInput } from "../validators";
import { generateToken } from "../utils";
import { User } from "@prisma/client";

export class UserService {
  // Create a new user
  async createUser(input: CreateUserInput): Promise<UserWithoutPassword> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new AppError("User already exists", 409, "USER_ALREADY_EXISTS");
    }

    // Hash password
    const hashedPassword = await hashPassword(input.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.name,
        role: input.role || "VIEWER",
      },
    });

    return userToDTO(user);
  }

  // Get user by ID
  async getUserById(userId: string): Promise<UserWithoutPassword> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    return userToDTO(user);
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  // Get all users (admin only)
  async getAllUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count(),
    ]);

    return {
      users: users.map(userToDTO),
      total,
      pages: Math.ceil(total / limit),
    };
  }

  // Update user
  async updateUser(
    userId: string,
    input: UpdateUserInput,
  ): Promise<UserWithoutPassword> {
    // Verify user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    // Prepare update data
    const updateData: any = {};
    if (input.name) updateData.name = input.name;
    if (input.role) updateData.role = input.role;
    if (input.status) updateData.status = input.status;
    if (input.password) {
      updateData.password = await hashPassword(input.password);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return userToDTO(updatedUser);
  }

  // Deactivate user (soft delete)
  async deactivateUser(userId: string): Promise<UserWithoutPassword> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: "INACTIVE" },
    });

    return userToDTO(updatedUser);
  }

  // Authenticate user
  async authenticate(email: string, password: string): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    if (user.status === "INACTIVE") {
      throw new AppError("User account is inactive", 403, "FORBIDDEN");
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    const token = generateToken(user.id, user.email, user.role);

    return {
      user: userToDTO(user),
      token,
    };
  }

  // Check if user has permission to update another user
  isAllowedToUpdateUser(
    requestingUserId: string,
    requestingUserRole: string,
    targetUserId: string,
  ) {
    if (requestingUserRole === "ADMIN") {
      return true;
    }
    return requestingUserId === targetUserId;
  }

  // Get user statistics (for admin dashboard)
  async getUserStatistics() {
    const [totalUsers, activeUsers, usersByRole] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.user.groupBy({
        by: ["role"],
        _count: true,
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      byRole: usersByRole.reduce(
        (acc: Record<string, number>, item: any) => {
          acc[item.role] = item._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }
}

export default new UserService();
