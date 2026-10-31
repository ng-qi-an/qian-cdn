import { User } from "@/lib/schema/schemaTypes";
import { NotificationPriorities, NotificationType, NotificationTypes } from "./notificationTypes";
import { notifications } from "@/lib/schema/schema";
import { generateId } from "better-auth";
import { db } from "@/lib/db";
import sendEmail from "./email/sendEmail";
import { runAfterResponse } from "@/lib/runAfterResponse";
import { user as userSchema } from "@/lib/schema/auth-schema";
import { eq, isNotNull, not, or } from "drizzle-orm";
import { defaultNotificationPriorities } from "./defaultNotficationProrities";
export type SendNotificationArgs<T extends NotificationType = NotificationType> = {
    specificUsers?: Pick<User, "id" | "name" | "email" | "notif_preferences">[],
    userGroup?: "all" | "admins" | "non-admins" | "superAdmins",
    excludeTriggerUser?: boolean,
} & Parameters<typeof NotificationTypes[T]>[0]

export default async function sendNotification<T extends NotificationType>(type: T, { specificUsers=[], userGroup, excludeTriggerUser=true, ...props }: SendNotificationArgs<T>) {
    // Runs after the response is sent so notif sending wont block whatever calls this function
    if (!userGroup && specificUsers.length === 0) {
        throw new Error("Either userGroup or specificUsers must be provided.");
    }
    runAfterResponse(async () => {
        const config = NotificationTypes[type](props as never);
        const usersInGroup = userGroup === undefined ? [] : await db.select({id: userSchema.id, name: userSchema.name, email: userSchema.email, notif_preferences: userSchema.notif_preferences}).from(userSchema).where(
            userGroup === "all" ? 
                isNotNull(userSchema.id)
            : userGroup === "admins" ? 
                or(eq(userSchema.role, "admin"), eq(userSchema.role, "superAdmin"))!
            : userGroup === "non-admins" ? not(or(eq(userSchema.role, "admin"), eq(userSchema.role, "superAdmin"))!)
            : userGroup === "superAdmins" ? eq(userSchema.role, "superAdmin")
            : isNotNull(userSchema.id)
        );
        const users = [...specificUsers, ...usersInGroup].filter((user) => excludeTriggerUser ? user.id !== props.triggerUser.id : true);
        const payload: typeof notifications.$inferInsert[] = users.map((user)=> ({
            id: generateId(),
            type: type,
            userId: user.id,
            title: config.title,
            message: config.description,
            link: config.link,
        }))
        await db.insert(notifications).values(payload);
        type NotifPreferences = {
            [key: string]:  {
                enabled: boolean,
                priority: NotificationPriorities[],
            }
        } | undefined
        const notificationPriority = defaultNotificationPriorities[type]

        const usersWithEmailEnabled = users.filter((user)=> (user.notif_preferences as NotifPreferences)?.email?.enabled == true && (user.notif_preferences as NotifPreferences)?.email?.priority?.includes(notificationPriority));
        // Send emails in bulk first
        try {
            if (config.emailTemplate){
                await sendEmail({
                    destinationEmails: usersWithEmailEnabled.map((user)=> user.email),
                    subject: config.title,
                    template: config.emailTemplate
                })
            } else {
                console.log("No email template for notification type:", type);
            }
        } catch (error) {
            console.error("Error sending notification emails:", error);
        }
        // Send the other methods individually
        const response = await Promise.all(users.map(async(user)=>{
            try {
                const notifPreferences = user.notif_preferences || {};
            } catch (error) {
                console.error("Error sending notification to user:", user.id, error);
            }
        }))
    })
}