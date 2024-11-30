export function formatDate(dateString) {
    if (!dateString) return "";
  
    // Parse ISO 8601 date string
    const date = new Date(dateString);
  
    // Define options for formatting the date
    const dateOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    };

    // Define options for formatting the time
    const timeOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };

    // Format date and time separately, then combine them
    const formattedDate = date.toLocaleDateString("en-GB", dateOptions);
    const formattedTime = date.toLocaleTimeString("en-GB", timeOptions);

    // Combine the formatted date and time
    const formattedDateTime = `${formattedDate} ${formattedTime}`;
    return formattedDateTime;
  }