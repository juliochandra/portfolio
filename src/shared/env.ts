/** biome-ignore-all lint/style/useNamingConvention: <env> */
import { z } from "zod";

const envSchema: z.ZodObject<{
  DATABASE_URL: z.ZodURL;
  R2_ACCOUNT_ID: z.ZodString;
  R2_ACCESS_KEY_ID: z.ZodString;
  R2_SECRET_ACCESS_KEY: z.ZodString;
  R2_BUCKET_NAME: z.ZodString;
  R2_PUBLIC_URL: z.ZodURL;
}> = z.object({
  DATABASE_URL: z.url(),
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET_NAME: z.string().min(1),
  R2_PUBLIC_URL: z.url(),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);
