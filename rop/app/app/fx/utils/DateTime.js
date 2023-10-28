"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeekIndexOfYear = exports.getDayIndexOfYear = exports.durationToString = exports.durationFromString = exports.findNthWeekdayInMonth = exports.addRegularMonth = exports.alignToYear = exports.alignToMonth = exports.alignToWeek = exports.alignToDay = exports.alignToHour = exports.alignToMinute = exports.alignToSecond = exports.convertByTimeZone = exports.makeTimeByString = exports.makeTime = exports.getTimeRangeOfMonth = exports.timeToDateTimeString = exports.timeToISODateString = exports.buildDateTimeString = exports.buildISODateString = exports.parseLocalTime = exports.ENV_TIMEZONE = exports.tzToJS = exports.tzFromJS = exports.getDaysInYear = exports.getDaysInMonth = exports.isLeapYear = exports.MONTH_PER_YEAR = exports.MS_PER_WEEK = exports.SECONDS_PER_WEEK = exports.MINUTES_PER_WEEK = exports.HOURS_PER_WEEK = exports.DAYS_PER_WEEK = exports.MS_PER_DAY = exports.SECONDS_PER_DAY = exports.MINUTES_PER_DAY = exports.HOURS_PER_DAY = exports.MS_PER_HOUR = exports.SECONDS_PER_HOUR = exports.MINUTES_PER_HOUR = exports.MS_PER_MINUTE = exports.SECONDS_PER_MINUTE = exports.MS_PER_SECOND = exports.EMonth = exports.EWeekday = exports.EGeneralTimeZones = exports.DURATION_STRING_VALIDATION_RULE = void 0;
exports.DURATION_STRING_VALIDATION_RULE = '~=/^[0-9]+(ms|s|m|h|d|w)$/';
var EGeneralTimeZones;
(function (EGeneralTimeZones) {
    EGeneralTimeZones["BEIJING"] = "+0800";
    EGeneralTimeZones["GMT"] = "+0000";
    EGeneralTimeZones["PDT"] = "-0700";
    EGeneralTimeZones["PST"] = "-0800";
    EGeneralTimeZones["EDT"] = "-0400";
    EGeneralTimeZones["EST"] = "-0500";
})(EGeneralTimeZones = exports.EGeneralTimeZones || (exports.EGeneralTimeZones = {}));
var EWeekday;
(function (EWeekday) {
    EWeekday[EWeekday["SUNDAY"] = 0] = "SUNDAY";
    EWeekday[EWeekday["MONDAY"] = 1] = "MONDAY";
    EWeekday[EWeekday["TUESDAY"] = 2] = "TUESDAY";
    EWeekday[EWeekday["WEDNESDAY"] = 3] = "WEDNESDAY";
    EWeekday[EWeekday["THURSDAY"] = 4] = "THURSDAY";
    EWeekday[EWeekday["FRIDAY"] = 5] = "FRIDAY";
    EWeekday[EWeekday["SATURDAY"] = 6] = "SATURDAY";
})(EWeekday = exports.EWeekday || (exports.EWeekday = {}));
var EMonth;
(function (EMonth) {
    EMonth[EMonth["JANUARY"] = 0] = "JANUARY";
    EMonth[EMonth["FEBRUARY"] = 1] = "FEBRUARY";
    EMonth[EMonth["MARCH"] = 2] = "MARCH";
    EMonth[EMonth["APRIL"] = 3] = "APRIL";
    EMonth[EMonth["MAY"] = 4] = "MAY";
    EMonth[EMonth["JUNE"] = 5] = "JUNE";
    EMonth[EMonth["JULY"] = 6] = "JULY";
    EMonth[EMonth["AUGUST"] = 7] = "AUGUST";
    EMonth[EMonth["SEPTEMBER"] = 8] = "SEPTEMBER";
    EMonth[EMonth["OCTOBER"] = 9] = "OCTOBER";
    EMonth[EMonth["NOVEMBER"] = 10] = "NOVEMBER";
    EMonth[EMonth["DECEMBER"] = 11] = "DECEMBER";
})(EMonth = exports.EMonth || (exports.EMonth = {}));
exports.MS_PER_SECOND = 1000;
exports.SECONDS_PER_MINUTE = 60;
exports.MS_PER_MINUTE = exports.MS_PER_SECOND * exports.SECONDS_PER_MINUTE;
exports.MINUTES_PER_HOUR = 60;
exports.SECONDS_PER_HOUR = exports.SECONDS_PER_MINUTE * exports.MINUTES_PER_HOUR;
exports.MS_PER_HOUR = exports.MS_PER_SECOND * exports.SECONDS_PER_HOUR;
exports.HOURS_PER_DAY = 24;
exports.MINUTES_PER_DAY = exports.MINUTES_PER_HOUR * exports.HOURS_PER_DAY;
exports.SECONDS_PER_DAY = exports.SECONDS_PER_HOUR * exports.HOURS_PER_DAY;
exports.MS_PER_DAY = exports.MS_PER_SECOND * exports.SECONDS_PER_DAY;
exports.DAYS_PER_WEEK = 7;
exports.HOURS_PER_WEEK = exports.HOURS_PER_DAY * exports.DAYS_PER_WEEK;
exports.MINUTES_PER_WEEK = exports.MINUTES_PER_DAY * exports.DAYS_PER_WEEK;
exports.SECONDS_PER_WEEK = exports.SECONDS_PER_DAY * exports.DAYS_PER_WEEK;
exports.MS_PER_WEEK = exports.MS_PER_SECOND * exports.SECONDS_PER_WEEK;
exports.MONTH_PER_YEAR = 12;
function isLeapYear(year) {
    return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
}
exports.isLeapYear = isLeapYear;
function getDaysInMonth(year, month) {
    switch (month) {
        case EMonth.JANUARY:
        case EMonth.MARCH:
        case EMonth.MAY:
        case EMonth.JULY:
        case EMonth.AUGUST:
        case EMonth.OCTOBER:
        case EMonth.DECEMBER:
            return 31;
        case EMonth.APRIL:
        case EMonth.JUNE:
        case EMonth.SEPTEMBER:
        case EMonth.NOVEMBER:
            return 30;
        case EMonth.FEBRUARY:
            return isLeapYear(year) ? 29 : 28;
        default:
            throw new RangeError('Month must be 0 ~ 11.');
    }
}
exports.getDaysInMonth = getDaysInMonth;
function getDaysInYear(year) {
    return isLeapYear(year) ? 366 : 365;
}
exports.getDaysInYear = getDaysInYear;
function pad(n, length = 2) {
    return n.toString().padStart(length, '0');
}
function tzFromJS(tz) {
    const sign = tz <= 0 ? '+' : '-';
    tz = Math.abs(tz);
    const hour = pad(Math.floor(tz / 60));
    const minute = pad(Math.abs(tz) % 60);
    return `${sign}${hour}${minute}`;
}
exports.tzFromJS = tzFromJS;
function tzToJS(tz) {
    if (tz[0] === '+') {
        return -(parseInt(tz.slice(1, 3)) * 60 + parseInt(tz.slice(3, 5)));
    }
    return parseInt(tz.slice(1, 3)) * 60 + parseInt(tz.slice(3, 5));
}
exports.tzToJS = tzToJS;
exports.ENV_TIMEZONE = tzFromJS(new Date().getTimezoneOffset());
function parseLocalTime(ts = Date.now(), tz = exports.ENV_TIMEZONE) {
    const d = new Date(ts - tzToJS(tz) * exports.MS_PER_MINUTE);
    return {
        yr: d.getUTCFullYear(),
        mo: d.getUTCMonth(),
        day: d.getUTCDate(),
        hr: d.getUTCHours(),
        min: d.getUTCMinutes(),
        sec: d.getUTCSeconds(),
        ms: d.getUTCMilliseconds(),
        wd: d.getUTCDay(),
    };
}
exports.parseLocalTime = parseLocalTime;
function buildISODateString(dt, tz = exports.ENV_TIMEZONE) {
    return `${dt.yr}-${pad((dt.mo ?? EMonth.JANUARY) + 1)}-${pad(dt.day ?? 1)}T${pad(dt.hr ?? 0)}:${pad(dt.min ?? 0)}:${pad(dt.sec ?? 0)}.${pad(dt.ms ?? 0, 3)}${tz}`;
}
exports.buildISODateString = buildISODateString;
function buildDateTimeString(dt) {
    return `${dt.yr}-${pad((dt.mo ?? EMonth.JANUARY) + 1)}-${pad(dt.day ?? 1)} ${pad(dt.hr ?? 0)}:${pad(dt.min ?? 0)}:${pad(dt.sec ?? 0)}`;
}
exports.buildDateTimeString = buildDateTimeString;
function timeToISODateString(ts = Date.now(), tz = exports.ENV_TIMEZONE) {
    return buildISODateString(parseLocalTime(ts, tz), tz);
}
exports.timeToISODateString = timeToISODateString;
function timeToDateTimeString(ts = Date.now(), tz = exports.ENV_TIMEZONE) {
    return buildDateTimeString(parseLocalTime(ts, tz));
}
exports.timeToDateTimeString = timeToDateTimeString;
function getTimeRangeOfMonth(year, month, tz = exports.ENV_TIMEZONE) {
    return [
        new Date(buildISODateString({ yr: year, mo: month }, tz)).getTime(),
        new Date(buildISODateString({
            yr: month === EMonth.DECEMBER ? year + 1 : year,
            mo: month < EMonth.DECEMBER ? month + 1 : 0
        }, tz)).getTime() - 1,
    ];
}
exports.getTimeRangeOfMonth = getTimeRangeOfMonth;
function makeTime(dt, tz = exports.ENV_TIMEZONE) {
    return new Date(buildISODateString({
        mo: EMonth.JANUARY,
        day: 1,
        hr: 0,
        min: 0,
        sec: 0,
        ms: 0,
        ...dt
    }, tz)).getTime();
}
exports.makeTime = makeTime;
function makeTimeByString(dt, tz = exports.ENV_TIMEZONE) {
    const d = new Date(dt);
    return new Date(buildISODateString({
        yr: d.getFullYear(),
        mo: d.getMonth(),
        day: d.getDate(),
        hr: d.getHours(),
        min: d.getMinutes(),
        sec: d.getSeconds(),
        ms: d.getMilliseconds()
    }, tz)).getTime();
}
exports.makeTimeByString = makeTimeByString;
function convertByTimeZone(ts, localTZ, targetTZ) {
    const d = new Date(ts - (tzToJS(localTZ) - new Date().getTimezoneOffset()) * exports.MS_PER_MINUTE);
    return makeTime({
        yr: d.getFullYear(),
        mo: d.getMonth(),
        day: d.getDate(),
        hr: d.getHours(),
        min: d.getMinutes(),
        sec: d.getSeconds(),
        ms: d.getMilliseconds()
    }, targetTZ);
}
exports.convertByTimeZone = convertByTimeZone;
function alignToSecond(ts) {
    return ts - ts % exports.MS_PER_SECOND;
}
exports.alignToSecond = alignToSecond;
function alignToMinute(ts) {
    return ts - ts % exports.MS_PER_MINUTE;
}
exports.alignToMinute = alignToMinute;
function alignToHour(ts) {
    return ts - ts % exports.MS_PER_HOUR;
}
exports.alignToHour = alignToHour;
function alignToDay(ts, tz = exports.ENV_TIMEZONE) {
    const lt = parseLocalTime(ts, tz);
    return makeTime({
        yr: lt.yr,
        mo: lt.mo,
        day: lt.day
    }, tz);
}
exports.alignToDay = alignToDay;
function alignToWeek(ts, tz = exports.ENV_TIMEZONE, startAtMonday = false) {
    const lt = parseLocalTime(ts, tz);
    return makeTime({
        yr: lt.yr,
        mo: lt.mo,
        day: lt.day
    }, tz) - (lt.wd - (startAtMonday ? 1 : 0)) * exports.MS_PER_DAY;
}
exports.alignToWeek = alignToWeek;
function alignToMonth(ts, tz = exports.ENV_TIMEZONE) {
    const lt = parseLocalTime(ts, tz);
    return makeTime({
        yr: lt.yr,
        mo: lt.mo,
        day: 1
    }, tz);
}
exports.alignToMonth = alignToMonth;
function alignToYear(ts, tz = exports.ENV_TIMEZONE) {
    const lt = parseLocalTime(ts, tz);
    return makeTime({ yr: lt.yr }, tz);
}
exports.alignToYear = alignToYear;
function addRegularMonth(ts, moQty, tz = exports.ENV_TIMEZONE) {
    if (!Number.isSafeInteger(moQty)) {
        return ts;
    }
    const lt = parseLocalTime(ts, tz);
    const step = moQty / Math.abs(moQty);
    moQty = Math.abs(moQty);
    lt.yr += step * Math.floor(moQty / exports.MONTH_PER_YEAR);
    let mo = lt.mo;
    mo += step * (moQty % exports.MONTH_PER_YEAR);
    if (mo < EMonth.JANUARY) {
        lt.yr--;
        mo += exports.MONTH_PER_YEAR;
    }
    else if (mo > EMonth.DECEMBER) {
        lt.yr++;
        mo %= exports.MONTH_PER_YEAR;
    }
    lt.mo = mo;
    const maxDay = getDaysInMonth(lt.yr, lt.mo);
    if (maxDay < lt.day) {
        lt.day = maxDay;
    }
    return makeTime(lt, tz);
}
exports.addRegularMonth = addRegularMonth;
function findNthWeekdayInMonth(nth, weekday, dt, tz = exports.ENV_TIMEZONE) {
    if (nth === 0) {
        throw new RangeError('Invalid nth index number.');
    }
    if (nth < 0) {
        let t = makeTime({
            ...dt,
            day: getDaysInMonth(dt.yr, dt.mo),
        }, tz);
        const cwd = parseLocalTime(t, tz).wd;
        t -= exports.MS_PER_DAY * (weekday <= cwd ? cwd - weekday : (exports.DAYS_PER_WEEK - weekday + cwd));
        return t - (-1 - nth) * exports.MS_PER_WEEK;
    }
    else {
        let t = makeTime({
            ...dt,
            day: 1,
        }, tz);
        const cwd = parseLocalTime(t, tz).wd;
        t += exports.MS_PER_DAY * (weekday >= cwd ? weekday - cwd : (exports.DAYS_PER_WEEK - cwd + weekday));
        return t + (nth - 1) * exports.MS_PER_WEEK;
    }
}
exports.findNthWeekdayInMonth = findNthWeekdayInMonth;
function durationFromString(time) {
    const res = /^(\d+)(ms|s|m|h|d|w)$/.exec(time.toLowerCase());
    if (!res) {
        throw new RangeError(`Invalid duration string '${time}'.`);
    }
    switch (res[2]) {
        case 'ms': return parseInt(res[1], 10);
        case 's': return parseInt(res[1], 10) * exports.MS_PER_SECOND;
        case 'm': return parseInt(res[1], 10) * exports.MS_PER_MINUTE;
        case 'h': return parseInt(res[1], 10) * exports.MS_PER_HOUR;
        case 'd': return parseInt(res[1], 10) * exports.MS_PER_DAY;
        case 'w': return parseInt(res[1], 10) * exports.MS_PER_WEEK;
        default: throw new RangeError(`Invalid duration string '${time}'.`);
    }
}
exports.durationFromString = durationFromString;
const DURATION_UNITS = [
    { unit: 'w', length: exports.MS_PER_WEEK },
    { unit: 'd', length: exports.MS_PER_DAY },
    { unit: 'h', length: exports.MS_PER_HOUR },
    { unit: 'm', length: exports.MS_PER_MINUTE },
    { unit: 's', length: exports.MS_PER_SECOND },
    { unit: 'ms', length: 1 },
];
function durationToString(duration) {
    if (!Number.isSafeInteger(duration) || duration < 0) {
        throw new RangeError(`Invalid duration '${duration}'.`);
    }
    for (const u of DURATION_UNITS) {
        if (duration >= u.length && duration % u.length === 0) {
            return `${duration / u.length}${u.unit}`;
        }
    }
    return `${duration}ms`;
}
exports.durationToString = durationToString;
function getDayIndexOfYear(dt, tz = exports.ENV_TIMEZONE) {
    if (typeof dt === 'number') {
        return getDayIndexOfYear(parseLocalTime(dt, tz));
    }
    let nth = dt.day - 1;
    while (dt.mo--) {
        nth += getDaysInMonth(dt.yr, dt.mo);
    }
    return nth;
}
exports.getDayIndexOfYear = getDayIndexOfYear;
const getWeekIndexOfYear = (dt, tz, startAtMonday = false) => {
    if (typeof dt === 'number') {
        return (0, exports.getWeekIndexOfYear)(parseLocalTime(dt, tz ?? exports.ENV_TIMEZONE), startAtMonday);
    }
    startAtMonday = tz ?? startAtMonday;
    const wdOfJan1st = new Date(dt.yr, EMonth.JANUARY, 1).getDay();
    const dayOfFirstWeekday = ((wdOfJan1st === EWeekday.SUNDAY ? 1 : 8 - wdOfJan1st) + +startAtMonday - 1) % 7 + 1;
    return Math.floor((getDayIndexOfYear(dt) - dayOfFirstWeekday + 1) / 7);
};
exports.getWeekIndexOfYear = getWeekIndexOfYear;
//# sourceMappingURL=DateTime.js.map