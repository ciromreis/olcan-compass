/**
 * Olcan SSO Integration Endpoint
 * 
 * Allows users authenticated in the main Olcan app
 * to seamlessly access the marketplace.
 */

import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { getOlcanUser, isOlcanAuthenticated } from "../../../../middlewares/olcan-auth";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  // Check if user is authenticated via Olcan JWT
  if (!isOlcanAuthenticated(req)) {
    res.status(401).json({
      message: "Not authenticated",
      authenticated: false,
    });
    return;
  }

  const user = getOlcanUser(req);

  res.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    message: "Olcan SSO authenticated",
  });
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  // Sync Olcan user to MedusaJS customer
  if (!isOlcanAuthenticated(req)) {
    res.status(401).json({
      message: "Not authenticated",
    });
    return;
  }

  const user = getOlcanUser(req);
  const customerService = req.scope.resolve("customerService");

  try {
    // Find or create customer
    const customers = await customerService.list({
      email: user.email,
    });

    let customer;
    if (customers.length > 0) {
      customer = customers[0];
    } else {
      // Create new customer
      customer = await customerService.create({
        email: user.email,
        metadata: {
          olcan_user_id: user.id,
          olcan_role: user.role,
          synced_at: new Date().toISOString(),
        },
      });
    }

    res.json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
      },
    });
  } catch (error) {
    console.error("[olcan-sso] Customer sync failed:", error);
    res.status(500).json({
      message: "Failed to sync customer",
      error: error.message,
    });
  }
}
