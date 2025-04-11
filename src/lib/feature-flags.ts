/**
 * Utility functions for feature flags
 */

/**
 * Check if OTP verification is enabled
 * @returns boolean
 */
export function isOtpVerificationEnabled(): boolean {
  // Convert string to boolean, default to false if not set
  return process.env.ENABLE_OTP_VERIFICATION === "true";
}
