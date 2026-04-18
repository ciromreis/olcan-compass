import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import bcrypt from "bcrypt";

export default async function setAdminPassword({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const authModule = container.resolve(Modules.AUTH);
  const userModule = container.resolve(Modules.USER);
  
  logger.info("🔑 Setting admin password...");
  
  const email = "admin@olcan.com";
  const password = "olcan2026";
  
  try {
    // Get user
    const users = await userModule.listUsers({ email });
    if (users.length === 0) {
      logger.error("❌ Admin user not found!");
      return;
    }
    
    const user = users[0];
    logger.info(`✅ Found user: ${user.email}`);
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    logger.info("✅ Password hashed");
    
    // Check if auth identity exists
    const authIdentities = await authModule.listAuthIdentities({
      app_metadata: { user_id: user.id }
    });
    
    if (authIdentities.length > 0) {
      // Update existing auth identity
      const authIdentity = authIdentities[0];
      await authModule.updateAuthIdentities(authIdentity.id, {
        provider_metadata: {
          password_hash: hashedPassword,
        },
      });
      logger.info("✅ Password updated for existing auth identity");
    } else {
      // Create new auth identity
      await authModule.createAuthIdentities({
        provider_identities: [{
          provider: "emailpass",
          entity_id: email,
        }],
        app_metadata: {
          user_id: user.id,
        },
        provider_metadata: {
          password_hash: hashedPassword,
        },
      });
      logger.info("✅ New auth identity created with password");
    }
    
    logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    logger.info("✅ Admin credentials ready!");
    logger.info("📧 Email: admin@olcan.com");
    logger.info("🔑 Password: olcan2026");
    logger.info("🌐 Admin Panel: http://localhost:7000");
    logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
  } catch (error: any) {
    logger.error("❌ Failed:", error.message);
    throw error;
  }
}
