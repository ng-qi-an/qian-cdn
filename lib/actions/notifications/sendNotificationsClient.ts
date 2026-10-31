import { NotificationType } from "./notificationTypes";
import type { SendNotificationArgs } from "./sendNotification";
import sendNotification from "./sendNotification";

export default async function sendNotificationClient(props: SendNotificationArgs & {type: NotificationType}) {
    return await sendNotification(props.type, props);
}