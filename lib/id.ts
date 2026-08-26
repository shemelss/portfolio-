// A simple, lightweight ID generator to replace uuid for browser-only use cases.
// This is not cryptographically secure and should not be used for sensitive IDs
// where collision resistance is paramount across a large distributed system.
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
