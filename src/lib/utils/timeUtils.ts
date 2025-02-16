import { Decimal } from "@prisma/client/runtime/library";

export const calculateCancellationTime = (
  orderDate: string, 
  orderTime: string, 
  serviceThreshold: Decimal | number | null | undefined
) => {
  try {
    // Current time
    const now = new Date();
    console.log('Current time:', now.toISOString());

    // Convert order date and time to Date object
    const orderDateTime = new Date(`${orderDate}T${orderTime}`);
    console.log('Order DateTime:', orderDateTime.toISOString());
    
    // Get threshold hours (default to 2 if not provided)
    const thresholdHours = serviceThreshold ? Number(serviceThreshold) : 2;
    console.log('Threshold Hours:', thresholdHours);
    
    // Calculate when order becomes cancellable (order time + threshold hours)
    const cancellableTime = new Date(orderDateTime.getTime() + (thresholdHours * 60 * 60 * 1000));
    console.log('Cancellable After:', cancellableTime.toISOString());
    
    // Calculate if order is cancellable
    const isCancellable = now >= cancellableTime;
    
    // Calculate remaining time until cancellation is available
    const timeUntilCancellable = cancellableTime.getTime() - now.getTime();
    // Convert to hours and round up to nearest hour
    const hoursRemaining = Math.max(0, Math.ceil(timeUntilCancellable / (1000 * 60 * 60)));
    
    console.log({
      currentTime: now.toISOString(),
      orderTime: orderDateTime.toISOString(),
      thresholdHours,
      cancellableTime: cancellableTime.toISOString(),
      isCancellable,
      hoursRemaining
    });

    return {
      isCancellable,
      timeRemaining: hoursRemaining,
      cancellableTime
    };
  } catch (error) {
    console.error('Error calculating cancellation time:', error);
    return {
      isCancellable: false,
      timeRemaining: 0,
      cancellableTime: new Date()
    };
  }
};