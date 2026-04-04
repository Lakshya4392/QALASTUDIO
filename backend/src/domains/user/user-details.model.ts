import { UserDetails as PrismaUserDetails } from '@prisma/client';
import { z } from 'zod';

/**
 * Validation schema for UserDetails
 * Implements comprehensive validation rules for user input
 */
const UserDetailsSchema = z.object({
  fullName: z.string()
    .min(1, 'Full name is required')
    .max(255, 'Full name must be less than 255 characters')
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, 'Full name is required')
    .refine((val) => /^[a-zA-Z\s\-'\.]+$/.test(val), 'Full name contains invalid characters'),
  
  email: z.string()
    .min(1, 'Email is required')
    .max(255, 'Email must be less than 255 characters')
    .email('Invalid email format')
    .toLowerCase(),
  
  phone: z.string()
    .min(1, 'Phone number is required')
    .max(50, 'Phone number must be less than 50 characters')
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, 'Phone number is required')
    .refine((val) => /^[\+]?[1-9][\d\s\-\(\)\.]{7,}$/.test(val), 'Invalid phone number format'),
  
  company: z.string()
    .max(255, 'Company name must be less than 255 characters')
    .optional()
    .nullable(),
  
  specialRequirements: z.string()
    .max(2000, 'Special requirements must be less than 2000 characters')
    .optional()
    .nullable()
});

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Database record interface for UserDetails
 */
export interface UserDetailsRecord {
  id?: string;
  full_name: string;
  email: string;
  phone: string;
  company?: string | null;
  special_requirements?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * UserDetails data model class
 * Handles validation, sanitization, and database operations for user details
 * 
 * Requirements: 2.4, 2.5
 */
export class UserDetails {
  public fullName: string;
  public email: string;
  public phone: string;
  public company?: string;
  public specialRequirements?: string;

  constructor(data: {
    fullName: string;
    email: string;
    phone: string;
    company?: string;
    specialRequirements?: string;
  }) {
    this.fullName = data.fullName;
    this.email = data.email;
    this.phone = data.phone;
    this.company = data.company;
    this.specialRequirements = data.specialRequirements;
  }

  /**
   * Create UserDetails instance from database record
   */
  static fromDatabase(record: PrismaUserDetails): UserDetails {
    return new UserDetails({
      fullName: record.full_name,
      email: record.email,
      phone: record.phone,
      company: record.company || undefined,
      specialRequirements: record.special_requirements || undefined
    });
  }

  /**
   * Create UserDetails instance from user input with validation
   */
  static fromUserInput(input: any): UserDetails {
    const sanitized = UserDetails.sanitizeInput(input);
    const validation = UserDetails.validateInput(sanitized);
    
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
    }

    return new UserDetails(sanitized);
  }

  /**
   * Validate user details input
   * Implements comprehensive validation rules
   */
  static validateInput(data: any): ValidationResult {
    try {
      UserDetailsSchema.parse(data);
      return { isValid: true, errors: {} };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.issues.forEach((err: any) => {
          const field = err.path.join('.');
          errors[field] = err.message;
        });
        return { isValid: false, errors };
      }
      return { isValid: false, errors: { general: 'Validation failed' } };
    }
  }

  /**
   * Sanitize user input for security
   * Prevents XSS attacks and SQL injection
   * 
   * Requirements: 2.4
   */
  static sanitizeInput(input: any): any {
    if (!input || typeof input !== 'object') {
      return {};
    }

    const sanitized: any = {};

    // Sanitize full name - remove HTML tags but keep valid characters
    if (input.fullName) {
      sanitized.fullName = UserDetails.removeHtmlTags(input.fullName)
        .trim();
    }

    // Sanitize email (convert to lowercase, trim)
    if (input.email) {
      sanitized.email = UserDetails.sanitizeString(input.email)
        .toLowerCase()
        .trim();
    }

    // Sanitize phone (remove non-phone characters except allowed ones)
    if (input.phone) {
      sanitized.phone = UserDetails.sanitizeString(input.phone)
        .replace(/[^\+\d\s\-\(\)\.]/g, '') // Keep only valid phone characters
        .trim();
    }

    // Sanitize company name - remove HTML tags
    if (input.company !== undefined) {
      if (input.company === null || input.company === '') {
        sanitized.company = null;
      } else {
        const cleaned = UserDetails.removeHtmlTags(input.company).trim();
        sanitized.company = cleaned || null;
      }
    }

    // Sanitize special requirements - remove HTML tags and scripts
    if (input.specialRequirements !== undefined) {
      if (input.specialRequirements === null || input.specialRequirements === '' || 
          (typeof input.specialRequirements === 'string' && input.specialRequirements.trim() === '')) {
        sanitized.specialRequirements = null;
      } else {
        const cleaned = UserDetails.removeHtmlTags(input.specialRequirements).trim();
        sanitized.specialRequirements = cleaned || null;
      }
    }

    return sanitized;
  }

  /**
   * Remove HTML tags and scripts from string
   */
  private static removeHtmlTags(str: string): string {
    if (typeof str !== 'string') {
      return '';
    }

    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<[^>]*>/g, '') // Remove all HTML tags
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/&amp;/g, '&');
  }

  /**
   * Sanitize a string by encoding HTML entities and removing dangerous characters
   */
  private static sanitizeString(str: string): string {
    if (typeof str !== 'string') {
      return '';
    }

    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Validate the current instance
   */
  validate(): ValidationResult {
    return UserDetails.validateInput({
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      company: this.company,
      specialRequirements: this.specialRequirements
    });
  }

  /**
   * Sanitize the current instance
   * Returns a new sanitized UserDetails instance
   */
  sanitize(): UserDetails {
    const sanitized = UserDetails.sanitizeInput({
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      company: this.company,
      specialRequirements: this.specialRequirements
    });

    return new UserDetails(sanitized);
  }

  /**
   * Convert to database record format
   * 
   * Requirements: 2.5
   */
  toDatabase(): Omit<UserDetailsRecord, 'id' | 'created_at' | 'updated_at'> {
    return {
      full_name: this.fullName,
      email: this.email,
      phone: this.phone,
      company: this.company || null,
      special_requirements: this.specialRequirements || null
    };
  }

  /**
   * Convert to JSON representation for API responses
   */
  toJSON(): {
    fullName: string;
    email: string;
    phone: string;
    company?: string;
    specialRequirements?: string;
  } {
    return {
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      ...(this.company && { company: this.company }),
      ...(this.specialRequirements && { specialRequirements: this.specialRequirements })
    };
  }

  /**
   * Check if all required fields are present and valid
   */
  isComplete(): boolean {
    const validation = this.validate();
    return validation.isValid && 
           !!this.fullName && 
           !!this.email && 
           !!this.phone;
  }

  /**
   * Get a display-friendly version of the user details
   */
  getDisplayName(): string {
    return this.fullName;
  }

  /**
   * Get contact information summary
   */
  getContactSummary(): string {
    const parts = [this.fullName, this.email, this.phone];
    if (this.company) {
      parts.push(`(${this.company})`);
    }
    return parts.join(' • ');
  }

  /**
   * Check if the user details match another instance
   */
  equals(other: UserDetails): boolean {
    return this.fullName === other.fullName &&
           this.email === other.email &&
           this.phone === other.phone &&
           this.company === other.company &&
           this.specialRequirements === other.specialRequirements;
  }

  /**
   * Create a copy of the user details
   */
  clone(): UserDetails {
    return new UserDetails({
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      company: this.company,
      specialRequirements: this.specialRequirements
    });
  }
}