export const firebase_config = {
    apikey: "SECRET",
    authDomain: "SECRET",
    databaseURL: "SECRET",
    projectId: "SECRET",
    storageBucket: "SECRET",
    messagingSenderId: "SECRET",
    appId: "SECRET",
    measurementId: "SECRET"
}
export const MAX_ALLOWED_GUESTS = 150
export const MAX_GUESTS_PER_RESERVATION = 9

// Lists of dates that will be skipped from select box
export const SKIP_DATES = []

// Saturday and Sundays are unavailable dates
export const WEEKLY_UNAVAILABLE_DAYS = [6, 0]

// Change this values for prod
export const ADMIN_USER = "admin"
export const ADMIN_PASSWORD = "admin"

export default firebase_config
