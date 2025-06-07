export function getPreviousMonthISO() {
    const now = new Date()
    let year = now.getFullYear()
    let month = now.getMonth()
    if (month === 0) {
        month = 12
        year -= 1
    }
    return `${year}-${month < 10 ? `0${month}` : month}`;
}