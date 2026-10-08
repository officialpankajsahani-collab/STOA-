import { PukarShiftSchedule } from '../types/index.js';

/**
 * Loading Program Daily Shift Scheduler Algorithm
 * Routine STOA Loading Program operates in 2 daily shifts:
 * 1. Morning Shift (सुबह की पुकार): 10:00 AM
 * 2. Evening Shift (शाम की पुकार): 04:00 PM (16:00)
 *
 * When no program is active, calculates the exact next shift and countdown.
 */
export function calculateNextLoadingShift(dateInput?: Date): PukarShiftSchedule {
  const now = dateInput || new Date();

  // Convert to Indian Standard Time (IST, UTC +5:30)
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const istDate = new Date(utcMs + 330 * 60000);

  const hours = istDate.getHours();
  const minutes = istDate.getMinutes();
  const seconds = istDate.getSeconds();
  const totalSecondsToday = hours * 3600 + minutes * 60 + seconds;

  const morningStartSec = 10 * 3600; // 10:00 AM = 36000 sec
  const eveningStartSec = 16 * 3600; // 04:00 PM = 57600 sec

  const nextShiftTargetIst = new Date(istDate);
  let nextShiftLabelHi = '';
  let nextShiftLabelEn = '';
  let nextShiftLabelOr = '';
  let currentShift: 'MORNING' | 'EVENING' | 'OFF_HOURS' = 'OFF_HOURS';
  let isShiftActiveWindow = false;

  // Case 1: Early morning before 10:00 AM
  if (totalSecondsToday < morningStartSec) {
    nextShiftTargetIst.setHours(10, 0, 0, 0);
    nextShiftLabelHi = 'आज सुबह 10:00 AM';
    nextShiftLabelEn = 'Today Morning 10:00 AM';
    nextShiftLabelOr = 'ଆଜି ସକାଳ ୧୦:୦୦ AM';
    currentShift = 'OFF_HOURS';
  }
  // Case 2: Morning Shift Window (10:00 AM to 01:00 PM)
  else if (totalSecondsToday >= morningStartSec && totalSecondsToday < morningStartSec + 3 * 3600) {
    isShiftActiveWindow = true;
    currentShift = 'MORNING';
    // Next shift is Evening 4:00 PM
    nextShiftTargetIst.setHours(16, 0, 0, 0);
    nextShiftLabelHi = 'आज शाम 04:00 PM';
    nextShiftLabelEn = 'Today Evening 04:00 PM';
    nextShiftLabelOr = 'ଆଜି ସନ୍ଧ୍ୟା ୦୪:୦୦ PM';
  }
  // Case 3: Between 01:00 PM and 04:00 PM
  else if (totalSecondsToday < eveningStartSec) {
    nextShiftTargetIst.setHours(16, 0, 0, 0);
    nextShiftLabelHi = 'आज शाम 04:00 PM';
    nextShiftLabelEn = 'Today Evening 04:00 PM';
    nextShiftLabelOr = 'ଆଜି ସନ୍ଧ୍ୟା ୦୪:୦୦ PM';
    currentShift = 'OFF_HOURS';
  }
  // Case 4: Evening Shift Window (04:00 PM to 07:00 PM)
  else if (totalSecondsToday >= eveningStartSec && totalSecondsToday < eveningStartSec + 3 * 3600) {
    isShiftActiveWindow = true;
    currentShift = 'EVENING';
    // Next shift is Tomorrow Morning 10:00 AM
    nextShiftTargetIst.setDate(nextShiftTargetIst.getDate() + 1);
    nextShiftTargetIst.setHours(10, 0, 0, 0);
    nextShiftLabelHi = 'कल सुबह 10:00 AM';
    nextShiftLabelEn = 'Tomorrow Morning 10:00 AM';
    nextShiftLabelOr = 'ଆସନ୍ତାକାଲି ସକାଳ ୧୦:୦୦ AM';
  }
  // Case 5: Night after 07:00 PM
  else {
    nextShiftTargetIst.setDate(nextShiftTargetIst.getDate() + 1);
    nextShiftTargetIst.setHours(10, 0, 0, 0);
    nextShiftLabelHi = 'कल सुबह 10:00 AM';
    nextShiftLabelEn = 'Tomorrow Morning 10:00 AM';
    nextShiftLabelOr = 'ଆସନ୍ତାକାଲି ସକାଳ ୧୦:୦୦ AM';
    currentShift = 'OFF_HOURS';
  }

  // Calculate remaining seconds
  const diffMs = nextShiftTargetIst.getTime() - istDate.getTime();
  const timeRemainingSeconds = Math.max(0, Math.floor(diffMs / 1000));

  // Convert back to ISO string in standard UTC
  const targetUtcMs = nextShiftTargetIst.getTime() - 330 * 60000;
  const nextShiftTime = new Date(targetUtcMs).toISOString();

  return {
    currentShift,
    nextShiftTime,
    nextShiftLabelHi,
    nextShiftLabelEn,
    nextShiftLabelOr,
    isShiftActiveWindow,
    timeRemainingSeconds,
    morningTimeDisplay: '10:00 AM (सुबह)',
    eveningTimeDisplay: '04:00 PM (शाम)',
    autoScheduleMode: true,
  };
}

/**
 * Format seconds into HH:MM:SS or human string
 */
export function formatCountdown(totalSec: number): {
  hours: string;
  minutes: string;
  seconds: string;
  formatted: string;
} {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  const hours = String(h).padStart(2, '0');
  const minutes = String(m).padStart(2, '0');
  const seconds = String(s).padStart(2, '0');

  return {
    hours,
    minutes,
    seconds,
    formatted: `${hours}h : ${minutes}m : ${seconds}s`,
  };
}
