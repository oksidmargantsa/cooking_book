import { useId, useState, type InputHTMLAttributes } from 'react';
import { Icon } from './Icon';
import './ui.css';

interface Props extends InputHTMLAttributes<HTMLInputElement> { label: string; hint?: string; error?: string | null }
export function Field({ label, hint, error, type = 'text', disabled, ...rest }: Props) {
  const id = useId();
  const [shown, setShown] = useState(false);
  const isPwd = type === 'password';
  return (
    <div className={`field ${error ? 'field--error' : ''} ${disabled ? 'field--disabled' : ''}`}>
      <label className="field__label" htmlFor={id}>{label}</label>
      <div className="field__box">
        <input id={id} className="field__input" type={isPwd && shown ? 'text' : type} disabled={disabled}
          aria-invalid={!!error} aria-describedby={`${id}-d`} {...rest} />
        {isPwd && (
          <button type="button" className="field__eye" aria-label={shown ? 'Скрыть пароль' : 'Показать пароль'} onClick={() => setShown((s) => !s)}>
            <Icon name={shown ? 'eyeOff' : 'eye'} />
          </button>
        )}
      </div>
      <div id={`${id}-d`}>
        {error ? <p className="field__error"><Icon name="alert" size={14} />{error}</p> : hint ? <p className="field__hint">{hint}</p> : null}
      </div>
    </div>
  );
}
