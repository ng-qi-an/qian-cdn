import { Html, Body, Tailwind, pixelBasedPreset, Section, Row, Text, Container, Link, Hr } from "react-email";
import { StaticEmailIcon } from "./EmailIcon";
import { Cloud } from "lucide-static";

export default function EmailTemplate({children}: {children: React.ReactNode}){
    return <Html>
        <Tailwind config={{
            presets: [pixelBasedPreset]
        }}>
            <Body className="bg-gray-100 px-1">
                <Container className="px-6 mx-auto pt-0 mt-0 bg-white max-w-[640px] font-sans">
                    <Section className="pt-2">
                        <Row>
                            <div className="flex items-center">
                                <StaticEmailIcon
                                    size={16}
                                    svg={Cloud}
                                />
                                <p className="ml-2 font-medium" style={{fontSize: '14px'}}>Unified CDN</p>
                            </div>
                        </Row>
                    </Section>
                    <Section className="pt-12 pb-12 px-2">
                        {children}
                    </Section>
                    <Hr className="border-t border-gray-300"/>
                    <Section className="pt-6 pb-10 px-4">
                        <Text className="opacity-70 m-0 mb-4">This email is meant to be recieved by users of Unified CDN. If you were not expecting this email, you can safely ignore it.</Text>
                        <Text className="m-0 opacity-70 text-balance">
                            Unified CDN is a platform that allows you to combine file storage and delivery into a single, easy-to-use service.
                            <Link href="https://unified-cdn.ngqian.com" className="ml-1 text-balance underline text-black">Learn more</Link>
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Tailwind>
    </Html>
}