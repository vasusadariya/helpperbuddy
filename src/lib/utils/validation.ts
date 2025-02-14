import { toast } from 'react-hot-toast';

export const validateDateTime = (date: string, time: string): boolean => {
  try {
    const selectedDateTime = new Date(`${date}T${time}`);
    const now = new Date();

    // Check if the date and time are valid
    if (isNaN(selectedDateTime.getTime())) {
      toast.error("Please enter a valid date and time");
      return false;
    }

    // Check if the date is in the past
    if (selectedDateTime < now) {
      const isToday = selectedDateTime.toDateString() === now.toDateString();
      if (isToday) {
        toast.error("Please select a future time for today's bookings");
      } else {
        toast.error("Please select a future date");
      }
      return false;
    }

    // Check service hours
    const hour = selectedDateTime.getHours();
    if (hour < 8 || hour >= 20) {
      toast.error("Our service hours are between 8:00 AM and 8:00 PM");
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
    toast.error("Please select a valid date and time");
    return false;
  }
};