import { adminClient, inferAdditionalFields } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import { ac, adminRole, superAdminRole, userRole, viewOnlyRole } from "./permissions/permissions";
import { apiKeyClient } from "@better-auth/api-key/client";
import { Role } from "better-auth/plugins";
import type { auth } from "./auth";

export const roles = [
    {
        name: "Super Admin",
        id: "superAdmin",
        role: superAdminRole
    },
    {
        name: "Admin",
        id: "admin",
        role: adminRole
    },
    {
        name: "User",
        id: "user",
        role: userRole
    },
    {
        name: "View Only",
        id: "viewOnly",
        role: viewOnlyRole
    }
]

const rolesDict: Record<string, Role> = {}
roles.forEach((role) => {
    rolesDict[role.id] = role.role
})

export const authClient = createAuthClient({
    plugins: [
        adminClient({
            ac,
            roles: rolesDict
        }),
        apiKeyClient(),
        inferAdditionalFields<typeof auth>()
    ]
})