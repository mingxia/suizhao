export type ErrorCode = "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "INVALID_INPUT" | "AGE_LOCKED" | "PHOTO_EXISTS" | "INVALID_IMAGE" | "FILE_TOO_LARGE" | "UPLOAD_FAILED" | "DATABASE_ERROR" | "STORAGE_ERROR";
export type ActionResult<T = undefined> = { success: true; data: T } | { success: false; error: { code: ErrorCode; message: string } };
