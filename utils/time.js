// global
const units = [
    { label: 'w', value: 1000 * 60 * 60 * 24 * 7 },
    { label: 'd', value: 1000 * 60 * 60 * 24 },
    { label: 'h', value: 1000 * 60 * 60 },
    { label: 'm', value: 1000 * 60 },
    { label: 's', value: 1000 },
    { label: 'ms', value: 1 }
];

// check values
function isMsValue(value) {
    return typeof value === "number";
}
function isDuration(value) {
    return typeof value === "string";
}

// ms -> string format
function msToDuration(ms) {
    let remaining = ms;
    const parts = [];

    for (const u of units) {
        const amount = Math.floor(remaining / u.value);
        if (amount > 0) {
        parts.push(`${amount}${u.label}`);
        remaining -= amount * u.value;
        }
    }

    return parts.length ? parts.join('') : '0ms';
}

// string -> ms format
function durationToMs(duration) {
    let isNegative = false;
    if (duration.startsWith("-")) {
        isNegative = true;
        duration = duration.slice(1);
    }

    const num = parseInt(duration, 10);
    const unit = duration.replace(/\d+/g, "");

    for (const u of units) {
        if (u.label === unit)
            return isNegative ? -num * u.value : num * u.value;
    }

    return 0;
}

// ms -> discord timestamp
function msToDiscordTimestamp(duration, style = 'R') {
    if (isDuration(duration))
        duration = durationToMs(duration);
    const ts = Math.floor((Date.now() + duration) / 1000);
    return `<t:${ts}:${style}>`;
}

// date -> discord timestamp
function dateToDiscordTimestamp(date, style = 'F') {
    if (!(date instanceof Date)) return '[NONE]'
    const ts = Math.floor(date.getTime() / 1000);
    return `<t:${ts}:${style}>`;
}

module.exports = {isMsValue, isDuration, msToDuration, durationToMs, msToDiscordTimestamp, dateToDiscordTimestamp};