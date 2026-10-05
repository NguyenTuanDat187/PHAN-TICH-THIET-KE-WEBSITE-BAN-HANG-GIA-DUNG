import {
  useEffect,
  useId,
  useRef,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react'
import { cn } from '../cn.ts'
import styles from './Checkbox.module.css'

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  ref?: Ref<HTMLInputElement>
  label?: ReactNode
  description?: ReactNode
  error?: string
  indeterminate?: boolean
}

function assignRef(ref: Ref<HTMLInputElement> | undefined, node: HTMLInputElement | null) {
  if (!ref) return
  if (typeof ref === 'function') {
    ref(node)
    return
  }
  ref.current = node
}

export function Checkbox({
  ref,
  id,
  label,
  description,
  error,
  indeterminate = false,
  className,
  disabled,
  required,
  checked,
  ...rest
}: CheckboxProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const inputRef = useRef<HTMLInputElement>(null)
  const descriptionId = description ? `${inputId}-description` : undefined
  const errorId = error ? `${inputId}-error` : undefined
  const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate && !inputRef.current.checked
    }
  }, [indeterminate, checked])

  return (
    <div className={cn(styles.field, error && styles.invalid, className)}>
      <label className={cn(styles.root, disabled && styles.disabled)} htmlFor={inputId}>
        <input
          {...rest}
          ref={(node) => {
            inputRef.current = node
            assignRef(ref, node)
          }}
          id={inputId}
          type="checkbox"
          className={styles.input}
          checked={checked}
          disabled={disabled}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
        <span className={styles.box} aria-hidden="true" />
        {(label || description) && (
          <span className={styles.copy}>
            {label && (
              <span className={styles.label}>
                {label}
                {required ? (
                  <span className={styles.required} aria-hidden="true">
                    {' '}
                    *
                  </span>
                ) : null}
              </span>
            )}
            {description ? (
              <span id={descriptionId} className={styles.description}>
                {description}
              </span>
            ) : null}
          </span>
        )}
      </label>
      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
