/*
 * Validates if input is a valid name for a person
 */
export const isValidName = name => {
    const regex = /^[A-Za-zñÑÁ-Źá-ź]{1,15}\s[A-Za-zñÑÁ-Źá-ź]{1,15}(\s[A-Za-zñÑÁ-Źá-ź]{1,15}$|$)/
    return regex.test(name.trim())
}

/*
 * Validates if input is a valid phone number
 */
export const isValidPhone = phone => {
    const regex = /^[0-9]{8}$/
    return regex.test(phone)
}

/*
 * Validates if date is available for reservations
 */
export const isAvailableReservation = dateIn => {
    const currentDate = new Date()
    if (currentDate.getDay() === 0 && currentDate.getHours() < 12){
        // if sunday morning
        return false
    }
    if (currentDate.getDay() === 6 && currentDate.getHours() >= 22){
        // if saturday after 10pm
        return false
    }
    return true
}

/*
 * Parse a Date object to a string with format yyyy-dd-mm
 */
export const dateToString = (dateIn) => {
    const y = new Intl.DateTimeFormat(
        'en', { year: 'numeric' }).format(dateIn
    );
    const m = new Intl.DateTimeFormat(
        'en', { month: 'numeric' }).format(dateIn
    );
    const d = new Intl.DateTimeFormat(
        'en', { day: '2-digit' }).format(dateIn
    );
    const dateOut = `${y}-${d}-${m}`
    return dateOut
}

/*
 * Returns the information of the dates available for the week
 */
export const getCurrentWeek = () => {
    // Find next sunday date
    var nextSundayDate = new Date()
    nextSundayDate.setDate(
        nextSundayDate.getDate() + (14-nextSundayDate.getDay()) % 7
    )

    // if today is sunday and it's past 12 then reservation should be open for
    // next week
    var currentDate = new Date()
    if (currentDate.getDay() === 0 && currentDate.getHours() >= 12){
        nextSundayDate.setDate(nextSundayDate.getDate() + 1)
        nextSundayDate.setDate(
            nextSundayDate.getDate() + (14 - nextSundayDate.getDay()) % 7
        )
    }

    const sundayStr = dateToString(nextSundayDate)

    // There are two services every sunday, one at 9am, the other at 11am
    const firstService = `${sundayStr}-9am`
    const secondService = `${sundayStr}-11am`

    // A unique ID to identify the current week in the db
    const weekId = `v2-${sundayStr}`

    // Create output week reference
    const out = {
        [weekId]: {
            [firstService]: {
                label: `Domingo ${sundayStr.substring(5)} 9:00am`,
                available: isAvailableReservation(sundayStr),
                space: 0
            },
            [secondService]: {
                label: `Domingo ${sundayStr.substring(5)} 11:00am`,
                available: isAvailableReservation(sundayStr),
                space: 0
            }
        }
    }
    return out
}
