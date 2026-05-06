import React, { useState, useEffect } from 'react';
import { useUserAuth } from '../contexts/UserAuthContext';

export interface UserDetails {
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  specialRequirements?: string;
}

interface UserDetailsFormProps {
  onSubmit: (details: UserDetails) => void;
  onCancel: () => void;
  loading?: boolean;
  initialData?: Partial<UserDetails>;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  company?: string;
  specialRequirements?: string;
  general?: string;
}

export const UserDetailsForm: React.FC<UserDetailsFormProps> = ({
  onSubmit,
  onCancel,
  loading = false,
  initialData = {}
}) => {
  const { user } = useUserAuth();

  const [formData, setFormData] = useState<UserDetails>({
    fullName: initialData.fullName || user?.fullName || '',
    email: initialData.email || user?.email || '',
    phone: initialData.phone || user?.phone || '',
    company: initialData.company || '',
    specialRequirements: initialData.specialRequirements || ''
  });

  // If user logs in after modal opens, fill in their details
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.fullName || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Real-time validation
  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length > 255) {
      newErrors.fullName = 'Full name is too long';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (formData.email.length > 255) {
      newErrors.email = 'Email is too long';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d+\-\s()]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number (at least 10 digits)';
    } else if (formData.phone.length > 50) {
      newErrors.phone = 'Phone number is too long';
    }

    // Optional field validation
    if (formData.company && formData.company.length > 255) {
      newErrors.company = 'Company name is too long';
    }

    if (formData.specialRequirements && formData.specialRequirements.length > 1000) {
      newErrors.specialRequirements = 'Special requirements text is too long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof UserDetails, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const isFormValid = Object.keys(errors).length === 0 && 
    formData.fullName.trim() && 
    formData.email.trim() && 
    formData.phone.trim();

  return (
    <div className="space-y-6">
      {/* Pre-filled notice */}
      {user && (
        <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border-2 border-green-200 rounded-lg">
          <span className="text-green-600 text-lg">✓</span>
          <p className="text-sm text-green-800 font-medium">
            Details pre-filled from your profile — review and update if needed.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            id="fullName"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            className={`w-full px-4 py-3 border-2 focus:outline-none focus:ring-2 focus:ring-black transition-all ${
              touched.fullName && errors.fullName ? 'border-red-500' : 'border-black'
            }`}
            placeholder="Your full name"
            disabled={loading}
            aria-describedby={errors.fullName ? 'fullName-error' : undefined}
          />
          {touched.fullName && errors.fullName && (
            <p id="fullName-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.fullName}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-4 py-3 border-2 focus:outline-none focus:ring-2 focus:ring-black transition-all ${
              touched.email && errors.email ? 'border-red-500' : 'border-black'
            }`}
            placeholder="you@example.com"
            disabled={loading}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {touched.email && errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={`w-full px-4 py-3 border-2 focus:outline-none focus:ring-2 focus:ring-black transition-all ${
              touched.phone && errors.phone ? 'border-red-500' : 'border-black'
            }`}
            placeholder="+91 98765 43210"
            disabled={loading}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
          />
          {touched.phone && errors.phone && (
            <p id="phone-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.phone}
            </p>
          )}
        </div>

        {/* Company (Optional) */}
        <div>
          <label htmlFor="company" className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
            Company / Organization <span className="normal-case font-normal">(optional)</span>
          </label>
          <input
            type="text"
            id="company"
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            className="w-full px-4 py-3 border-2 border-black/30 focus:border-black focus:outline-none focus:ring-2 focus:ring-black transition-all"
            placeholder="Your company or production house"
            disabled={loading}
          />
        </div>

        {/* Special Requirements (Optional) */}
        <div>
          <label htmlFor="specialRequirements" className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
            Special Requirements <span className="normal-case font-normal">(optional)</span>
          </label>
          <textarea
            id="specialRequirements"
            value={formData.specialRequirements}
            onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border-2 border-black/30 focus:border-black focus:outline-none focus:ring-2 focus:ring-black transition-all resize-none"
            placeholder="Any special setup, equipment, or notes..."
            disabled={loading}
          />
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-6 py-4 border-2 border-black text-black font-bold uppercase tracking-widest text-xs hover:bg-neutral-50 disabled:opacity-50 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="flex-1 px-6 py-4 bg-black text-white font-bold uppercase tracking-widest text-xs hover:bg-neutral-900 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Processing...' : 'Continue to Payment'}
          </button>
        </div>
      </form>

      <div className="mt-4 text-sm text-neutral-400">
        * Required fields
      </div>
    </div>
  );
};