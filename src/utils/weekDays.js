export const WEEK_ORDER_EN = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export const DAY_AR = {
  Sat: 'السبت',
  Sun: 'الأحد',
  Mon: 'الاثنين',
  Tue: 'الثلاثاء',
  Wed: 'الأربعاء',
  Thu: 'الخميس',
  Fri: 'الجمعة',
};

const DAY_INDEX = {
  sat: 0, saturday: 0, السبت: 0, سبت: 0,
  sun: 1, sunday: 1, الأحد: 1, الاحد: 1, أحد: 1,
  mon: 2, monday: 2, الاثنين: 2, الإثنين: 2, اثنين: 2, إثنين: 2,
  tue: 3, tuesday: 3, الثلاثاء: 3, ثلاثاء: 3,
  wed: 4, wednesday: 4, الأربعاء: 4, الاربعاء: 4, أربعاء: 4,
  thu: 5, thursday: 5, الخميس: 5, خميس: 5,
  fri: 6, friday: 6, الجمعة: 6, جمعة: 6,
};

const dayIndex = (label) => {
  const key = String(label ?? '').trim().toLowerCase();
  if (DAY_INDEX[key] !== undefined) return DAY_INDEX[key];
  const short = key.slice(0, 3);
  return DAY_INDEX[short] ?? -1;
};

export const orderWeekSatToFri = (items, getLabel) => {
  const slots = Array(7).fill(null);
  items.forEach((item) => {
    const i = dayIndex(getLabel(item));
    if (i >= 0 && !slots[i]) slots[i] = item;
  });
  const ordered = slots.filter(Boolean);
  return ordered.length ? ordered : items;
};
