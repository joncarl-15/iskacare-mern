/**
 * Safely formats a date string or object into a time string.
 * Handles various input formats and invalid dates gracefully.
 * 
 * @param {string|Date} dateInput - The date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted time string or empty string if invalid
 */
export const formatTime = (dateInput, options = { hour: '2-digit', minute: '2-digit' }) => {
    if (!dateInput) return '';

    try {
        const date = new Date(dateInput);

        // Check if date is valid
        if (isNaN(date.getTime())) {
            console.warn('Invalid date encountered:', dateInput);
            return '';
        }

        return date.toLocaleTimeString([], options);
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
};

/**
 * Safely formats a date string or object into a date string.
 * 
 * @param {string|Date} dateInput - The date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string or empty string if invalid
 */
export const formatDate = (dateInput, options = undefined) => {
    if (!dateInput) return '';

    try {
        const date = new Date(dateInput);

        // Check if date is valid
        if (isNaN(date.getTime())) {
            console.warn('Invalid date encountered:', dateInput);
            return '';
        }

        return date.toLocaleDateString(undefined, options);
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
};
