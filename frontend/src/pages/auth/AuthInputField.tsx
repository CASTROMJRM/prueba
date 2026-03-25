import type { ChangeEventHandler, InputHTMLAttributes } from "react";
import type { IconType } from "react-icons";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface AuthInputFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  id: string;
  label: string;
  icon: IconType;
  onChange: ChangeEventHandler<HTMLInputElement>;
  isPasswordToggle?: boolean;
  revealed?: boolean;
  onToggleReveal?: () => void;
}

export default function AuthInputField({
  id,
  label,
  icon: Icon,
  onChange,
  isPasswordToggle = false,
  revealed = false,
  onToggleReveal,
  type = "text",
  ...inputProps
}: AuthInputFieldProps) {
  const resolvedType =
    isPasswordToggle && revealed ? "text" : type;

  return (
    <div className="auth-input-group">
      <label className="auth-label" htmlFor={id}>
        {label}
      </label>
      <div className="auth-input-wrap">
        <span className="auth-input-icon" aria-hidden="true">
          <Icon className="auth-icon" />
        </span>
        <input
          id={id}
          type={resolvedType}
          className="auth-input"
          onChange={onChange}
          {...inputProps}
        />
        {isPasswordToggle && onToggleReveal && (
          <button
            type="button"
            className="auth-eye-btn"
            onClick={onToggleReveal}
            aria-label={revealed ? "Ocultar contrasena" : "Mostrar contrasena"}
          >
            {revealed ? (
              <FaEyeSlash className="auth-icon" />
            ) : (
              <FaEye className="auth-icon" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
