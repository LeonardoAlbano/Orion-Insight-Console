import { z } from 'zod';

export const nasaApodSchema = z.object({
  date: z.string(),                       
  title: z.string(),                      
  explanation: z.string(),                 
  url: z.string().url(),                   
  hdurl: z.string().url().optional(),      
  media_type: z.union([
    z.literal('image'),
    z.literal('video'),
  ]),
});

export type NasaApod = z.infer<typeof nasaApodSchema>;
