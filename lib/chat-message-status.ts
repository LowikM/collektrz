import type { ChatMessage } from "@/lib/conversations";

export type OwnMessageDeliveryStatus = "sending" | "sent" | "read";

export function getOwnMessageDeliveryStatus(
  message: ChatMessage,
): Exclude<OwnMessageDeliveryStatus, "sending"> {
  return message.read_at ? "read" : "sent";
}

export function getOwnMessageStatusLabel(
  status: OwnMessageDeliveryStatus,
) {
  switch (status) {
    case "sending":
      return "Sending";
    case "read":
      return "Read";
    case "sent":
      return "Sent";
  }
}

export function getOwnMessageStatusAriaLabel(status: OwnMessageDeliveryStatus) {
  switch (status) {
    case "sending":
      return "Message sending";
    case "read":
      return "Message read";
    case "sent":
      return "Message sent";
  }
}
