import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { useToast, type ToastButtonAction } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

const renderActions = (
  id: string,
  actions: ToastButtonAction[] | undefined,
  actionElement: ReactNode,
  onDismiss: (toastId?: string) => void
) => {
  const hasButtons = Array.isArray(actions) && actions.length > 0
  if (!hasButtons && !actionElement) {
    return null
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2">
      {hasButtons &&
        actions!.map((toastAction, index) => (
          <Button
            key={`${id}-toast-action-${index}`}
            size="sm"
            variant={toastAction.variant ?? "outline"}
            onClick={() => {
              toastAction.onPress?.()
              if (toastAction.dismissOnPress !== false) {
                onDismiss(id)
              }
            }}
            aria-label={
              typeof toastAction.label === "string"
                ? toastAction.label
                : undefined
            }
          >
            {toastAction.label}
          </Button>
        ))}
      {actionElement}
    </div>
  )
}

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({
        id,
        title,
        description,
        action,
        actions,
        type: _type,
        ...props
      }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {renderActions(id, actions, action, dismiss)}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
