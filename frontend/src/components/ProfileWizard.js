import React, { useState } from "react";
import { updateUserProfile } from "../services/authService";

const ProfileWizard = ({ onComplete, onSkip }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: "",
    dateOfBirth: "",
    gender: "",
    region: "",
    conditions: [],
    bloodGroup: "",
    height: "",
    weight: "",
    lifestyle: {
      smoking: "",
      alcohol: "",
      exercise: "",
    },
  });
  const [loading, setLoading] = useState(false);

  const totalSteps = 5;

  const regions = [
    "North America",
    "South America",
    "Europe",
    "Asia",
    "Africa",
    "Oceania",
    "Middle East",
    "Caribbean",
    "Central America",
  ];

  const medicalConditions = [
    "Diabetic",
    "Pregnant",
    "Hypertensive",
    "Heart Disease",
    "Kidney Disease",
    "Liver Disease",
    "Thyroid Disorder",
    "Asthma",
  ];

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLifestyleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      lifestyle: {
        ...prev.lifestyle,
        [field]: value,
      },
    }));
  };

  const toggleCondition = (condition) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions.includes(condition)
        ? prev.conditions.filter((c) => c !== condition)
        : [...prev.conditions, condition],
    }));
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Calculate age from DOB if provided
      let age = formData.age;
      if (formData.dateOfBirth && !age) {
        const birthDate = new Date(formData.dateOfBirth);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
      }

      const profileData = {
        ...formData,
        age: parseInt(age) || undefined,
        height: parseFloat(formData.height) || undefined,
        weight: parseFloat(formData.weight) || undefined,
        conditions: formData.conditions.map((c) =>
          c.toLowerCase().replace(/ /g, "_")
        ),
      };

      await updateUserProfile(profileData);
      if (onComplete) onComplete(profileData);
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.age || formData.dateOfBirth;
      case 2:
        return formData.gender;
      case 3:
        return formData.region;
      default:
        return true;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-3xl shadow-lifted-lg overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="relative p-8 bg-gradient-purple text-white">
          <div className="absolute top-4 right-4">
            {onSkip && (
              <button
                onClick={onSkip}
                className="text-white/80 hover:text-white text-sm font-medium transition-colors"
              >
                Skip for now
              </button>
            )}
          </div>
          <h2 className="text-3xl font-bold mb-2">
            Complete Your Health Profile
          </h2>
          <p className="text-white/90">
            Help us personalize your health insights by sharing some information
          </p>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between mb-2">
              {[...Array(totalSteps)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 mx-1 rounded-full transition-all ${
                    i + 1 <= step ? "bg-white" : "bg-white/30"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-white/80">
              Step {step} of {totalSteps}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Step 1: Age */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in-up">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  How old are you?
                </h3>
                <p className="text-gray-600">
                  This helps us provide age-appropriate health insights
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age (years)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={formData.age}
                    onChange={(e) => handleChange("age", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-primary focus:border-transparent transition-all text-lg"
                    placeholder="Enter your age"
                  />
                </div>

                <div className="text-center text-gray-500 text-sm">or</div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      handleChange("dateOfBirth", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Gender */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in-up">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  What is your gender?
                </h3>
                <p className="text-gray-600">
                  Reference ranges vary by biological sex
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {["male", "female", "other"].map((gender) => (
                  <button
                    key={gender}
                    onClick={() => handleChange("gender", gender)}
                    className={`p-6 border-2 rounded-2xl font-medium text-lg transition-all transform hover:scale-105 ${
                      formData.gender === gender
                        ? "border-purple-primary bg-purple-50 text-purple-primary"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Region */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in-up">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Where are you from?
                </h3>
                <p className="text-gray-600">
                  Some reference ranges vary by geographic region
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {regions.map((region) => (
                  <button
                    key={region}
                    onClick={() => handleChange("region", region)}
                    className={`p-4 border-2 rounded-xl font-medium transition-all hover:scale-105 ${
                      formData.region === region
                        ? "border-purple-primary bg-purple-50 text-purple-primary"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Medical Conditions & Blood Group */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in-up">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Medical Information
                </h3>
                <p className="text-gray-600">
                  Select any conditions that apply to you
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Medical Conditions (Optional)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {medicalConditions.map((condition) => (
                    <button
                      key={condition}
                      onClick={() => toggleCondition(condition)}
                      className={`p-3 border-2 rounded-xl text-sm font-medium transition-all ${
                        formData.conditions.includes(condition)
                          ? "border-purple-primary bg-purple-50 text-purple-primary"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {formData.conditions.includes(condition) && (
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                        {condition}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Group (Optional)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {bloodGroups.map((group) => (
                    <button
                      key={group}
                      onClick={() => handleChange("bloodGroup", group)}
                      className={`p-3 border-2 rounded-xl font-semibold transition-all ${
                        formData.bloodGroup === group
                          ? "border-purple-primary bg-purple-50 text-purple-primary"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      {group}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Lifestyle & Body Metrics */}
          {step === 5 && (
            <div className="space-y-6 animate-fade-in-up">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Lifestyle & Body Metrics
                </h3>
                <p className="text-gray-600">
                  This information helps provide better recommendations
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleChange("height", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-primary focus:border-transparent"
                    placeholder="170"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleChange("weight", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-primary focus:border-transparent"
                    placeholder="70"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Smoking Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["never", "former", "current"].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleLifestyleChange("smoking", status)}
                      className={`p-2 border-2 rounded-xl text-sm font-medium transition-all ${
                        formData.lifestyle.smoking === status
                          ? "border-purple-primary bg-purple-50 text-purple-primary"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alcohol Consumption
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["never", "occasional", "moderate", "heavy"].map((level) => (
                    <button
                      key={level}
                      onClick={() => handleLifestyleChange("alcohol", level)}
                      className={`p-2 border-2 rounded-xl text-sm font-medium transition-all ${
                        formData.lifestyle.alcohol === level
                          ? "border-purple-primary bg-purple-50 text-purple-primary"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exercise Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["sedentary", "moderate", "active"].map((level) => (
                    <button
                      key={level}
                      onClick={() => handleLifestyleChange("exercise", level)}
                      className={`p-2 border-2 rounded-xl text-sm font-medium transition-all ${
                        formData.lifestyle.exercise === level
                          ? "border-purple-primary bg-purple-50 text-purple-primary"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className={`px-6 py-2 rounded-xl font-medium transition-all ${
              step === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed() || loading}
            className={`px-8 py-3 rounded-xl font-semibold text-white transition-all transform hover:scale-105 ${
              canProceed() && !loading
                ? "bg-gradient-purple shadow-lg hover:shadow-xl"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving...
              </span>
            ) : step === totalSteps ? (
              "Complete Profile"
            ) : (
              "Continue"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileWizard;
