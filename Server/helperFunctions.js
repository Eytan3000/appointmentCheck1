export function addDayToDate(inputDate) {
  // Parse the input date string to a Date object
  const dateObject = new Date(inputDate);

  // Add one day to the date
  dateObject.setDate(dateObject.getDate() + 1);

  // Return the updated date as a string
  return dateObject;
}


