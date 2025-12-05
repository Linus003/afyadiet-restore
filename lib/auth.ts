import crypto from "crypto"
import { db } from "./db"

// --- Password Hashing (Kept exactly the same) ---

export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex")
    crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
      if (err) reject(err)
      resolve(`${salt}:${derivedKey.toString("hex")}`)
    })
  })
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, key] = hash.split(":")
    crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
      if (err) reject(err)
      resolve(key === derivedKey.toString("hex"))
    })
  })
}

// --- Database Functions (Updated for Prisma) ---

export async function createUser(email: string, password: string, fullName: string, role: "client" | "nutritionist") {
  const passwordHash = await hashPassword(password)

  // Use Prisma to create the user
  const newUser = await db.user.create({
    data: {
      email,
      password_hash: passwordHash,
      name: fullName, // Mapping 'fullName' input to 'name' database field
      role,
    },
  })

  return newUser
}

export async function getUserByEmail(email: string) {
  // Use Prisma to find the user by email
  const user = await db.user.findUnique({
    where: { email },
  })
  return user
}

export async function getUserById(id: string | number) {
  // Use Prisma to find by ID
  // Note: We ensure ID is a number because your MariaDB uses Integer IDs
  const userId = typeof id === 'string' ? parseInt(id) : id;

  const user = await db.user.findUnique({
    where: { id: userId },
  })
  return user
}