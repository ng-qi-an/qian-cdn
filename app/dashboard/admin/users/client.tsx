'use client';

import { getUserColumns, UserColumnsProps } from "@/components/tables/users/columns";
import { UsersDataTable } from "@/components/tables/users/data-table";
import { User } from "@/lib/schema/schemaTypes";

export default function UsersClientPage(props: UserColumnsProps & {users: User[]}){
    return <div className="h-full min-h-0 min-w-0 max-w-full relative">
        <UsersDataTable columns={getUserColumns(props)} data={props.users}/>
    </div>
}