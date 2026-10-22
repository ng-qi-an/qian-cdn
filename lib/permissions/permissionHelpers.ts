import { roles } from "../auth-client";

export function checkUserHasHigherPerms(currentUserRoleId: string, targetUserRoleId: string){
    const currentUserRole = roles.find((role)=> role.id == currentUserRoleId)
    const targetUserRole = roles.find((role)=> role.id == targetUserRoleId)
    if (roles.indexOf(currentUserRole!) == 0 && roles.indexOf(targetUserRole!) == 0) {
        return true
    } else if (roles.indexOf(currentUserRole!) < roles.indexOf(targetUserRole!)) {
        return true
    } else {
        return false
    }
}