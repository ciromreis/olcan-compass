import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export default async function createAdminUser({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const userModuleService = container.resolve(Modules.USER);
  
  logger.info("Creating Olcan admin user...");
  
  try {
    // Check if admin already exists
    const existingUsers = await userModuleService.listUsers({
      email: "admin@olcan.com"
    });
    
    if (existingUsers.length > 0) {
      logger.info("Admin user already exists!");
      return;
    }
    
    // Create admin user
    const admin = await userModuleService.createUsers({
      email: "admin@olcan.com",
      first_name: "Olcan",
      last_name: "Admin"
    });
    
    logger.info("✅ Admin user created successfully!");
    logger.info("Email: admin@olcan.com");
    logger.info("You can set password on first login");
    
  } catch (error) {
    logger.error("Failed to create admin user:", error);
    throw error;
  }
}
