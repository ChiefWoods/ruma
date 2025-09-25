import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

// Generate time options in 30-minute intervals
function generateTimeOptions() {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const ampm = hour < 12 ? 'AM' : 'PM';
      const time12 = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
      options.push({ value: time24, label: time12 });
    }
  }
  return options;
}

const timeOptions = generateTimeOptions();

export function TimePicker({
  value = new Date().toLocaleTimeString('en', { hour12: false }),
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select
      // sets default value to next closest option within 30 minutes
      value={
        timeOptions.find((option) => option.value === value)
          ? value
          : timeOptions.find((option) => {
              const [valHour, valMinute] = value.split(':').map(Number);
              const [optHour, optMinute] = option.value.split(':').map(Number);
              return (
                optHour > valHour ||
                (optHour === valHour && optMinute >= valMinute)
              );
            })?.value || timeOptions[0].value
      }
      onValueChange={onChange}
    >
      <SelectTrigger className="cursor-pointer bg-background hover:bg-background/50 transition-colors w-[115px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-60">
        {timeOptions.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="cursor-pointer"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
