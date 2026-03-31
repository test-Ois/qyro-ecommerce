export const checkPasswordStrength = (password) => {

  let score = 0;

  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;

  if (score <= 1) return "Weak";
  if (score === 2 || score === 3) return "Medium";
  return "Strong";

};

export const validatePassword = (password) => {

  const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  return passwordRegex.test(password);

};