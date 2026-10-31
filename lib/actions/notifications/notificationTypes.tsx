import { ReactNode } from "react"

export type NotificationConfigurationType =  {
    title: string,
    description: string,
    link?: string,
    emailTemplate?: ReactNode
}

export type TriggerUser = {
    id: string,
    name: string,
}

export const NotificationTypes = {
    "APPLICATION_CREATED": ({link, appName, databaseName, triggerUser}: {link: string, appName: string, databaseName: string, triggerUser: TriggerUser}): NotificationConfigurationType => ({
        title: `Application created`,
        description: `${triggerUser.name} created a new application with the name ${appName} on database ${databaseName}.`,
        link,
        emailTemplate: <><p>app madee</p></>
    }),
    "APPLICATION_REQUESTED": ({link, appName, databaseName, triggerUser}: {link: string, appName: string, databaseName: string, triggerUser: TriggerUser}): NotificationConfigurationType => ({
        title: `Application requested`,
        description: `${triggerUser.name} requested a new application with the name ${appName} on database ${databaseName}.`,
        link
    }),
    "APPLICATION_REVIEWED_USER": ({link, appName, triggerUser, approved}: {link: string, appName: string, triggerUser: TriggerUser, approved: boolean}): NotificationConfigurationType => ({
        title: `Application ${approved ? "approved" : "denied"}`,
        link,
        description: `${triggerUser.name} ${approved ? "approved" : "denied"} your application ${appName}.`,
    }),
    "APPLICATION_REVIEWED_ADMIN": ({link, appName, databaseName, triggerUser, appOwnerName, approved}: {link: string, appName: string, databaseName: string, triggerUser: TriggerUser, appOwnerName: string, approved: boolean}): NotificationConfigurationType => ({
        title: `Application ${approved ? "approved" : "denied"}`,
        link,
        description: `${triggerUser.name} ${approved ? "approved" : "denied"} an application "${appName}" by ${appOwnerName} on database ${databaseName}.`,
    }),
    "APIKEY_DELETED_USER": ({link, apiKeyName, appName, triggerUser}: {link: string, apiKeyName: string, appName: string, triggerUser: TriggerUser}): NotificationConfigurationType => ({
        title: `API key deleted`,
        description: `${triggerUser.name} deleted an API key with the name ${apiKeyName} on your app ${appName}.`,
        link,
        emailTemplate: <></>
    }),
    "APPLICATION_DELETED_USER": ({link, appName, triggerUser}: {link: string, appName: string, triggerUser: TriggerUser}): NotificationConfigurationType => ({
        title: `Application deleted`,
        description: `${triggerUser.name} deleted your application ${appName}.`,
        link,
    }),
    "APPLICATION_DELETED": ({link, appName, triggerUser}: {link: string, appName: string, triggerUser: TriggerUser}): NotificationConfigurationType => ({
        title: `Application deleted`,
        description: `${triggerUser.name} deleted the application ${appName}.`,
        link,
    }),
    "DATABASE_CREATED": ({link, databaseName, triggerUser}: {link: string, databaseName: string, triggerUser: TriggerUser}): NotificationConfigurationType => ({
        title: `Database created`,
        description: `${triggerUser.name} created a new database with the name ${databaseName}.`,
        link,
    }),
    "DATABASE_DELETED": ({link, databaseName, triggerUser}: {link: string, databaseName: string, triggerUser: TriggerUser}): NotificationConfigurationType => ({
        title: `Database deleted`,
        description: `${triggerUser.name} deleted the database with the name ${databaseName}.`,
        link,
    }),
    "DATABASE_DELETED_USER": ({link, databaseName, triggerUser}: {link: string, databaseName: string, triggerUser: TriggerUser}): NotificationConfigurationType => ({
        title: `Database deleted`,
        description: `${triggerUser.name} deleted your database with the name ${databaseName}.`,
        link,
    }),
    "USER_CREATED_USER": ({link, triggerUser}: {link: string, triggerUser: TriggerUser}): NotificationConfigurationType => ({
        title: `User created`,
        description: `${triggerUser.name} created your user account.`,
        link,
    }),
    "USER_CREATED_ADMIN": ({link, triggerUser, newUser}: {link: string, triggerUser: TriggerUser, newUser: {name: string, role: string}}): NotificationConfigurationType => ({
        title: `User created`,
        description: `${triggerUser.name} created a new user "${newUser.name} with the role ${newUser.role}`,
        link,
    }),
    "USER_PASSWORD_CHANGED_USER": ({link, triggerUser}: {link: string, triggerUser: TriggerUser}): NotificationConfigurationType => ({
        title: `Password changed`,
        link,
        description: `${triggerUser.name} changed your password. Contact them for your new credentials.`,
    }),
    "USER_PASSWORD_CHANGED_ADMIN": ({link, triggerUser, user}: {link: string, triggerUser: TriggerUser, user: {name: string}}): NotificationConfigurationType => ({
        title: `User password changed`,
        link,
        description: `${triggerUser.name} changed the password for user ${user.name}.`,
    }),
    "USER_BANNED_USER": ({link, triggerUser, reason, expiresAt}: {link: string, triggerUser: TriggerUser, reason: string, expiresAt: Date}): NotificationConfigurationType => ({
        title: `User banned`,
        description: `${triggerUser.name} banned your account. Reason: ${reason}. Your ban will expire on ${expiresAt.toLocaleString(undefined, {dateStyle: "long", timeStyle: "short"})}.`,
        link,
    }),
    "USER_BANNED_ADMIN": ({link, triggerUser, user, reason, expiresAt}: {link: string, triggerUser: TriggerUser, user: {name: string}, reason: string, expiresAt: Date}): NotificationConfigurationType => ({
        title: `User banned`,
        description: `${triggerUser.name} banned user ${user.name}. Reason: ${reason}. Their ban will expire on ${expiresAt.toLocaleString(undefined, {dateStyle: "long", timeStyle: "short"})}.`,
        link,
    }),
    "USER_UNBANNED_USER": ({link, triggerUser}: {link: string, triggerUser: TriggerUser}): NotificationConfigurationType => ({
        title: `User unbanned`,
        description: `${triggerUser.name} unbanned your account.`,
        link,
    }),
    "USER_UNBANNED_ADMIN": ({link, triggerUser, user}: {link: string, triggerUser: TriggerUser, user: {name: string}}): NotificationConfigurationType => ({
        title: `User unbanned`,
        description: `${triggerUser.name} unbanned user ${user.name}.`,
        link,
    }),
    "USER_DELETED_ADMIN": ({link, triggerUser, user}: {link: string, triggerUser: TriggerUser, user: {name: string}}): NotificationConfigurationType => ({
        title: `User deleted`,
        description: `${triggerUser.name} deleted user ${user.name}.`,
        link,
    }),
    "USER_DELETED_USER": ({link, triggerUser}: {link: string, triggerUser: TriggerUser}): NotificationConfigurationType => ({
        title: `User deleted`,
        description: `${triggerUser.name} deleted your account. If this was a mistake, contact your administrator immediately.`,
        link,
    }),
}

export const NotificationTypeList = Object.keys(NotificationTypes) as (keyof typeof NotificationTypes)[]
export type NotificationType = keyof typeof NotificationTypes

export type NotificationPriorities = "high" | "medium" | "low"
