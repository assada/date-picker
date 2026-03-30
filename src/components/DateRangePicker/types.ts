export interface DateRange {
  start: Date;
  end: Date;
}

export interface DateRangePreset {
  label: string;
  days?: number;
  from?: Date;
  to?: Date;
}

export interface DateRangePickerProps {
  value?: DateRange;
  onChange: (range: DateRange) => void;
  minDate?: Date;
  maxDate?: Date;
  presets?: DateRangePreset[];
  monthsToShow?: number;
  locale?: string;
  className?: string;
  style?: React.CSSProperties;
}
