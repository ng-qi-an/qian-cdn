'use client';

import { render } from "@react-email/render";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Dashboard from "@/components/navigation/Dashboard";
import DashboardBody from "@/components/navigation/DashboardBody";
import DashboardHeader from "@/components/navigation/DashboardHeader";
import DashboardSectionHeader from "@/components/navigation/DashboardSectionHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { NotificationTypes, NotificationType, NotificationTypeList } from "@/lib/actions/notifications/notificationTypes";

type SampleData = Record<string, unknown>;

const sampleDataWithoutTargetUser: Record<NotificationType, SampleData> = {
    APPLICATION_CREATED: {
        link: "/dashboard/applications/example",
        appName: "Example CDN app",
        databaseName: "Production database",
        triggerUser: { id: "user-123", name: "Alex Morgan" },
    },
    APPLICATION_REQUESTED: {
        link: "/dashboard/applications/example",
        appName: "Example CDN app",
        databaseName: "Production database",
        triggerUser: { id: "user-123", name: "Alex Morgan" },
    },
    APPLICATION_REVIEWED_USER: {
        link: "/dashboard/applications/example",
        appName: "Example CDN app",
        triggerUser: { id: "user-123", name: "Alex Morgan" },
        approved: true,
    },
    APPLICATION_REVIEWED_ADMIN: {
        link: "/dashboard/applications/example",
        appName: "Example CDN app",
        databaseName: "Production database",
        triggerUser: { id: "user-123", name: "Alex Morgan" },
        appOwnerName: "Taylor Smith",
        approved: true,
    },
    APIKEY_DELETED_USER: {
        link: "/dashboard/applications/example/settings/api-keys",
        apiKeyName: "Deploy key",
        appName: "Example CDN app",
        triggerUser: { id: "user-123", name: "Alex Morgan" },
    },
    APPLICATION_DELETED_USER: {
        link: "/dashboard/applications",
        appName: "Example CDN app",
        triggerUser: { id: "user-123", name: "Alex Morgan" },
    },
    APPLICATION_DELETED: {
        link: "/dashboard/applications",
        appName: "Example CDN app",
        triggerUser: { id: "user-123", name: "Alex Morgan" },
    },
    DATABASE_CREATED: {
        link: "/dashboard/admin/databases/example",
        databaseName: "Production database",
        triggerUser: { id: "user-123", name: "Alex Morgan" },
    },
    DATABASE_DELETED: {
        link: "/dashboard/admin/databases",
        databaseName: "Production database",
        triggerUser: { id: "user-123", name: "Alex Morgan" },
    },
    DATABASE_DELETED_USER: {
        link: "/dashboard/databases",
        databaseName: "Production database",
        triggerUser: { id: "user-123", name: "Alex Morgan" },
    },
    USER_CREATED_USER: {
        link: "/dashboard",
        triggerUser: { id: "user-123", name: "Alex Morgan" },
    },
    USER_CREATED_ADMIN: {
        link: "/dashboard/admin/users/example",
        triggerUser: { id: "user-123", name: "Alex Morgan" },
        newUser: { name: "Jamie Lee", role: "user" },
    },
    USER_PASSWORD_CHANGED_USER: {
        link: "/dashboard",
        triggerUser: { id: "user-123", name: "Alex Morgan" },
    },
    USER_PASSWORD_CHANGED_ADMIN: {
        link: "/dashboard/admin/users/example",
        triggerUser: { id: "user-123", name: "Alex Morgan" },
        user: { name: "Jamie Lee" },
    },
    USER_BANNED_USER: {
        link: "/dashboard",
        triggerUser: { id: "user-123", name: "Alex Morgan" },
        reason: "Repeated failed login attempts",
        expiresAt: "2026-12-01T12:00:00.000Z",
    },
    USER_BANNED_ADMIN: {
        link: "/dashboard/admin/users/example",
        triggerUser: { id: "user-123", name: "Alex Morgan" },
        user: { name: "Jamie Lee" },
        reason: "Repeated failed login attempts",
        expiresAt: "2026-12-01T12:00:00.000Z",
    },
    USER_UNBANNED_USER: {
        link: "/dashboard",
        triggerUser: { id: "user-123", name: "Alex Morgan" },
    },
    USER_UNBANNED_ADMIN: {
        link: "/dashboard/admin/users/example",
        triggerUser: { id: "user-123", name: "Alex Morgan" },
        user: { name: "Jamie Lee" },
    },
    USER_DELETED_ADMIN: {
        link: "/dashboard/admin/users",
        triggerUser: { id: "user-123", name: "Alex Morgan" },
        user: { name: "Jamie Lee" },
    },
    USER_DELETED_USER: {
        link: "/dashboard",
        triggerUser: { id: "user-123", name: "Alex Morgan" },
    },
};

const targetUser = { id: "user-456", name: "Jamie Lee" };
const sampleData = Object.fromEntries(
    Object.entries(sampleDataWithoutTargetUser).map(([type, data]) => [
        type,
        { ...data, targetUser },
    ])
) as unknown as Record<NotificationType, SampleData>;

const formatNotificationName = (type: NotificationType) =>
    type
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

function parseSampleData(value: string): SampleData {
    const parsed: unknown = JSON.parse(value, (key, entry) =>
        key === "expiresAt" && typeof entry === "string" ? new Date(entry) : entry
    );

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Sample data must be a JSON object.");
    }

    return parsed as SampleData;
}

export default function EmailViewerPage() {
    const [selectedType, setSelectedType] = useState<NotificationType>("APPLICATION_CREATED");
    const [sampleText, setSampleText] = useState(() => JSON.stringify(sampleData.APPLICATION_CREATED, null, 2));
    const [appliedData, setAppliedData] = useState<SampleData>(sampleData.APPLICATION_CREATED);
    const [parseError, setParseError] = useState<string | null>(null);
    const [renderedPreview, setRenderedPreview] = useState<{
        template: ReactNode;
        html?: string;
        error?: string;
    } | null>(null);

    const configuration = useMemo(() => {
        try {
            return { value: NotificationTypes[selectedType](appliedData as never), error: null };
        } catch (error) {
            return {
                value: null,
                error: error instanceof Error ? error.message : "The notification could not be rendered.",
            };
        }
    }, [appliedData, selectedType]);

    useEffect(() => {
        let cancelled = false;
        const template = configuration.value?.emailTemplate;

        if (!template) {
            return () => {
                cancelled = true;
            };
        }

        void render(template)
            .then((html) => {
                if (!cancelled) setRenderedPreview({ template, html });
            })
            .catch((error: unknown) => {
                if (!cancelled) {
                    setRenderedPreview({
                        template,
                        error: error instanceof Error ? error.message : "The email template could not be rendered.",
                    });
                }
            });

        return () => {
            cancelled = true;
        };
    }, [configuration.value?.emailTemplate]);

    const handleTypeChange = (value: string | null) => {
        if (!value || !NotificationTypeList.includes(value as NotificationType)) return;
        const type = value as NotificationType;
        const nextData = sampleData[type];
        setSelectedType(type);
        setSampleText(JSON.stringify(nextData, null, 2));
        setAppliedData(nextData);
        setParseError(null);
    };

    const handleApply = () => {
        try {
            setAppliedData(parseSampleData(sampleText));
            setParseError(null);
        } catch (error) {
            setParseError(error instanceof Error ? error.message : "Sample data is not valid JSON.");
        }
    };

    return (
        <Dashboard>
            <DashboardHeader breadcrumbs={[{ name: "Email viewer" }]} />
            <DashboardBody>
                <DashboardSectionHeader
                    title="Email template viewer"
                    description="Preview notification email templates with representative data before sending them."
                />
                <div className="grid min-h-0 gap-6 lg:grid-cols-[minmax(260px,340px)_minmax(0,1fr)]">
                    <Card size="sm">
                        <CardHeader>
                            <CardTitle>Preview data</CardTitle>
                            <CardDescription>
                                Choose a notification and edit the JSON passed to its template.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="notification-type">Notification type</FieldLabel>
                                    <Select value={selectedType} onValueChange={handleTypeChange}>
                                        <SelectTrigger id="notification-type" className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {NotificationTypeList.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {formatNotificationName(type)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="sample-data">Sample data</FieldLabel>
                                    <Textarea
                                        id="sample-data"
                                        className="min-h-80 resize-y border p-3 font-mono text-xs"
                                        value={sampleText}
                                        onChange={(event) => setSampleText(event.target.value)}
                                        spellCheck={false}
                                        aria-invalid={parseError ? true : undefined}
                                    />
                                    <FieldDescription>
                                        Values are passed to the selected notification record. ISO dates for
                                        <code className="px-1">expiresAt</code> are converted to Date objects.
                                    </FieldDescription>
                                    {parseError && <p className="text-sm text-destructive">{parseError}</p>}
                                </Field>
                                <Button type="button" onClick={handleApply}>Apply sample data</Button>
                            </FieldGroup>
                        </CardContent>
                    </Card>

                    <Card size="sm" className="min-w-0">
                        <CardHeader>
                            <CardTitle>Rendered email</CardTitle>
                            <CardDescription>
                                {configuration.value?.title ?? formatNotificationName(selectedType)}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {configuration.error ? (
                                <p className="text-sm text-destructive">{configuration.error}</p>
                            ) : configuration.value?.emailTemplate ? (
                                renderedPreview?.template === configuration.value.emailTemplate && renderedPreview.error ? (
                                    <p className="text-sm text-destructive">{renderedPreview.error}</p>
                                ) : renderedPreview?.template === configuration.value.emailTemplate && renderedPreview.html ? (
                                    <div className="h-[min(70vh,600px)] min-h-96 overflow-hidden bg-white shadow-inner">
                                        <iframe
                                            title={`${configuration.value.title} email preview`}
                                            className="block h-full w-full border-0 bg-white"
                                            sandbox=""
                                            srcDoc={renderedPreview.html}
                                            scrolling="yes"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex min-h-96 items-center justify-center bg-muted/40 text-sm text-muted-foreground">
                                        Rendering email preview...
                                    </div>
                                )
                            ) : (
                                <div className="flex min-h-96 flex-col gap-4 bg-muted/40 p-6">
                                    <p className="text-sm text-muted-foreground">
                                        This notification does not have an email template yet.
                                    </p>
                                    <div className="border bg-background p-4">
                                        <p className="font-medium">{configuration.value?.title}</p>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {configuration.value?.description}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </DashboardBody>
        </Dashboard>
    );
}