'use client';

import { getUserColumns, UserColumnsProps } from "@/components/tables/users/columns";
import { UsersDataTable } from "@/components/tables/users/data-table";
import { User } from "@/lib/schema/schemaTypes";

export default function UsersClientPage(props: UserColumnsProps & {users: User[]}){
    return <UsersDataTable columns={getUserColumns(props)} data={props.users}/>
}