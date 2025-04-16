"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import LogoImage from "@/assets/myAdvo-peachWhite.svg";
import { isOtpVerificationEnabled } from "@/lib/feature-flags";
import { Checkbox } from "@/components/ui/checkbox";
// Define options for dropdowns
const ageGroupOptions = ["16-18", "18-24", "25-30", "30-45", "45+"];
const raceEthnicityOptions = [
  "Hispanic",
  "Black",
  "Latine",
  "Pacific Islander",
  "East Asian",
  "South Asian",
  "Middle Eastern",
  "White",
  "Indigenous",
  "Not Listed",
];
const genderOptions = [
  "Cis Female",
  "Cis Male",
  "Trans Female",
  "Trans Male",
  "Non-Binary",
  "Not Listed",
];
const pronounOptions = ["he", "she", "they", "ze", "xe"];
const pronounOptions2 = ["him", "her", "them", "zir", "xem"];
const sexualOrientationOptions = [
  "Questioning",
  "Lesbian",
  "Gay",
  "Pan",
  "Bi",
  "Straight",
  "Demi",
  "Asexual",
  "Not Listed",
];
const incomeBracketOptions = [
  "Under $10,000",
  "$10,000 - $25,000",
  "$25,000 - $50,000",
  "$50,000 - $75,000",
  "$75,000 - $100,000",
  "$100,000 - $150,000",
  "Over $150,000",
  "Prefer not to say",
];
const livingSituationOptions = ["Apartment", "House", "Homeless", "Other"];
const livingArrangementOptions = [
  "With Family",
  "Alone",
  "With Roommates",
  "Other",
];
// Resource interest categories
const relationshipResources = [
  "Romantic/Sexual Relationships",
  "Family",
  "Abuse",
  "Bullying",
  "Racial Identity",
  "Cultural Identity",
  "LGBTQ Identity",
  "Legal Issues",
  "Social Groups (General)",
];

const mentalHealthResources = [
  "Mental Health (General)",
  "Coping Skills",
  "Self Image",
  "Grief and Loss",
  "Addiction/Substance Abuse",
  "Internet/Tech/Social Media",
];

const physicalHealthResources = [
  "Nutrition",
  "Disordered Eating",
  "Fitness & Exercise",
  "Sexual Health",
  "Transgender Health",
  "Reproductive Health",
  "Sleep",
  "Physical Health (General)",
  "Chronic Illness/Disability",
  "Accessibility",
  "Housing",
];

const SignUpPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  // New user data fields
  const [ageGroup, setAgeGroup] = useState("");
  const [raceEthnicity, setRaceEthnicity] = useState("");
  const [gender, setGender] = useState("");
  const [pronoun1, setPronoun1] = useState("");
  const [pronoun2, setPronoun2] = useState("");
  const [sexualOrientation, setSexualOrientation] = useState("");
  const [incomeBracket, setIncomeBracket] = useState("");
  const [livingSituation, setLivingSituation] = useState("");
  const [livingArrangement, setLivingArrangement] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [resourceInterests, setResourceInterests] = useState<string[]>([]);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // If on step 1, move to step 2
    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }

    try {
      const userData = {
        password,
        email,
        ageGroup,
        raceEthnicity,
        gender,
        pronoun1,
        pronoun2,
        sexualOrientation,
        incomeBracket,
        livingSituation,
        livingArrangement,
        zipcode,
        resourceInterests,
      };

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        if (isOtpVerificationEnabled() && data.requiresVerification) {
          setUserId(data.userId);
          setShowOtpForm(true);
          setSuccess(
            "Registration successful! Please verify your email with the OTP sent.",
          );
        } else {
          setSuccess("User registered successfully!");
          setTimeout(() => router.push("/auth/signin"), 2000);
        }
      } else {
        setError(data.message || "An error occurred during registration");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Registration error:", error);
    }
  };

  const handleResourceInterestToggle = (interest: string) => {
    setResourceInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((item) => item !== interest)
        : [...prev, interest],
    );
  };

  const goBack = () => {
    setCurrentStep(1);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsVerifying(true);

    try {
      const response = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, otp }),
      });

      const data = await response.json();

      if (response.ok && data.verified) {
        setSuccess("Email verified successfully! Redirecting to login...");
        setTimeout(() => router.push("/auth/signin"), 2000);
      } else {
        setError(data.message || "Invalid or expired OTP");
      }
    } catch (error) {
      setError("An unexpected error occurred during verification");
      console.error("OTP verification error:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");

    try {
      const response = await fetch("/api/auth/otp/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSuccess("A new verification code has been sent to your email");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to resend verification code");
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error("Resend OTP error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white mt-[180px] md:mt-0">
      <div className="max-w-md w-full space-y-8 p-10 bg-gray-900 rounded-xl shadow-lg">
        {/* Logo */}
        <div className="flex justify-center">
          <Image src={LogoImage} alt="Logo" width={120} height={120} priority />
        </div>
        {/* Header */}
        <div className="text-center text-3xl font-extrabold font-univers">
          {showOtpForm ? "Verify Your Email" : "Create Your Account"}
          {!showOtpForm && currentStep === 2 && " - Demographics"}
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="text-red-500 bg-red-900/30 p-3 rounded-lg text-center font-anonymous-pro">
            {error}
          </div>
        )}
        {success && (
          <div className="text-green-500 bg-green-900/30 p-3 rounded-lg text-center font-anonymous-pro">
            {success}
          </div>
        )}

        {/* Registration Form */}
        {!showOtpForm ? (
          <form
            onSubmit={handleSignUp}
            className="space-y-6 font-anonymous-pro"
          >
            {currentStep === 1 ? (
              <>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1 block w-full px-4 py-3 border border-gray-700 bg-neutral-800 text-white rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1 block w-full px-4 py-3 border border-gray-700 bg-neutral-800 text-white rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-full bg-neutral-800 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 btn-gradient-hover"
                >
                  Continue
                </button>
              </>
            ) : (
              <>
                <div className="max-h-[60vh] overflow-y-auto pr-2">
                  {/* Age Group */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Age Group
                    </label>
                    <select
                      value={ageGroup}
                      onChange={(e) => setAgeGroup(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-700 bg-neutral-800 text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                    >
                      <option value="">Select Age Group</option>
                      {ageGroupOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Race/Ethnicity */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Race/Ethnicity
                    </label>
                    <select
                      value={raceEthnicity}
                      onChange={(e) => setRaceEthnicity(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-700 bg-neutral-800 text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                    >
                      <option value="">Select Race/Ethnicity</option>
                      {raceEthnicityOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Gender */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-700 bg-neutral-800 text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                    >
                      <option value="">Select Gender</option>
                      {genderOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pronouns */}
                  <div className="mb-4 flex gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Pronoun 1
                      </label>
                      <select
                        value={pronoun1}
                        onChange={(e) => setPronoun1(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-700 bg-neutral-800 text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                      >
                        <option value="">Select</option>
                        {pronounOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Pronoun 2
                      </label>
                      <select
                        value={pronoun2}
                        onChange={(e) => setPronoun2(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-700 bg-neutral-800 text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                      >
                        <option value="">Select</option>
                        {pronounOptions2.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Sexual Orientation */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Sexual Orientation
                    </label>
                    <select
                      value={sexualOrientation}
                      onChange={(e) => setSexualOrientation(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-700 bg-neutral-800 text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                    >
                      <option value="">Select Sexual Orientation</option>
                      {sexualOrientationOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Income Bracket */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Income Bracket
                    </label>
                    <select
                      value={incomeBracket}
                      onChange={(e) => setIncomeBracket(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-700 bg-neutral-800 text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                    >
                      <option value="">Select Income Bracket</option>
                      {incomeBracketOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Living Situation */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Living Situation
                    </label>
                    <select
                      value={livingSituation}
                      onChange={(e) => setLivingSituation(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-700 bg-neutral-800 text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                    >
                      <option value="">Select Living Situation</option>
                      {livingSituationOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Living Arrangement */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Living Arrangement
                    </label>
                    <select
                      value={livingArrangement}
                      onChange={(e) => setLivingArrangement(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-700 bg-neutral-800 text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                    >
                      <option value="">Select Living Arrangement</option>
                      {livingArrangementOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Zipcode */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Zipcode
                    </label>
                    <input
                      type="text"
                      value={zipcode}
                      onChange={(e) => setZipcode(e.target.value)}
                      placeholder="Enter your zipcode"
                      className="w-full px-4 py-2 border border-gray-700 bg-neutral-800 text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                      maxLength={5}
                      pattern="[0-9]{5}"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Your zipcode helps us show resources in your area
                    </p>
                  </div>

                  {/* Resource Interests */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Resource Interests (Select all that apply)
                    </label>
                    <div className="mb-2 font-medium text-pink-400">
                      Relationships & Identity
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {relationshipResources.map((interest) => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => handleResourceInterestToggle(interest)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                            resourceInterests.includes(interest)
                              ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white"
                              : "bg-neutral-800 text-gray-300 hover:bg-neutral-700"
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                    <div className="mb-2 font-medium text-pink-400">
                      Mental Health
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {mentalHealthResources.map((interest) => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => handleResourceInterestToggle(interest)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                            resourceInterests.includes(interest)
                              ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white"
                              : "bg-neutral-800 text-gray-300 hover:bg-neutral-700"
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                    <div className="mb-2 font-medium text-pink-400">
                      Physical Health
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {physicalHealthResources.map((interest) => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => handleResourceInterestToggle(interest)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                            resourceInterests.includes(interest)
                              ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white"
                              : "bg-neutral-800 text-gray-300 hover:bg-neutral-700"
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={goBack}
                    className="flex-1 py-3 px-4 rounded-full bg-neutral-800 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 hover:bg-neutral-700"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-full bg-neutral-800 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 btn-gradient-hover"
                  >
                    Sign Up
                  </button>
                </div>
              </>
            )}
          </form>
        ) : (
          /* OTP Verification Form */
          <form
            onSubmit={handleVerifyOTP}
            className="space-y-6 font-anonymous-pro"
          >
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-300"
              >
                Verification Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="Enter 6-digit code"
                className="mt-1 block w-full px-4 py-3 border border-gray-700 bg-neutral-800 text-white rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
              />
              <p className="mt-2 text-sm text-gray-400">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 px-4 rounded-full bg-neutral-800 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 btn-gradient-hover"
            >
              {isVerifying ? "Verifying..." : "Verify Email"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                className="text-pink-400 hover:text-pink-300 transition-colors text-sm"
              >
                Didn&apos;t receive the code? Resend
              </button>
            </div>
          </form>
        )}

        {/* Footer Links */}
        <hr className="hr-gradient-hover my-6" />
        <div className="text-center text-sm font-anonymous-pro">
          Already have an account?{" "}
          <Link
            href="/auth/signin"
            className="text-pink-400 hover:text-pink-300 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
