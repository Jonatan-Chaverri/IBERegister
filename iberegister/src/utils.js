import {SKIP_DATES, WEEKLY_UNAVAILABLE_DAYS} from "./config"

export const isValidName = name => {
    const regex = /^[A-Za-zñÑÁ-Źá-ź]{1,15}\s[A-Za-zñÑÁ-Źá-ź]{1,15}(\s[A-Za-zñÑÁ-Źá-ź]{1,15}$|$)/
    return regex.test(name)
}

export const isValidPhone = phone => {
    const regex = /^[0-9]{8}$/
    return regex.test(phone)
}

export const nextAvailableDate = () => {
    var dateOut = ""
    var currentDate = new Date()
    currentDate.setDate(currentDate.getDate() + (14-currentDate.getDay()) % 7)
    const y = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(currentDate);
    const m = new Intl.DateTimeFormat('en', { month: 'numeric' }).format(currentDate);
    const d = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(currentDate);
    dateOut = `${y}-${m}-${d}`
    return dateOut
}

export const isAvailableReservation = dateIn => {
    return !(
        WEEKLY_UNAVAILABLE_DAYS.includes(new Date().getDay()) ||
        SKIP_DATES.includes(dateIn)
    )
}