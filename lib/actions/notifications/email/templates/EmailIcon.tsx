import type { SVGProps } from "react";

type EmailIconProps = SVGProps<SVGSVGElement> & {
    size?: number;
};

function renderIcon(svg: string, size: number, props: EmailIconProps) {
    const attributes = Object.entries(props)
        .filter(([name]) => name !== "size" && name !== "children")
        .map(([name, value]) => `${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}="${String(value)}"`)
        .join(" ");

    return svg
        .replace('width="24"', `width="${size}"`)
        .replace('height="24"', `height="${size}"`)
        .replace("<svg", `<svg aria-hidden="true" ${attributes}`);
}

export function StaticEmailIcon({svg, size = 24, ...props}: {svg: string; size?: number} & EmailIconProps) {
    return (
        <span
            style={{display: "inline-flex", lineHeight: 0, verticalAlign: "middle"}}
            dangerouslySetInnerHTML={{__html: renderIcon(svg, size, props)}}
        />
    );
}