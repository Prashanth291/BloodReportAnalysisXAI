// Generate a random 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Verify OTP (case-insensitive, removes spaces)
export const verifyOTP = (inputOTP, storedOTP) => {
  if (!inputOTP || !storedOTP) return false;

  const cleanInput = inputOTP.toString().replace(/\s/g, "");
  const cleanStored = storedOTP.toString().replace(/\s/g, "");

  return cleanInput === cleanStored;
};
