import { z } from 'zod';

// Flight validation schemas
const flightSchema = z.object({
  flightNumber: z.string().min(2).max(10),
  originCode: z.string().length(3).toUpperCase(),
  destinationCode: z.string().length(3).toUpperCase(),
  departureTime: z.string().datetime(),
  arrivalTime: z.string().datetime(),
}).refine(data => new Date(data.departureTime) < new Date(data.arrivalTime), {
  message: "Departure time must be before arrival time",
});

// Seat validation schema
const seatSchema = z.object({
  flight: z.string().min(1),
  seatNumber: z.string().min(1).max(10),
  customerEmail: z.string().email().optional(),
});

// Lost item validation schema
const lostItemSchema = z.object({
  flight: z.string().min(1),
  seat: z.string().min(1),
  itemName: z.string().max(255),
  itemDescription: z.string().optional(),
  itemImageUrl: z.string().url().optional(),
  status: z.enum(['unclaimed', 'claimed', 'shipped']).default('unclaimed'),
});

// Claim validation schema
const claimSchema = z.object({
  item: z.string().min(1),
  customerEmail: z.string().email(),
  claimMethod: z.enum(['in-person', 'shipped']),
  shippingAddress: z.string().optional().nullable(),
  paymentStatus: z.enum(['pending', 'completed']).default('pending'),
}).refine(
  data => !(data.claimMethod === 'shipped' && !data.shippingAddress),
  {
    message: "Shipping address is required when claim method is 'shipped'",
  }
);

// Lost item report validation schema
const lostItemReportSchema = z.object({
  customerEmail: z.string().email(),
  flight: z.string().min(1),
  itemDescription: z.string().min(1),
  status: z.enum(['pending', 'matched', 'unmatched']).default('pending'),
});

// Export both full and partial schemas
export {
  flightSchema,
  seatSchema,
  lostItemSchema,
  claimSchema,
  lostItemReportSchema,
};

// Partial schemas for PATCH requests
export const partialFlightSchema = z.object({
  flightNumber: z.string().min(2).max(10).optional(),
  originCode: z.string().length(3).toUpperCase().optional(),
  destinationCode: z.string().length(3).toUpperCase().optional(),
  departureTime: z.string().datetime().optional(),
  arrivalTime: z.string().datetime().optional(),
}).refine(
  data => !data.departureTime || !data.arrivalTime || new Date(data.departureTime) < new Date(data.arrivalTime),
  {
    message: "Departure time must be before arrival time",
  }
);

export const partialSeatSchema = z.object({
  flight: z.string().min(1).optional(),
  seatNumber: z.string().min(1).max(10).optional(),
  customerEmail: z.string().email().optional(),
});

export const partialLostItemSchema = z.object({
  flight: z.string().min(0).optional(),
  seat: z.string().min(0).optional(),
  itemName: z.string().min(0).max(255).optional(),
  itemDescription: z.string().optional(),
  itemImageUrl: z.string().url().optional(),
  status: z.enum(['unclaimed', 'claimed', 'shipped']).optional(),
});

export const partialClaimSchema = z.object({
  item: z.string().min(1).optional(),
  customerEmail: z.string().email().optional(),
  claimMethod: z.enum(['in-person', 'shipped']).optional(),
  shippingAddress: z.string().optional().nullable(),
  paymentStatus: z.enum(['pending', 'completed']).optional(),
}).refine(
  data => !(data.claimMethod === 'shipped' && data.shippingAddress === undefined),
  {
    message: "Shipping address is required when claim method is 'shipped'",
  }
);

export const partialLostItemReportSchema = z.object({
  customerEmail: z.string().email().optional(),
  flight: z.string().min(1).optional(),
  itemDescription: z.string().min(1).optional(),
  status: z.enum(['pending', 'matched', 'unmatched']).optional(),
}); 