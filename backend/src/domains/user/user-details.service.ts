import { UserDetails as PrismaUserDetails } from '@prisma/client';
import prisma from '../../config/db';
import { UserDetails, ValidationResult } from './user-details.model';

/**
 * Service class for UserDetails database operations
 * Handles CRUD operations and business logic for user details
 * 
 * Requirements: 2.3, 2.5
 */
export class UserDetailsService {
  /**
   * Create new user details record
   */
  async create(userDetails: UserDetails): Promise<PrismaUserDetails> {
    // Validate before saving
    const validation = userDetails.validate();
    if (!validation.isValid) {
      throw new Error(`Invalid user details: ${Object.values(validation.errors).join(', ')}`);
    }

    // Sanitize before saving
    const sanitized = userDetails.sanitize();

    try {
      const record = await prisma.userDetails.create({
        data: sanitized.toDatabase()
      });

      return record;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create user details: ${error.message}`);
      }
      throw new Error('Failed to create user details');
    }
  }

  /**
   * Find user details by ID
   */
  async findById(id: string): Promise<UserDetails | null> {
    try {
      const record = await prisma.userDetails.findUnique({
        where: { id }
      });

      return record ? UserDetails.fromDatabase(record) : null;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to find user details: ${error.message}`);
      }
      throw new Error('Failed to find user details');
    }
  }

  /**
   * Find user details by email
   */
  async findByEmail(email: string): Promise<UserDetails | null> {
    try {
      const record = await prisma.userDetails.findFirst({
        where: { 
          email: email.toLowerCase().trim() 
        }
      });

      return record ? UserDetails.fromDatabase(record) : null;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to find user details by email: ${error.message}`);
      }
      throw new Error('Failed to find user details by email');
    }
  }

  /**
   * Update existing user details
   */
  async update(id: string, userDetails: UserDetails): Promise<PrismaUserDetails> {
    // Validate before updating
    const validation = userDetails.validate();
    if (!validation.isValid) {
      throw new Error(`Invalid user details: ${Object.values(validation.errors).join(', ')}`);
    }

    // Sanitize before updating
    const sanitized = userDetails.sanitize();

    try {
      const record = await prisma.userDetails.update({
        where: { id },
        data: sanitized.toDatabase()
      });

      return record;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update user details: ${error.message}`);
      }
      throw new Error('Failed to update user details');
    }
  }

  /**
   * Delete user details by ID
   */
  async delete(id: string): Promise<void> {
    try {
      await prisma.userDetails.delete({
        where: { id }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete user details: ${error.message}`);
      }
      throw new Error('Failed to delete user details');
    }
  }

  /**
   * Create or find user details by email
   * Since email is not unique, this method finds existing or creates new
   */
  async findOrCreateByEmail(userDetails: UserDetails): Promise<PrismaUserDetails> {
    // Validate before saving
    const validation = userDetails.validate();
    if (!validation.isValid) {
      throw new Error(`Invalid user details: ${Object.values(validation.errors).join(', ')}`);
    }

    // Sanitize before saving
    const sanitized = userDetails.sanitize();

    try {
      // First try to find existing user details by email
      const existing = await this.findByEmail(sanitized.email);
      
      if (existing) {
        // We need to get the ID from the database record
        const existingRecord = await prisma.userDetails.findFirst({
          where: { email: sanitized.email }
        });
        
        if (existingRecord) {
          return await prisma.userDetails.update({
            where: { id: existingRecord.id },
            data: sanitized.toDatabase()
          });
        }
      }
      
      // Create new record
      return await prisma.userDetails.create({
        data: sanitized.toDatabase()
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to find or create user details: ${error.message}`);
      }
      throw new Error('Failed to find or create user details');
    }
  }

  /**
   * Validate user details input without saving
   */
  validateInput(input: any): ValidationResult {
    return UserDetails.validateInput(input);
  }

  /**
   * Sanitize user details input without saving
   */
  sanitizeInput(input: any): any {
    return UserDetails.sanitizeInput(input);
  }

  /**
   * Create UserDetails instance from user input with validation and sanitization
   */
  createFromInput(input: any): UserDetails {
    return UserDetails.fromUserInput(input);
  }

  /**
   * Check if email already exists
   */
  async emailExists(email: string): Promise<boolean> {
    try {
      const count = await prisma.userDetails.count({
        where: { 
          email: email.toLowerCase().trim() 
        }
      });

      return count > 0;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to check email existence: ${error.message}`);
      }
      throw new Error('Failed to check email existence');
    }
  }

  /**
   * Get user details with booking count
   */
  async findWithBookingCount(id: string): Promise<{
    userDetails: UserDetails;
    bookingCount: number;
  } | null> {
    try {
      const record = await prisma.userDetails.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              bookings: true
            }
          }
        }
      });

      if (!record) {
        return null;
      }

      return {
        userDetails: UserDetails.fromDatabase(record),
        bookingCount: record._count.bookings
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to find user details with booking count: ${error.message}`);
      }
      throw new Error('Failed to find user details with booking count');
    }
  }

  /**
   * Search user details by name or email
   */
  async search(query: string, limit: number = 10): Promise<UserDetails[]> {
    try {
      const sanitizedQuery = query.trim().toLowerCase();
      
      const records = await prisma.userDetails.findMany({
        where: {
          OR: [
            {
              full_name: {
                contains: sanitizedQuery,
                mode: 'insensitive'
              }
            },
            {
              email: {
                contains: sanitizedQuery,
                mode: 'insensitive'
              }
            },
            {
              company: {
                contains: sanitizedQuery,
                mode: 'insensitive'
              }
            }
          ]
        },
        take: limit,
        orderBy: {
          created_at: 'desc'
        }
      });

      return records.map(record => UserDetails.fromDatabase(record));
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to search user details: ${error.message}`);
      }
      throw new Error('Failed to search user details');
    }
  }
}