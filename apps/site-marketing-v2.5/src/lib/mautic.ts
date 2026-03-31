/**
 * Mautic Marketing Automation Integration
 * Handles lead tracking, contact management, and email automation
 */

export interface MauticContact {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  tags?: string[];
  fields?: Record<string, any>;
}

export interface MauticFormData {
  formId: string;
  email: string;
  [key: string]: any;
}

export class MauticClient {
  private baseUrl: string;
  private publicKey: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_MAUTIC_URL || '';
    this.publicKey = process.env.NEXT_PUBLIC_MAUTIC_KEY || '';
  }

  /**
   * Track page view in Mautic
   */
  async trackPageView(url: string, title: string): Promise<void> {
    if (!this.baseUrl) return;

    try {
      await fetch(`${this.baseUrl}/mtracking.gif?page_url=${encodeURIComponent(url)}&page_title=${encodeURIComponent(title)}`, {
        method: 'GET',
        mode: 'no-cors',
      });
    } catch (error) {
      console.error('[Mautic] Page view tracking failed:', error);
    }
  }

  /**
   * Identify and create/update contact in Mautic
   */
  async identifyContact(contact: MauticContact): Promise<void> {
    if (!this.baseUrl || !this.publicKey) return;

    try {
      const payload = {
        email: contact.email,
        firstname: contact.firstName,
        lastname: contact.lastName,
        phone: contact.phone,
        company: contact.company,
        tags: contact.tags || ['website_visitor'],
        ...contact.fields,
      };

      const response = await fetch(`${this.baseUrl}/api/contacts/new`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.publicKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Mautic API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[Mautic] Contact identified:', data);
      }
    } catch (error) {
      console.error('[Mautic] Contact identification failed:', error);
    }
  }

  /**
   * Submit form data to Mautic
   */
  async submitForm(formData: MauticFormData): Promise<void> {
    if (!this.baseUrl) return;

    try {
      const response = await fetch(`${this.baseUrl}/form/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Mautic form submission error: ${response.statusText}`);
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('[Mautic] Form submitted:', formData.formId);
      }
    } catch (error) {
      console.error('[Mautic] Form submission failed:', error);
    }
  }

  /**
   * Add points to contact (lead scoring)
   */
  async addPoints(email: string, points: number, eventName: string): Promise<void> {
    if (!this.baseUrl || !this.publicKey) return;

    try {
      const response = await fetch(`${this.baseUrl}/api/contacts/points/plus/${points}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.publicKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          eventName,
        }),
      });

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Mautic] Added ${points} points for ${eventName}`);
      }
    } catch (error) {
      console.error('[Mautic] Points addition failed:', error);
    }
  }

  /**
   * Track custom event
   */
  async trackEvent(email: string, eventName: string, eventData?: Record<string, any>): Promise<void> {
    if (!this.baseUrl || !this.publicKey) return;

    try {
      await fetch(`${this.baseUrl}/api/events/new`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.publicKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          eventName,
          eventData,
        }),
      });
    } catch (error) {
      console.error('[Mautic] Event tracking failed:', error);
    }
  }
}

// Singleton instance
export const mautic = new MauticClient();

/**
 * Lead scoring helper functions
 */
export const LEAD_SCORES = {
  EMAIL_SIGNUP: 5,
  RESOURCE_DOWNLOAD: 10,
  PRODUCT_PAGE_VISIT: 15,
  CASE_STUDY_READ: 10,
  WEBINAR_REGISTRATION: 20,
  CONSULTATION_REQUEST: 30,
  PRODUCT_PURCHASE: 100,
} as const;

export async function scoreLeadAction(
  email: string,
  action: keyof typeof LEAD_SCORES
): Promise<void> {
  const points = LEAD_SCORES[action];
  await mautic.addPoints(email, points, action);
}
