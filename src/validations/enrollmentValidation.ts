import { z } from "zod";

export const enrollInCourseSchema = z.object({
  params: z.object({
    courseId: z
      .string({ error: "Course ID is required in the URL path" })
      .min(1, "Course ID cannot be empty"),
  }),
});
