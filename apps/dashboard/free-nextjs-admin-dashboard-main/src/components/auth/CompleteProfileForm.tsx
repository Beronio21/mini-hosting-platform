"use client";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { ChevronLeftIcon } from "@/icons";
import { apiCall } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function CompleteProfileForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    bio: "",
    address: "",
    country: "",
    cityState: "",
    postalCode: "",
    taxId: "",
  });

  useEffect(() => {
    // Check if temp credentials are in session storage
    const tempEmail = sessionStorage.getItem("tempEmail");
    const tempPassword = sessionStorage.getItem("tempPassword");

    if (!tempEmail || !tempPassword) {
      // No credentials found, redirect back to signup
      router.push("/signin");
      return;
    }

    setEmail(tempEmail);
    setPassword(tempPassword);
  }, [router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    const payload = {
      email,
      password,
      ...formData,
    };

    try {
      const res: any = await apiCall("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.token) {
        // Clear session storage
        sessionStorage.removeItem("tempEmail");
        sessionStorage.removeItem("tempPassword");

        // Store token and redirect to dashboard
        localStorage.setItem("token", res.token);
        window.location.href = "/dashboard/services";
      }
    } catch (err: any) {
      let msg = "Registration failed";
      if (err instanceof Error) {
        msg = err.message;
      } else if (typeof err === "string") {
        msg = err;
      } else if (err && typeof err === "object") {
        msg = JSON.stringify(err);
      }
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/signin"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to Sign In
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-2xl mx-auto">
        <div>
          <div className="mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Complete Your Profile
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please fill in your profile information to complete your account setup.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label>
                      First Name<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      name="firstName"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label>
                      Last Name<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      name="lastName"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div>
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Contact Details
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label>
                      Phone<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      name="phone"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label>Bio (Optional)</Label>
                  <textarea
                    name="bio"
                    rows={3}
                    placeholder="Tell us about yourself..."
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Address Information
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label>
                      Address<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      name="address"
                      placeholder="Street address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label>
                        Country<span className="text-error-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        name="country"
                        placeholder="Country"
                        value={formData.country}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label>
                        City/State<span className="text-error-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        name="cityState"
                        placeholder="City, State"
                        value={formData.cityState}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label>
                        Postal Code<span className="text-error-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        name="postalCode"
                        placeholder="Postal code"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label>
                        TAX ID<span className="text-error-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        name="taxId"
                        placeholder="Tax ID"
                        value={formData.taxId}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="rounded-lg border border-error-300 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating Account..." : "Complete Registration"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
