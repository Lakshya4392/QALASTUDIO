import { UserDetails } from '../components/UserDetailsForm';

const API_BASE_URL = 'http://localhost:3001/api';

export interface AvailabilitySlot {
  start: string;
  end: string;
}

export interface BookingHoldResponse {
  lock_token: string;
  expires_at: string;
  pricing_preview: {
    total: number;
    currency: string;
  };
}

export const api = {
  /**
   * Fetch available slots for a studio
   */
  getAvailability: async (studioId: string, startDate: string, endDate: string): Promise<AvailabilitySlot[]> => {
    const response = await fetch(
      `${API_BASE_URL}/availability?studio_id=${studioId}&start_date=${startDate}&end_date=${endDate}`
    );
    if (!response.ok) throw new Error('Failed to fetch availability');
    const data = await response.json();
    return data.available_slots;
  },

  /**
   * Create a hold on a slot
   */
  createHold: async (studioId: string, startDatetime: string, endDatetime: string): Promise<BookingHoldResponse> => {
    const response = await fetch(`${API_BASE_URL}/bookings/hold`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studio_id: studioId, start_datetime: startDatetime, end_datetime: endDatetime }),
    });

    if (!response.ok) {
      let errorMsg = 'Failed to create hold';
      try {
        const text = await response.text();
        try {
          const error = JSON.parse(text);
          errorMsg = error.error || errorMsg;
        } catch {
          errorMsg = text || response.statusText;
        }
      } catch (e) {
        errorMsg = response.statusText;
      }
      throw new Error(errorMsg);
    }
    return response.json();
  },

  /**
   * Confirm a booking with user details
   */
  confirmBooking: async (lockToken: string, paymentIntentId: string, finalPrice: number, userDetails: UserDetails) => {
    const response = await fetch(`${API_BASE_URL}/bookings/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lock_token: lockToken,
        payment_intent_id: paymentIntentId,
        final_price: finalPrice,
        user_details: userDetails,
      }),
    });

    if (!response.ok) {
      let errorMsg = 'Failed to confirm booking';
      try {
        const text = await response.text();
        try {
          const error = JSON.parse(text);
          errorMsg = error.error || errorMsg;
        } catch {
          errorMsg = text || response.statusText;
        }
      } catch (e) {
        errorMsg = response.statusText;
      }
      throw new Error(errorMsg);
    }
    return response.json();
  },

  /**
   * Validate user details
   */
  validateUserDetails: async (userDetails: UserDetails) => {
    const response = await fetch(`${API_BASE_URL}/user-details/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userDetails),
    });

    if (!response.ok) {
      throw new Error('Failed to validate user details');
    }
    return response.json();
  },
};
