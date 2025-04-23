// Validate symptom log data
exports.validateSymptomLog = (data) => {
    const { timestamp, symptoms, severityRatings } = data;

    // Check if required fields are present
    if (!timestamp) {
        return 'Timestamp is required';
    }

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
        return 'At least one symptom is required';
    }

    // Validate timestamp
    const timestampDate = new Date(timestamp);
    if (isNaN(timestampDate.getTime())) {
        return 'Invalid timestamp format';
    }

    // Validate symptoms
    for (const symptom of symptoms) {
        if (!symptom.name || typeof symptom.name !== 'string') {
            return 'Each symptom must have a valid name';
        }
        
        if (symptom.isUrgent !== undefined && typeof symptom.isUrgent !== 'boolean') {
            return 'Symptom urgency must be a boolean value';
        }
    }

    // Validate severity ratings
    if (severityRatings) {
        if (typeof severityRatings !== 'object') {
            return 'Severity ratings must be an object';
        }

        for (const [symptomName, rating] of Object.entries(severityRatings)) {
            if (typeof rating !== 'number' || rating < 0 || rating > 4) {
                return 'Severity ratings must be numbers between 0 and 4';
            }

            // Check if the symptom exists in the symptoms array
            if (!symptoms.some(s => s.name === symptomName)) {
                return `Severity rating provided for non-existent symptom: ${symptomName}`;
            }
        }
    }

    return null;
}; 