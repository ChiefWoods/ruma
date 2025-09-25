'use client';

import { useState } from 'react';
import { DatePicker } from './DatePicker';
import { TimePicker } from './TimePicker';

function getTimedDate(date: Date, time: string): Date {
  const [hours, minutes, seconds] = time.split(':').map(Number);
  const timedDate = new Date(date);
  timedDate.setHours(hours, minutes, seconds, timedDate.getMilliseconds());
  return timedDate;
}

export function DateTimePicker({
  date = new Date(),
  onChange,
}: {
  date?: Date;
  onChange: (date: Date) => void;
}) {
  const [time, setTime] = useState<string>(
    date.toLocaleTimeString('en', { hour12: false })
  );

  return (
    <div className="flex gap-2">
      <DatePicker
        date={date}
        onChange={(date) => {
          const timedDate = getTimedDate(date, time);
          onChange(timedDate);
        }}
      />
      <TimePicker
        value={time}
        onChange={(time) => {
          setTime(time);
          const timedDate = getTimedDate(date, time);
          onChange(timedDate);
        }}
      />
    </div>
  );
}
