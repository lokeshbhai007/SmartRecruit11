// app/components/LevelSelector.jsx - Updated
import Select from './ui/Select';

export default function LevelSelector({ value, onChange, disabled = false }) {
  const levels = [
    { value: 'basic', label: 'Basic' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  return (
    <Select
      label="Interview Level"
      id="interview-level"
      options={levels}
      value={value}
      onChange={onChange}
      required
      disabled={disabled}
    />
  );
}