const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");
const TIME_ZONE = "America/Havana";

function getTimeZoneParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const values = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
  );

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

function getTimeZoneOffsetMinutes(date, timeZone) {
  const parts = getTimeZoneParts(date, timeZone);
  const utcTime = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  return (utcTime - date.getTime()) / 60000;
}

function localTimeToUtc(year, monthIndex, day, hour, minute, second, timeZone) {
  let utcGuess = Date.UTC(year, monthIndex, day, hour, minute, second);
  for (let i = 0; i < 2; i += 1) {
    const offsetMinutes = getTimeZoneOffsetMinutes(new Date(utcGuess), timeZone);
    utcGuess = Date.UTC(year, monthIndex, day, hour, minute, second) - offsetMinutes * 60000;
  }
  return new Date(utcGuess);
}

function getNextBirthday(now) {
  const cubaNow = getTimeZoneParts(now, TIME_ZONE);
  const thisYearBirthday = localTimeToUtc(cubaNow.year, 4, 1, 0, 0, 0, TIME_ZONE);
  if (now.getTime() <= thisYearBirthday.getTime()) {
    return thisYearBirthday;
  }
  return localTimeToUtc(cubaNow.year + 1, 4, 1, 0, 0, 0, TIME_ZONE);
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function updateCountdown() {
  const now = new Date();
  const target = getNextBirthday(now);
  const diff = target - now;

  if (diff <= 0) {
    daysEl.textContent = "0";
    hoursEl.textContent = "00";
    minutesEl.textContent = "00";
    secondsEl.textContent = "00";
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  daysEl.textContent = String(days);
  hoursEl.textContent = pad(hours);
  minutesEl.textContent = pad(minutes);
  secondsEl.textContent = pad(seconds);
}

updateCountdown();
setInterval(updateCountdown, 1000);