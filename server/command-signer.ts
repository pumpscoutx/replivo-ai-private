import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Command signing for secure browser extension communication
export class CommandSigner {
  private static instance: CommandSigner;
  private privateKey: string;
  private publicKey: string;

  constructor() {
    // In production, load from environment variables
    // For development, generate a key pair
    this.privateKey = process.env.COMMAND_PRIVATE_KEY || this.generatePrivateKey();
    this.publicKey = this.derivePublicKey(this.privateKey);
  }

  static getInstance(): CommandSigner {
    if (!CommandSigner.instance) {
      CommandSigner.instance = new CommandSigner();
    }
    return CommandSigner.instance;
  }

  private generatePrivateKey(): string {
    // Generate RSA key pair for development
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    
    console.warn('Using generated RSA key for development. Set COMMAND_PRIVATE_KEY in production.');
    return privateKey;
  }

  private derivePublicKey(privateKey: string): string {
    const keyObject = crypto.createPrivateKey(privateKey);
    return crypto.createPublicKey(keyObject).export({ type: 'spki', format: 'pem' }) as string;
  }

  signCommand(command: ExtensionCommand): string {
    const payload = {
      ...command,
      issued_at: new Date().toISOString(),
      expiry: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
    };

    return jwt.sign(payload, this.privateKey, { 
      algorithm: 'RS256',
      expiresIn: '5m'
    });
  }

  verifyCommand(signedCommand: string): ExtensionCommand | null {
    try {
      const decoded = jwt.verify(signedCommand, this.publicKey, { 
        algorithms: ['RS256'] 
      }) as ExtensionCommand;
      
      return decoded;
    } catch (error) {
      console.error('Command verification failed:', error);
      return null;
    }
  }

  getPublicKey(): string {
    return this.publicKey;
  }
}

// Command interface for browser extension
export interface ExtensionCommand {
  request_id: string;
  agent_id: string;
  capability: string;
  args: Record<string, any>;
  issued_at?: string;
  expiry?: string;
}

// Supported browser capabilities
export enum BrowserCapability {
  OPEN_URL = 'open_url',
  FILL_FORM = 'fill_form', 
  CLICK_SELECTOR = 'click_selector',
  EXTRACT_CONTENT = 'extract_content',
  TAKE_SCREENSHOT = 'take_screenshot',
  DOWNLOAD_FILE = 'download_file',
  UPLOAD_FILE = 'upload_file',
  NAVIGATE_BACK = 'navigate_back',
  CLOSE_TAB = 'close_tab',
  SWITCH_TAB = 'switch_tab'
}

// Command argument types
export interface OpenUrlArgs {
  url: string;
  newTab?: boolean;
}

export interface FillFormArgs {
  tabId?: number;
  selectors: Record<string, string>;
  values: Record<string, string>;
  submit?: boolean;
}

export interface ClickSelectorArgs {
  tabId?: number;
  selector: string;
  waitFor?: number;
}

export interface ExtractContentArgs {
  tabId?: number;
  selectors: Record<string, string>;
  includeText?: boolean;
  includeAttributes?: string[];
}

export interface TakeScreenshotArgs {
  tabId?: number;
  fullPage?: boolean;
  quality?: number;
}

// Command result interface
export interface CommandResult {
  request_id: string;
  status: 'success' | 'failed' | 'rejected';
  result?: any;
  error?: string;
  timestamp: string;
}