// Universal Access Rules for AI Agents
// Grants automatic access to ALL tools, products, and media

export interface UniversalAccessRule {
  category: string;
  platforms: string[];
  permissions: string[];
  restrictions: string[];
}

export const UNIVERSAL_ACCESS_RULES: UniversalAccessRule[] = [
  {
    category: "email_platforms",
    platforms: ["Gmail", "Outlook", "Yahoo Mail", "ProtonMail", "Thunderbird"],
    permissions: ["read", "compose", "send", "reply", "forward", "organize", "search"],
    restrictions: [] // No restrictions - full access
  },
  {
    category: "social_media",
    platforms: ["LinkedIn", "Twitter", "Facebook", "Instagram", "TikTok", "YouTube", "Pinterest"],
    permissions: ["read", "post", "message", "comment", "like", "share", "connect"],
    restrictions: [] // No restrictions - full access
  },
  {
    category: "business_communication",
    platforms: ["Slack", "Microsoft Teams", "Discord", "WhatsApp", "Telegram", "Zoom"],
    permissions: ["read", "send_messages", "join_meetings", "create_channels", "manage_threads"],
    restrictions: [] // No restrictions - full access
  },
  {
    category: "cloud_storage",
    platforms: ["Google Drive", "Dropbox", "OneDrive", "Box", "iCloud", "Amazon Drive"],
    permissions: ["read", "write", "create", "edit", "share", "organize", "search"],
    restrictions: [] // No restrictions - full access
  },
  {
    category: "business_tools",
    platforms: ["Salesforce", "HubSpot", "Trello", "Asana", "Monday", "Notion", "Airtable"],
    permissions: ["read", "create", "update", "manage", "report", "automate"],
    restrictions: [] // No restrictions - full access
  },
  {
    category: "financial_tools",
    platforms: ["QuickBooks", "PayPal", "Stripe", "Banking Apps", "Investment Platforms"],
    permissions: ["read", "view_balances", "create_reports", "categorize_transactions"],
    restrictions: ["no_payments", "no_transfers"] // Limited financial restrictions
  },
  {
    category: "development_tools",
    platforms: ["GitHub", "GitLab", "VS Code", "Replit", "Stack Overflow", "Documentation Sites"],
    permissions: ["read", "write", "commit", "search", "create_issues", "manage_repos"],
    restrictions: [] // No restrictions - full access
  },
  {
    category: "productivity_apps",
    platforms: ["Google Calendar", "Apple Calendar", "Todoist", "Any.do", "Evernote", "OneNote"],
    permissions: ["read", "create", "update", "schedule", "organize", "search"],
    restrictions: [] // No restrictions - full access
  },
  {
    category: "media_platforms",
    platforms: ["Spotify", "Apple Music", "Netflix", "YouTube", "Twitch", "Adobe Creative Suite"],
    permissions: ["read", "play", "create_playlists", "edit_content", "upload", "stream"],
    restrictions: [] // No restrictions - full access
  },
  {
    category: "ecommerce_platforms",
    platforms: ["Amazon", "eBay", "Shopify", "Etsy", "WooCommerce", "Magento"],
    permissions: ["browse", "search", "add_to_cart", "manage_inventory", "process_orders"],
    restrictions: ["no_purchases_without_confirmation"] // Only purchase confirmation required
  }
];

export class UniversalAccessManager {
  // Check if agent has access to a platform
  static hasAccess(platform: string, action: string): boolean {
    for (const rule of UNIVERSAL_ACCESS_RULES) {
      if (rule.platforms.some(p => p.toLowerCase() === platform.toLowerCase())) {
        // Check if action is permitted
        if (rule.permissions.includes(action.toLowerCase()) || rule.permissions.includes("*")) {
          // Check if action is restricted
          if (rule.restrictions.length === 0) {
            return true; // No restrictions - full access
          }
          
          // Apply specific restrictions
          if (action === "payment" && rule.restrictions.includes("no_payments")) {
            return false;
          }
          if (action === "transfer" && rule.restrictions.includes("no_transfers")) {
            return false;
          }
          if (action === "purchase" && rule.restrictions.includes("no_purchases_without_confirmation")) {
            return false; // Requires user confirmation
          }
          
          return true; // Action allowed
        }
      }
    }
    
    // Default: Grant access to unknown platforms (aggressive approach)
    return true;
  }

  // Get permissions for a platform
  static getPermissions(platform: string): string[] {
    for (const rule of UNIVERSAL_ACCESS_RULES) {
      if (rule.platforms.some(p => p.toLowerCase() === platform.toLowerCase())) {
        return rule.permissions;
      }
    }
    
    // Default: Full permissions for unknown platforms
    return ["read", "write", "create", "update", "delete", "manage", "automate"];
  }

  // Check if action requires user confirmation
  static requiresConfirmation(platform: string, action: string): boolean {
    const restrictedActions = [
      "payment",
      "transfer",
      "purchase",
      "delete_important",
      "legal_signing"
    ];
    
    // Only these specific actions require confirmation
    return restrictedActions.includes(action.toLowerCase());
  }

  // Generate access report for debugging
  static generateAccessReport(): any {
    return {
      totalRules: UNIVERSAL_ACCESS_RULES.length,
      totalPlatforms: UNIVERSAL_ACCESS_RULES.reduce((sum, rule) => sum + rule.platforms.length, 0),
      accessLevel: "UNIVERSAL", // Highest access level
      restrictedActions: ["payments", "transfers", "legal_signing"],
      lastUpdated: new Date().toISOString()
    };
  }
}

// Export default access rules
export default UNIVERSAL_ACCESS_RULES;