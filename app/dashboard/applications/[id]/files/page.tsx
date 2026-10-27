import { FilesDataTable } from "@/components/tables/files/data-table";
import { filesColumns } from "@/components/tables/files/columns";
import { db } from "@/lib/db";
import { files } from "@/lib/schema/schema";
import { eq } from "drizzle-orm";

export const instant = false;

export default async function ApplicationFiles({params}: {params: Promise<{id: string}>}) {
    const {id} = await params;
    const appData = await db.query.applications.findFirst({
        where: {
            id
        },
        with: {
            files: true
        },
        columns: {
            status: true
        }
    })
    return <div className="pt-4 h-full relative min-w-0 max-w-full">
        <FilesDataTable disableFileUploads={appData!.status != "active"} columns={filesColumns} data={appData!.files} appId={id}/>
    </div>
}