interface InputFieldProps {
  label: string;
  value: string | number;
  type?: string;
  disabled?: boolean;
  className?: string;
  onChange?: (val: any) => void;
}

export const InputField: React.FC<InputFieldProps> = ({ label, value, type = "text", disabled, className, onChange }) => (
  <div className={className}>
    <label className="block text-yellow-200 text-sm mb-1">{label}</label>
    <input
      type={type}
      value={value}
      disabled={disabled}
      className="w-full px-3 py-2 rounded-lg bg-black/30 border border-yellow-400/40 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
      onChange={(e) => onChange?.(e.target.value)}
    />
  </div>
);

export const TextareaField: React.FC<InputFieldProps> = ({ label, value, className, onChange }) => (
  <div className={className}>
    <label className="block text-yellow-200 text-sm mb-1">{label}</label>
    <textarea
      value={value}
      className="w-full px-3 py-2 rounded-lg bg-black/30 border border-yellow-400/40 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
      onChange={(e) => onChange?.(e.target.value)}
      rows={4}
    />
  </div>
);
