// app/components/DurationSelector.jsx - Updated
import Select from './ui/Select';

export default function DurationSelector({ value, onChange, disabled = false }) {
  const durations = [
    { value: '5', label: '5 minutes' },
    { value: '10', label: '10 minutes' },
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '60 minutes' }
  ];

  return (
    <Select
      label="Interview Duration"
      id="interview-duration"
      options={durations}
      value={value}
      onChange={onChange}
      required
      disabled={disabled}
    />
  );
}