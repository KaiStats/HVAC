export interface BookingInput {
  customer_name: string;
  phone: string;
  service_type: "AC" | "heating" | "plumbing" | "emergency";
  urgency: string;
  address: string;
  slot: string;
  notes?: string;
}

export interface Booking extends BookingInput {
  id: string;
  created_at: string;
  status: "pending" | "confirmed";
}

// In-memory store for demonstration purposes.
// Replace with a real database (e.g. Postgres, Supabase) in production.
const bookings: Booking[] = [];

export async function saveBooking(input: BookingInput): Promise<Booking> {
  const booking: Booking = {
    ...input,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    status: "confirmed",
  };

  bookings.push(booking);

  // Log for server-side visibility during development.
  console.log("[bookings] saved:", booking);

  return booking;
}

export function getAllBookings(): Booking[] {
  return [...bookings];
}
