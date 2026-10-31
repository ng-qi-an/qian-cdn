import { ReactNode } from "react"
import ApplicationCreated from "./email/templates/ApplicationCreated"

export type NotificationConfigurationType = {
    title: string,
    description: string,
    link?: string,
    emailTemplate?: ReactNode
}

export type DefaultNotificationParameters = {
    triggerUser: {
        id: string,
        name: string,
    },
    link?: string,
}

export const NotificationTypes = {
    "APPLICATION_CREATED": (props: {appName: string, databaseName: string} & DefaultNotificationParameters): NotificationConfigurationType => ({
        title: `Application created`,
        description: `${props.triggerUser.name} created a new application with the name ${props.appName} on database ${props.databaseName}.`,
        link: props.link,
        emailTemplate: <ApplicationCreated {...props}/>
    }),
    "APPLICATION_REQUESTED": (props: {appName: string, databaseName: string} & DefaultNotificationParameters): NotificationConfigurationType => ({
        title: `Application requested`,
        description: `${props.triggerUser.name} requested a new application with the name ${props.appName} on database ${props.databaseName}.`,
        link: props.link
    }),
    "APPLICATION_REVIEWED_USER": (props: {appName: string, approved: boolean} & DefaultNotificationParameters): NotificationConfigurationType => ({
        title: `Application ${props.approved ? "approved" : "denied"}`,
        link: props.link,
        description: `${props.triggerUser.name} ${props.approved ? "approved" : "denied"} your application ${props.appName}.`,
    }),
    "APPLICATION_REVIEWED_ADMIN": (props: {appName: string, databaseName: string, appOwnerName: string, approved: boolean} & DefaultNotificationParameters): NotificationConfigurationType => ({
        title: `Application ${props.approved ? "approved" : "denied"}`,
        link: props.link,
        description: `${props.triggerUser.name} ${props.approved ? "approved" : "denied"} an application "${props.appName}" by ${props.appOwnerName} on database ${props.databaseName}.`,
    }),
    "APIKEY_DELETED_USER": (props: {apiKeyName: string, appName: string} & DefaultNotificationParameters): NotificationConfigurationType => ({
        title: `API key deleted`,
        description: `${props.triggerUser.name} deleted an API key with the name ${props.apiKeyName} on your app ${props.appName}.`,
        link: props.link,
        emailTemplate: <></>
    }),
    "APPLICATION_DELETED_USER": (props: {appName: string} & DefaultNotificationParameters): NotificationConfigurationType => ({
        title: `Application deleted`,
        description: `${props.triggerUser.name} deleted your application ${props.appName}.`,
        link: props.link,
    }),
    "APPLICATION_DELETED": (props: {appName: string} & DefaultNotificationParameters): NotificationConfigurationType => ({
        title: `Application deleted`,
        description: `${props.triggerUser.name} deleted the application ${props.appName}.`,
        link: props.link,
    }),
    "DATABASE_CREATED": (props: {databaseName: string} & DefaultNotificationParameters): NotificationConfigurationType => ({
        title: `Database created`,
        description: `${props.triggerUser.name} created a new database with the name ${props.databaseName}.`,
        link: props.link,
    }),
    "DATABASE_DELETED": (props: {databaseName: string} & DefaultNotificationParameters): NotificationConfigurationType => ({
        title: `Database deleted`,
        description: `${props.triggerUser.name} deleted the database with the name ${props.databaseName}.`,
        link: props.link,
    }),
    "DATABASE_DELETED_USER": (props: {databaseName: string} & DefaultNotificationParameters): NotificationConfigurationType => ({
        title: `Database deleted`,
        description: `${props.triggerUser.name} deleted your database with the name ${props.databaseName}.`,
        link: props.link,
    }),
    "USER_CREATED_USER": (props: DefaultNotificationParameters): NotificationConfigurationType => ({
        title: `User created`,
        description: `${props.triggerUser.name} created your user account.`,
        link: props.link,
    }),
    "USER_CREATED_ADMIN": (props: {newUser: {name: string, role: string}} & DefaultNotificationParameters): NotificationConfigurationType => ({
        title: `User created`,
        description: `${props.triggerUser.name} created a new user "${props.newUser.name} with the role ${props.newUser.role}`,
        link: props.link,
    }),
    "USER_PASSWORD_CHANGED_USER": (props: DefaultNotificationParameters): NotificationConfigurationType => ({
        title: `Password changed`,
        link: props.link,
        description: `${props.triggerUser.name} changed your password. Contact them for your new credentials.`,
    }),
    "USER_PASSWORD_CHANGED_ADMIN": (props: {user: {name: string}} & DefaultNotificationParameters): NotificationConfigurationType => ({
        title: `User password changed`,
        link: props.link,
        description: `${props.triggerUser.name} changed the password for user ${props.user.name}.`,
    }),
    "USER_BANNED_USER": (props: {reason: string, expiresAt: Date} & DefaultNotificationParameters): NotificationConfigurationType => ({
        title: `User banned`,
        description: `${props.triggerUser.name} banned your account. Reason: ${props.reason}. Your ban will expire on ${props.expiresAt.toLocaleString(undefined, {dateStyle: "long", timeStyle: "short"})}.`,
        link: props.link,
    }),
    "USER_BANNED_ADMIN": (props: {user: {name: string}, reason: string, expiresAt: Date} & DefaultNotificationParameters): NotificationConfigurationType => ({
        title: `User banned`,
        description: `${props.triggerUser.name} banned user ${props.user.name}. Reason: ${props.reason}. Their ban will expire on ${props.expiresAt.toLocaleString(undefined, {dateStyle: "long", timeStyle: "short"})}.`,
        link: props.link,
    }),
    "USER_UNBANNED_USER": (props: DefaultNotificationParameters): NotificationConfigurationType => ({
        title: `User unbanned`,
        description: `${props.triggerUser.name} unbanned your account.`,
        link: props.link,
    }),
    "USER_UNBANNED_ADMIN": (props: {user: {name: string}} & DefaultNotificationParameters): NotificationConfigurationType => ({
        title: `User unbanned`,
        description: `${props.triggerUser.name} unbanned user ${props.user.name}.`,
        link: props.link,
    }),
    "USER_DELETED_ADMIN": (props: {user: {name: string}} & DefaultNotificationParameters): NotificationConfigurationType => ({
        title: `User deleted`,
        description: `${props.triggerUser.name} deleted user ${props.user.name}.`,
        link: props.link,
    }),
    "USER_DELETED_USER": (props: DefaultNotificationParameters): NotificationConfigurationType => ({
        title: `User deleted`,
        description: `${props.triggerUser.name} deleted your account. If this was a mistake, contact your administrator immediately.`,
        link: props.link,
    }),
}

export const NotificationTypeList = Object.keys(NotificationTypes) as (keyof typeof NotificationTypes)[]
export type NotificationType = keyof typeof NotificationTypes

export type NotificationPriorities = "high" | "medium" | "low"
