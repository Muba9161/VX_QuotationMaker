export const SUCCESS_NOTIFICATION_EVENT = "vorldx:success-notification";

export function notifySuccess(message: string): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(SUCCESS_NOTIFICATION_EVENT, {
      detail: { message },
    })
  );
}
