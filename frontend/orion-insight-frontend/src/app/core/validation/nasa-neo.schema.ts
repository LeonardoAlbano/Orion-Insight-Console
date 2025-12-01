import { z } from 'zod';

export const nasaNeoCloseApproachSchema = z.object({
  close_approach_date: z.string(),
  relative_velocity: z.object({
    kilometers_per_second: z.string(),
  }),
  miss_distance: z.object({
    kilometers: z.string(),
  }),
});

export const nasaNeoObjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  is_potentially_hazardous_asteroid: z.boolean(),
  estimated_diameter: z.object({
    kilometers: z.object({
      estimated_diameter_min: z.number(),
      estimated_diameter_max: z.number(),
    }),
  }),
  close_approach_data: z.array(nasaNeoCloseApproachSchema),
});

export const nasaNeoFeedSchema = z.object({
  element_count: z.number(),
  near_earth_objects: z.record(
    z.string(),
    z.array(nasaNeoObjectSchema),
  ),
});

export type NasaNeoFeed = z.infer<typeof nasaNeoFeedSchema>;
export type NasaNeoObject = z.infer<typeof nasaNeoObjectSchema>;
