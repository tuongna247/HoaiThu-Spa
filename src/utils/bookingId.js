export const generateBookingId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `BK${timestamp}${randomStr}`.toUpperCase();
};

export const generateBookingReference = () => {
  return generateBookingId();
};

export const validateBookingId = (bookingId) => {
  if (!bookingId || typeof bookingId !== "string") {
    return false;
  }
  
  return /^BK[A-Z0-9]+$/.test(bookingId);
};

export const isValidBookingId = (id) => {
  return validateBookingId(id);
};

export const isMongoObjectId = (id) => {
  return /^[a-f\d]{24}$/i.test(id);
};
