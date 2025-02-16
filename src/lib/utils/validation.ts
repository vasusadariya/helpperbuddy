import { toast } from 'react-hot-toast';

interface ServiceThreshold {
  threshold: number;
  name?: string;
}

// Helper to format time for display
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
}

export const validateDateTime = (
  date: string, 
  time: string,
  service: ServiceThreshold
): boolean => {
  try {
    const selectedDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    const threshold = Number(service.threshold);

    // Check if the date and time are valid
    if (isNaN(selectedDateTime.getTime())) {
      toast.error("Please enter a valid date and time");
      return false;
    }

    // Calculate minimum allowed booking time (now + threshold hours)
    const minimumBookingTime = new Date(now);
    minimumBookingTime.setHours(minimumBookingTime.getHours() + threshold);

    // Check if it's a booking for today
    const isToday = selectedDateTime.toDateString() === now.toDateString();

    // Check if the date is in the past
    if (selectedDateTime < now) {
      if (isToday) {
        toast.error("Please select a future time for today's bookings");
      } else {
        toast.error("Please select a future date");
      }
      return false;
    }

    // Check service hours (8 AM to 8 PM)
    const bookingHour = selectedDateTime.getHours();
    const bookingMinutes = selectedDateTime.getMinutes();
    if (bookingHour < 8 || (bookingHour === 20 && bookingMinutes > 0) || bookingHour > 20) {
      toast.error("Our service hours are between 8:00 AM and 8:00 PM");
      return false;
    }

    // Only apply threshold check to slots that fall within threshold window
    const thresholdWindow = new Date(now.getTime() + (threshold * 60 * 60 * 1000));
    
    if (isToday && selectedDateTime <= thresholdWindow) {
      const serviceName = service.name ? `${service.name} ` : '';
      const formattedThreshold = formatTime(minimumBookingTime);
      
      toast.error(
        `${serviceName}requires ${threshold} hours advance booking. ` +
        `Earliest available time is ${formattedThreshold}`
      );
      return false;
    }

    // Check if the date is too far in the future (more than 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    if (selectedDateTime > thirtyDaysFromNow) {
      toast.error("Bookings can only be made up to 30 days in advance");
      return false;
    }

    return true;
  } catch (error) {
    console.error('DateTime validation error:', error);
    toast.error("Please select a valid date and time");
    return false;
  }
};

// Helper function to get the next available time slot considering multiple services
export const getNextAvailableTimeSlot = (services: ServiceThreshold[]): Date => {
  const now = new Date();
  const nextSlot = new Date(now);
  
  // Find the maximum threshold hours among all services
  const maxThresholdHours = Math.max(...services.map(s => Number(s.threshold)));

  // Add maximum threshold hours to current time
  nextSlot.setHours(nextSlot.getHours() + maxThresholdHours);

  // If outside service hours (8 AM - 8 PM), adjust to next day
  if (nextSlot.getHours() < 8) {
    nextSlot.setHours(8, 0, 0, 0);
  } else if (nextSlot.getHours() >= 20) {
    nextSlot.setDate(nextSlot.getDate() + 1);
    nextSlot.setHours(8, 0, 0, 0);
  }

  return nextSlot;
};

// Helper function to validate time for multiple services
export const validateDateTimeForServices = (
  date: string,
  time: string,
  services: ServiceThreshold[]
): boolean => {
  // Check each service's threshold
  for (const service of services) {
    if (!validateDateTime(date, time, service)) {
      return false;
    }
  }
  return true;
};

// Helper function to get earliest available time considering all services
export const getEarliestAvailableTime = (services: ServiceThreshold[]): string => {
  const nextSlot = getNextAvailableTimeSlot(services);
  return formatTime(nextSlot);
};

// Helper function to check if time needs to be updated based on thresholds
export const shouldUpdateTime = (
  selectedDate: string,
  selectedTime: string,
  services: ServiceThreshold[]
): boolean => {
  const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
  const nextAvailable = getNextAvailableTimeSlot(services);
  return selectedDateTime < nextAvailable;
};

// Helper function to format threshold messages
export const getThresholdMessage = (services: ServiceThreshold[]): string => {
  if (services.length === 0) return '';
  
  if (services.length === 1) {
    return `Requires ${services[0].threshold} hours advance booking`;
  }

  const maxThreshold = Math.max(...services.map(s => s.threshold));
  return `Multiple services selected. Maximum advance booking requirement is ${maxThreshold} hours`;
};