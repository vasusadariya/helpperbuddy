export const formatDateTime = (date: Date): string => {
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

export const calculateOrderAge = (createdAt: Date): number => {
  const now = new Date();
  return (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
};

export const formatTimeRemaining = (hours: number): string => {
  if (hours <= 0) return "Can be cancelled now";
  
  const fullHours = Math.floor(hours);
  const minutes = Math.round((hours - fullHours) * 60);
  
  if (fullHours === 0) {
    return `${minutes} minutes remaining`;
  } else if (minutes === 0) {
    return `${fullHours} hour${fullHours > 1 ? 's' : ''} remaining`;
  }
  return `${fullHours} hour${fullHours > 1 ? 's' : ''} and ${minutes} minutes remaining`;
};