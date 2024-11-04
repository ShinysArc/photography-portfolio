export function formatDate(dateString) {
    if (!dateString) return "";
  
    // Parse ISO 8601 date string
    const date = new Date(dateString);
  
    // Months mapping
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    date.setUTCHours(date.getUTCHours() + 2);
  
    // Extract date components
    const day = String(date.getUTCDate(2)).padStart(2, "0");
    const month = months[date.getUTCMonth()];
    const year = date.getUTCFullYear();
  
    let hours = date.getUTCHours();
    const minutes = String(date.getUTCMinutes(2)).padStart(2, "0");
  
    // Format the date string
    const formattedDate = `${day} ${month} ${year} ${hours}:${minutes}`;
    return formattedDate;
  }