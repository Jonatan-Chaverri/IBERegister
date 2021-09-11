import {SKIP_DATES, WEEKLY_UNAVAILABLE_DAYS} from "./config"

export const isValidName = name => {
    const regex = /^[A-Za-zñÑÁ-Źá-ź]{1,15}\s[A-Za-zñÑÁ-Źá-ź]{1,15}(\s[A-Za-zñÑÁ-Źá-ź]{1,15}$|$)/
    return regex.test(name.trim())
}

export const isValidPhone = phone => {
    const regex = /^[0-9]{8}$/
    return regex.test(phone)
}

export const nextAvailableDate = () => {
    var dateOut = ""
    var currentDate = new Date()
    if (currentDate.getDay() == 0 && currentDate.getHours() >= 12){
        // If today is sunday and pass 12 pm, next available date is next sunday
        currentDate.setDate(currentDate.getDate()+1)
    }
    currentDate.setDate(currentDate.getDate() + (14-currentDate.getDay()) % 7)
    const y = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(currentDate);
    const m = new Intl.DateTimeFormat('en', { month: 'numeric' }).format(currentDate);
    const d = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(currentDate);
    dateOut = `${y}-${m}-${d}`
    return dateOut
}

export const isAvailableReservation = dateIn => {
    const currentDate = new Date()
    if (WEEKLY_UNAVAILABLE_DAYS.includes(currentDate.getDay())){
        return false
    }
    if (SKIP_DATES.includes(dateIn)){
        return false
    }
    if (currentDate.getDay() == 0 && currentDate.getHours() < 12){
        // if sunday morning
        return false
    }
    return true
}

export const dateToString = (dateIn) => {
    const y = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(dateIn);
    const m = new Intl.DateTimeFormat('en', { month: 'numeric' }).format(dateIn);
    const d = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(dateIn);
    const dateOut = `${y}-${d}-${m}`
    return dateOut
}

export const getCurrentWeek = () => {
    // Find next sunday date that will be the week number on db
    var nextSundayDate = new Date()
    nextSundayDate.setDate(nextSundayDate.getDate() + (14-nextSundayDate.getDay()) % 7)

    var currentDate = new Date()

    const sundayStr = dateToString(nextSundayDate)
    const sundayAmStr = `${sundayStr}-9am`
    const sundayPmStr = `${sundayStr}-11am`
    const weekId = `v2-${sundayStr}`

    // Create output week reference
    const out = {
        [weekId]: {
            [sundayAmStr]: {
                label: `Domingo ${sundayStr.substring(5)} 9:00am`,
                available: currentDate < nextSundayDate,
                space: 0
            },
            [sundayPmStr]: {
                label: `Domingo ${sundayStr.substring(5)} 11:00am`,
                available: currentDate < nextSundayDate,
                space: 0
            }
        }
    }
    return out
}
