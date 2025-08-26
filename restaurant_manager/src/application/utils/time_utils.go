package utils

import "time"

// GetCurrentUTCTime returns the current time in UTC
func GetCurrentUTCTime() time.Time {
	return time.Now().UTC()
}

// ParseUTCTimestamp parses a timestamp string and returns it as UTC time
func ParseUTCTimestamp(timestamp string) (time.Time, error) {
	// Remove microseconds if present for better parsing
	cleanTimestamp := timestamp
	if len(timestamp) > 19 && timestamp[19] == '.' {
		cleanTimestamp = timestamp[:19] + "Z"
	}

	return time.Parse(time.RFC3339, cleanTimestamp)
}

// FormatUTCTimestamp formats a time.Time to UTC string
func FormatUTCTimestamp(t time.Time) string {
	return t.UTC().Format(time.RFC3339)
}
