import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function resetPassword() {
  // --- USER CONFIGURATION ---
  const adminEmail = "linusmuriuki24@gmail.com"
  const newPassword = "Kendi2002"
  // --------------------------

  if (newPassword.length < 8) {
    console.error("❌ Error: New password must be at least 8 characters long.")
    return
  }

  try {
    console.log(`Hashing new password for ${adminEmail}...`)
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    // Find and update the user
    const user = await prisma.user.update({
      where: { email: adminEmail },
      data: { password_hash: hashedPassword },
    })

    console.log(`\n✅ Success! Password for user "${user.name}" has been reset.`)
    console.log("You can now log in with your new password.")

  } catch (e) {
    console.error(`\n❌ Error: Could not update password for ${adminEmail}. Check if the email exists in the database.`)
    // FIX: Removed TypeScript assertion 'as Error' and used safe JS error handling
    console.error(`Reason: ${e instanceof Error ? e.message : String(e)}`) 
  } finally {
    await prisma.$disconnect()
  }
}

// Execute the async function
resetPassword()
