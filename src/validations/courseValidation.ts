import { z } from "zod";

// 1. Used for Create Courses
export const createCourseSchema = z.object({
  body: z.object({
    title: z
      .string({ error: "Course title is required" })
      .min(5, "Title must be at least 5 characters long"),
    description: z
      .string({ error: "Description is required" })
      .min(10, "Description must be at least 10 characters long"),
    maxCapacity: z
      .number({ error: "Maximum capacity is required" })
      .int("Capacity must be a whole integer number")
      .positive("Capacity must be at least 1 student"),
    price: z
      .number({ error: "Price is required" })
      .nonnegative("Price cannot be a negative value"),
  }),
});

// 2. Used for PUT /courses/:courseId (Checks body AND params)
export const updateCourseSchema = z.object({
  params: z.object({
    courseId: z.string().min(1, "Course ID cannot be empty"),
  }),
  // below code goes inside the createCourseSchema inside the body and make a new schema with the properties inside body in createCourseSchema
  body: createCourseSchema.shape.body.partial(), // .partial() makes body fields optional for updates!
});

// 3. Used for DELETE and GET routes that only take a URL param
export const deleteCourseSchema = z.object({
  params: z.object({
    courseId: z.string().min(1, "Course ID cannot be empty"),
  }),
});
