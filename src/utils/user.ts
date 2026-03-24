export const getUserId = (): string => {
  let userId = sessionStorage.getItem("userId");

  if (!userId) {
    userId = "user_" + Math.random().toString(36).substring(2, 9);
    sessionStorage.setItem("userId", userId);
  }

  return userId;
};
