import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements, userAc } from "better-auth/plugins/admin/access";

export const permissionStatement = { 
    ...defaultStatements,
    applications: ["request", "create", "update", "delete", "viewAll", "reviewRequests"], 
    databases: ["create", "update", "delete", "viewAll", "share"],
} as const; 

export const ac = createAccessControl(permissionStatement); 

export const viewOnlyRole = ac.newRole({
    ...userAc.statements
})

export const userRole = ac.newRole({
    ...userAc.statements,
    applications: ["request", "update", "delete"]
})

export const adminRole = ac.newRole({
    ...adminAc.statements,
    applications: [...userRole.statements.applications, "create", "viewAll", "reviewRequests"],
    databases: ["create", "update", "delete"]
})

export const superAdminRole = ac.newRole({
    ...adminAc.statements,
    user: [...adminAc.statements.user, "impersonate-admins"],
    applications: [...permissionStatement.applications],
    databases: [...permissionStatement.databases]
})