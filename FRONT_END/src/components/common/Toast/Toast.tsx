import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons/faCircleCheck";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons/faCircleXmark";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons/faTriangleExclamation";
import { faXmark } from "@fortawesome/free-solid-svg-icons/faXmark";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { resolveValue, useToaster } from "react-hot-toast";
import { cn } from "../cn.ts";
import styles from "./Toast.module.css";

export type ToastVariant = "success" | "warning" | "error";

const icons: Record<ToastVariant, IconDefinition> = {
  success: faCircleCheck,
  warning: faTriangleExclamation,
  error: faCircleXmark,
};

type ToastViewProps = {
  visible: boolean;
  variant: ToastVariant;
  message: string;
  onDismiss: () => void;
};

export function ToastView({ visible, variant, message, onDismiss }: ToastViewProps) {
  return (
    <div className={cn(styles.toast, styles[variant], visible && styles.visible)}>
      <FontAwesomeIcon icon={icons[variant]} className={styles.icon} />
      <p className={styles.message}>{message}</p>
      <button type="button" className={styles.close} onClick={onDismiss} aria-label="Đóng thông báo">
        <FontAwesomeIcon icon={faXmark} />
      </button>
    </div>
  );
}

/** Gắn một lần ở gốc ứng dụng để toast có chỗ hiển thị. */
export function ToastProvider() {
  const { toasts, handlers } = useToaster();

  return (
    <div
      className={styles.viewport}
      onMouseEnter={handlers.startPause}
      onMouseLeave={handlers.endPause}
    >
      {toasts.map((item) => (
        <div key={item.id}>{resolveValue(item.message, item)}</div>
      ))}
    </div>
  );
}
