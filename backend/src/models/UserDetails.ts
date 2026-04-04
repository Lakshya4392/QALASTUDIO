import { z } from 'zod';

// Validation schema
export const UserDetailsSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(255, 'Full name too long').refine(s => s.trim().length > 0, 'Full name cannot be empty'),
  email: z.string().email('Invalid email format').max(255, 'Email too long'),
  phone: z.string().min(1, 'Phone number is required').refine(s => {
    const cleaned = s.replace(/[^\d]/g, '');
    return cleaned.length >= 10;
  }, 'Phone number must contain at least 10 digits'),
  company: z.string().max(255, 'Company name too long').optional(),
  specialRequirements: z.string().max(1000, 'Special requirements too long').optional()
});

export type UserDetailsInput = z.infer<typeof UserDetailsSchema>;

export interface UserDetailsRecord extends UserDetailsInput {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserDetails {
    constructor(private data: UserDetailsInput) {}

    // Normalize keys: Support both snake_case (from API) and camelCase (from forms)
    private normalizeKeys(input: any): UserDetailsInput {
        return {
            fullName: input.full_name || input.fullName || '',
            email: input.email || '',
            phone: input.phone || '',
            company: input.company ?? input.company ?? undefined,
            specialRequirements: input.special_requirements ?? input.specialRequirements ?? undefined
        };
    }

    validate(): { isValid: boolean; errors: Record<string, string> } {
        try {
            // Normalize data before validation
            const normalizedData = this.normalizeKeys(this.data);
            UserDetailsSchema.parse(normalizedData);
            return { isValid: true, errors: {} };
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errors: Record<string, string> = {};
                (error.issues as any[]).forEach((err) => {
                    if (err.path && err.path.length > 0) {
                        errors[String(err.path[0])] = err.message;
                    }
                });
                return { isValid: false, errors };
            }
            return { isValid: false, errors: { general: 'Validation failed' } };
        }
    }

    sanitize(): UserDetailsInput {
        // Normalize first
        const normalized = this.normalizeKeys(this.data);
        return {
            fullName: this.sanitizeString(normalized.fullName),
            email: this.sanitizeEmail(normalized.email),
            phone: this.sanitizePhone(normalized.phone),
            company: normalized.company ? this.sanitizeString(normalized.company) : undefined,
            specialRequirements: normalized.specialRequirements ? this.sanitizeString(normalized.specialRequirements) : undefined
        };
    }

  private sanitizeString(input: string): string {
    return input.trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"]/g, '') // Remove quotes to prevent injection
      .substring(0, 1000); // Limit length
  }

  private sanitizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private sanitizePhone(phone: string): string {
    return phone.replace(/[^\d+\-\s()]/g, '').trim().substring(0, 50);
  }

  toDatabase(): UserDetailsInput {
    return this.sanitize();
  }

  getData(): UserDetailsInput {
    return this.data;
  }
}