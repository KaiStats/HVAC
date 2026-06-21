import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const DATA_DIR = path.join(process.cwd(), "data");
const BOOKINGS_FILE = path.join(DATA_DIR, "bookings.json");

export interface Booking {
  id: string;
  createdAt: string;
  customer_name: string;
  phone: string;
  service_type: string;
  urgency: string;
  address: string;
  slot: string;
  notes: string;
  status: string;
}

type BookingInput = Omit<Booking, "id" | "createdAt">;

function ensureFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(BOOKINGS_FILE)) {
    fs.writeFileSync(BOOKINGS_FILE, "[]", "utf8");
  }
}

export function saveBooking(b: BookingInput): Booking {
  ensureFile();

  const booking: Booking = {
    ...b,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };

  const existing = getBookings();
  existing.push(booking);
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(existing, null, 2), "utf8");

  return booking;
}

export function getBookings(): Booking[] {
  ensureFile();
  const raw = fs.readFileSync(BOOKINGS_FILE, "utf8");
  return JSON.parse(raw) as Booking[];
}
