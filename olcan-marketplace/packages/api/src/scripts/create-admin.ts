import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { generateInviteToken } from "@medusajs/medusa/core-flows";

export default async function createAdminUser({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const userModule = container.resolve(Modules.USER);
  
  logger.info("🚀 Creating Olcan admin user...");
  
  const email = "admin@olcan.com";
  
  try {
    // Check if user already exists
    const existingUsers = await userModule.listUsers({ email });
    
    if (existingUsers.length > 0) {
      logger.info("ℹ️  Admin user already exists!");
      logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      logger.info("📧 Email: admin@olcan.com");
      logger.info("🌐 Admin Panel: http://localhost:7000");
      logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      logger.info("✅ You can now login to the admin panel");
      return existingUsers[0];
    }
    
    // Create the admin user
    const user = await userModule.createUsers({
      email,
      first_name: "Olcan",
      last_name: "Admin",
    });
    
    logger.info("✅ Admin user created successfully!");
    
    // Generate invite token for password setup
    try {
      const { result: inviteToken } = await generateInviteToken(container).run({
        input: {
          user_id: user.id,
        },
      });
      
      logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      logger.info("📧 Email: admin@olcan.com");
      logger.info("🌐 Admin Panel: http://localhost:7000");
      logger.info("🔗 Setup URL: http://localhost:7000/invite?token=" + inviteToken.token);
      logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      logger.info("✅ Visit the setup URL to create your password");
    } catch (err) {
      // If invite token fails, user can still use forgot password flow
      logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      logger.info("📧 Email: admin@olcan.com");
      logger.info("🌐 Admin Panel: http://localhost:7000");
      logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      logger.info("✅ Visit admin panel and use 'Forgot Password' to set password");
    }
    
    return user;
  } catch (error: any) {
    logger.error("❌ Failed to create admin user:", error.message);
    throw error;
  }
}
