import styles from "./Quantity.module.css";

export function Quantity({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className={styles.stepper}>
      <button type="button" aria-label="Decrease quantity" onClick={() => onChange(value - 1)}>
        -
      </button>
      <input
        aria-label="Quantity"
        value={value}
        onChange={(event) => onChange(Number(event.target.value) || 1)}
      />
      <button type="button" aria-label="Increase quantity" onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  );
}
