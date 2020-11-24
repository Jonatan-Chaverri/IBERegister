import {SKIP_DATES} from "./config"


export const nextAvailableDate = currentDate => {
    var dateOut = ""
    do {
        currentDate.setDate(currentDate.getDate() + (14-currentDate.getDay()) % 7)
        const y = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(currentDate);
        const m = new Intl.DateTimeFormat('en', { month: 'numeric' }).format(currentDate);
        const d = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(currentDate);
        dateOut = `${y}-${m}-${d}`
        currentDate.setDate(currentDate.getDate() + 1)
    } while (SKIP_DATES.includes(dateOut))
    return dateOut
}