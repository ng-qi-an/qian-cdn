import { Heading, Preview, Section, Text } from "react-email";
import { StaticEmailIcon } from "./EmailIcon";
import { ReactNode } from "react";

export default function EmailSectionHero({title, icon, subtitle}: {title: string | ReactNode, icon: string, subtitle: string | ReactNode}) {
    return <Section align="left" className="mobile:!max-w-full max-w-[490px] mb-4">
        {typeof title == "string" && <Preview>{title}</Preview>}
        <StaticEmailIcon
            svg={icon}
            size={48}
        />
        <Heading as="h1" className="uppercase font-bold text-balance">
            {title}
        </Heading>
        <Text className="m-0 mt-6 text-balance">
            {subtitle}
        </Text>
    </Section>
}