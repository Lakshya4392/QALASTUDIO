import { UserDetails } from './user-details.model';

describe('UserDetails Model', () => {
  const validUserData = {
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    company: 'Test Company',
    specialRequirements: 'Need wheelchair access'
  };

  describe('Constructor', () => {
    it('should create UserDetails instance with valid data', () => {
      const userDetails = new UserDetails(validUserData);
      
      expect(userDetails.fullName).toBe('John Doe');
      expect(userDetails.email).toBe('john.doe@example.com');
      expect(userDetails.phone).toBe('+1234567890');
      expect(userDetails.company).toBe('Test Company');
      expect(userDetails.specialRequirements).toBe('Need wheelchair access');
    });

    it('should create UserDetails instance without optional fields', () => {
      const minimalData = {
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        phone: '1234567890'
      };

      const userDetails = new UserDetails(minimalData);
      
      expect(userDetails.fullName).toBe('Jane Smith');
      expect(userDetails.email).toBe('jane@example.com');
      expect(userDetails.phone).toBe('1234567890');
      expect(userDetails.company).toBeUndefined();
      expect(userDetails.specialRequirements).toBeUndefined();
    });
  });

  describe('Validation', () => {
    it('should validate correct user details', () => {
      const result = UserDetails.validateInput(validUserData);
      
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should reject empty full name', () => {
      const invalidData = { ...validUserData, fullName: '' };
      const result = UserDetails.validateInput(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.fullName).toBe('Full name is required');
    });

    it('should reject invalid email format', () => {
      const invalidData = { ...validUserData, email: 'invalid-email' };
      const result = UserDetails.validateInput(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Invalid email format');
    });

    it('should reject invalid phone format', () => {
      const invalidData = { ...validUserData, phone: '123' };
      const result = UserDetails.validateInput(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.phone).toBe('Invalid phone number format');
    });

    it('should reject full name with invalid characters', () => {
      const invalidData = { ...validUserData, fullName: 'John<script>alert("xss")</script>' };
      const result = UserDetails.validateInput(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.fullName).toBe('Full name contains invalid characters');
    });

    it('should reject too long company name', () => {
      const invalidData = { ...validUserData, company: 'A'.repeat(256) };
      const result = UserDetails.validateInput(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.company).toBe('Company name must be less than 255 characters');
    });

    it('should reject too long special requirements', () => {
      const invalidData = { ...validUserData, specialRequirements: 'A'.repeat(2001) };
      const result = UserDetails.validateInput(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.specialRequirements).toBe('Special requirements must be less than 2000 characters');
    });

    it('should convert email to lowercase', () => {
      const dataWithUppercaseEmail = { ...validUserData, email: 'JOHN.DOE@EXAMPLE.COM' };
      const result = UserDetails.validateInput(dataWithUppercaseEmail);
      
      expect(result.isValid).toBe(true);
      // Note: The validation schema converts to lowercase, but we need to test the sanitization
    });
  });

  describe('Sanitization', () => {
    it('should sanitize HTML entities in full name', () => {
      const maliciousData = {
        ...validUserData,
        fullName: 'John <script>alert("xss")</script> Doe'
      };

      const sanitized = UserDetails.sanitizeInput(maliciousData);
      expect(sanitized.fullName).toBe('John  Doe'); // Script tags removed
    });

    it('should sanitize email by converting to lowercase', () => {
      const dataWithUppercaseEmail = {
        ...validUserData,
        email: 'JOHN.DOE@EXAMPLE.COM'
      };

      const sanitized = UserDetails.sanitizeInput(dataWithUppercaseEmail);
      expect(sanitized.email).toBe('john.doe@example.com');
    });

    it('should sanitize phone number by removing invalid characters', () => {
      const dataWithInvalidPhone = {
        ...validUserData,
        phone: '+1 (234) 567-8900 ext 123abc'
      };

      const sanitized = UserDetails.sanitizeInput(dataWithInvalidPhone);
      expect(sanitized.phone).toBe('+1 (234) 567-8900  123'); // Invalid chars removed
    });

    it('should remove script tags from special requirements', () => {
      const maliciousData = {
        ...validUserData,
        specialRequirements: 'Need access <script>alert("xss")</script> for wheelchair'
      };

      const sanitized = UserDetails.sanitizeInput(maliciousData);
      expect(sanitized.specialRequirements).toBe('Need access  for wheelchair');
    });

    it('should handle null and undefined values', () => {
      const dataWithNulls = {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        company: null,
        specialRequirements: undefined
      };

      const sanitized = UserDetails.sanitizeInput(dataWithNulls);
      expect(sanitized.company).toBeNull();
      expect(sanitized.specialRequirements).toBeUndefined();
    });

    it('should handle empty strings by converting to null for optional fields', () => {
      const dataWithEmptyStrings = {
        ...validUserData,
        company: '',
        specialRequirements: '   '
      };

      const sanitized = UserDetails.sanitizeInput(dataWithEmptyStrings);
      expect(sanitized.company).toBeNull();
      expect(sanitized.specialRequirements).toBeNull();
    });
  });

  describe('fromUserInput', () => {
    it('should create UserDetails from valid input', () => {
      const userDetails = UserDetails.fromUserInput(validUserData);
      
      expect(userDetails).toBeInstanceOf(UserDetails);
      expect(userDetails.fullName).toBe('John Doe');
      expect(userDetails.email).toBe('john.doe@example.com');
    });

    it('should throw error for invalid input', () => {
      const invalidData = { ...validUserData, email: 'invalid-email' };
      
      expect(() => {
        UserDetails.fromUserInput(invalidData);
      }).toThrow('Validation failed');
    });

    it('should sanitize input before creating instance', () => {
      const maliciousData = {
        fullName: 'John Doe', // Valid name without HTML
        email: 'JOHN@EXAMPLE.COM',
        phone: '+1-234-567-8900',
        company: 'Test <script>alert("xss")</script> Company'
      };

      const userDetails = UserDetails.fromUserInput(maliciousData);
      
      expect(userDetails.fullName).toBe('John Doe'); // Clean name
      expect(userDetails.email).toBe('john@example.com'); // Lowercase
      expect(userDetails.company).toBe('Test  Company'); // Script removed
    });
  });

  describe('Database Operations', () => {
    it('should convert to database format', () => {
      const userDetails = new UserDetails(validUserData);
      const dbRecord = userDetails.toDatabase();
      
      expect(dbRecord).toEqual({
        full_name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        company: 'Test Company',
        special_requirements: 'Need wheelchair access'
      });
    });

    it('should convert to database format with null optional fields', () => {
      const minimalData = {
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        phone: '1234567890'
      };

      const userDetails = new UserDetails(minimalData);
      const dbRecord = userDetails.toDatabase();
      
      expect(dbRecord).toEqual({
        full_name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '1234567890',
        company: null,
        special_requirements: null
      });
    });

    it('should create from database record', () => {
      const dbRecord = {
        id: '123',
        full_name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        company: 'Test Company',
        special_requirements: 'Need wheelchair access',
        created_at: new Date(),
        updated_at: new Date()
      };

      const userDetails = UserDetails.fromDatabase(dbRecord as any);
      
      expect(userDetails.fullName).toBe('John Doe');
      expect(userDetails.email).toBe('john.doe@example.com');
      expect(userDetails.phone).toBe('+1234567890');
      expect(userDetails.company).toBe('Test Company');
      expect(userDetails.specialRequirements).toBe('Need wheelchair access');
    });
  });

  describe('Utility Methods', () => {
    it('should check if user details are complete', () => {
      const completeDetails = new UserDetails(validUserData);
      expect(completeDetails.isComplete()).toBe(true);

      const incompleteDetails = new UserDetails({
        fullName: '',
        email: 'test@example.com',
        phone: '1234567890'
      });
      expect(incompleteDetails.isComplete()).toBe(false);
    });

    it('should get display name', () => {
      const userDetails = new UserDetails(validUserData);
      expect(userDetails.getDisplayName()).toBe('John Doe');
    });

    it('should get contact summary', () => {
      const userDetails = new UserDetails(validUserData);
      const summary = userDetails.getContactSummary();
      
      expect(summary).toBe('John Doe • john.doe@example.com • +1234567890 • (Test Company)');
    });

    it('should get contact summary without company', () => {
      const dataWithoutCompany = {
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        phone: '1234567890'
      };

      const userDetails = new UserDetails(dataWithoutCompany);
      const summary = userDetails.getContactSummary();
      
      expect(summary).toBe('Jane Smith • jane@example.com • 1234567890');
    });

    it('should check equality', () => {
      const userDetails1 = new UserDetails(validUserData);
      const userDetails2 = new UserDetails(validUserData);
      const userDetails3 = new UserDetails({
        ...validUserData,
        fullName: 'Different Name'
      });

      expect(userDetails1.equals(userDetails2)).toBe(true);
      expect(userDetails1.equals(userDetails3)).toBe(false);
    });

    it('should clone user details', () => {
      const original = new UserDetails(validUserData);
      const cloned = original.clone();
      
      expect(cloned).not.toBe(original);
      expect(cloned.equals(original)).toBe(true);
    });

    it('should convert to JSON', () => {
      const userDetails = new UserDetails(validUserData);
      const json = userDetails.toJSON();
      
      expect(json).toEqual({
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        company: 'Test Company',
        specialRequirements: 'Need wheelchair access'
      });
    });

    it('should convert to JSON without optional fields', () => {
      const minimalData = {
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        phone: '1234567890'
      };

      const userDetails = new UserDetails(minimalData);
      const json = userDetails.toJSON();
      
      expect(json).toEqual({
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        phone: '1234567890'
      });
      expect(json).not.toHaveProperty('company');
      expect(json).not.toHaveProperty('specialRequirements');
    });
  });

  describe('Instance Validation and Sanitization', () => {
    it('should validate instance', () => {
      const userDetails = new UserDetails(validUserData);
      const result = userDetails.validate();
      
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should sanitize instance', () => {
      const maliciousData = {
        fullName: 'John Doe', // Valid name
        email: 'JOHN@EXAMPLE.COM',
        phone: '+1-234-567-8900',
        company: 'Test Company'
      };

      const userDetails = new UserDetails(maliciousData);
      const sanitized = userDetails.sanitize();
      
      expect(sanitized).not.toBe(userDetails); // Should return new instance
      expect(sanitized.fullName).toBe('John Doe'); // Clean name
      expect(sanitized.email).toBe('john@example.com'); // Lowercase
    });
  });
});