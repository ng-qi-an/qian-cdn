import { NotificationPriorities, NotificationType } from "./notificationTypes";


export const defaultNotificationPriorities: { [Type in NotificationType]: NotificationPriorities } = {
    "APIKEY_DELETED_USER": "high",
    "APPLICATION_REVIEWED_USER": "high",
    "APPLICATION_REVIEWED_ADMIN": "low",
    "APPLICATION_CREATED": "medium",
    "APPLICATION_REQUESTED": "medium",
    "APPLICATION_DELETED_USER": "high",
    "APPLICATION_DELETED_ADMIN": "low",
    "DATABASE_CREATED": "low",
    "DATABASE_DELETED_ADMIN": "medium",
    "DATABASE_DELETED_USER": "high",
    "USER_CREATED_USER": "high",
    "USER_CREATED_ADMIN": "low",
    "USER_PASSWORD_CHANGED_USER": "high",
    "USER_PASSWORD_CHANGED_ADMIN": "low",
    "USER_BANNED_USER": "high",
    "USER_BANNED_ADMIN": "medium",
    "USER_UNBANNED_USER": "high",
    "USER_UNBANNED_ADMIN": "medium",
    "USER_DELETED_USER": "high",
    "USER_DELETED_ADMIN": "medium",
}