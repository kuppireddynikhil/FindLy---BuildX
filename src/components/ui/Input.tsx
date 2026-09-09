import { type InputHTMLAttributes, type ReactNode, forwardRef } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={`input-group ${error ? 'input-group--error' : ''} ${className}`}>
        <label htmlFor={inputId} className="input-group__label">
          {label}
        </label>
        <div className="input-group__wrapper">
          {icon && <span className="input-group__icon">{icon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={`input-group__input ${icon ? 'input-group__input--with-icon' : ''}`}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
        </div>
        {error && (
          <span id={`${inputId}-error`} className="input-group__error" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/* Select variant */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  icon?: ReactNode;
  options: { value: string; label: string }[];
}

export function Select({ label, error, icon, options, className = '', id, ...props }: SelectProps) {
  const selectId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`input-group ${error ? 'input-group--error' : ''} ${className}`}>
      <label htmlFor={selectId} className="input-group__label">
        {label}
      </label>
      <div className="input-group__wrapper">
        {icon && <span className="input-group__icon">{icon}</span>}
        <select
          id={selectId}
          className={`input-group__input input-group__select ${icon ? 'input-group__input--with-icon' : ''}`}
          aria-invalid={error ? 'true' : undefined}
          {...props}
        >
          <option value="">Select {label.toLowerCase()}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <span id={`${selectId}-error`} className="input-group__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

/* Textarea variant */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function Textarea({ label, error, className = '', id, ...props }: TextareaProps) {
  const textareaId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`input-group ${error ? 'input-group--error' : ''} ${className}`}>
      <label htmlFor={textareaId} className="input-group__label">
        {label}
      </label>
      <textarea
        id={textareaId}
        className="input-group__input input-group__textarea"
        aria-invalid={error ? 'true' : undefined}
        {...props}
      />
      {error && (
        <span id={`${textareaId}-error`} className="input-group__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
