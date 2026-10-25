import { FileIcon, FileText, ImageIcon } from "lucide-react";

export const fileCategories = {
  images: ["image/bmp", "image/jpeg", "image/png", "image/webp"],
  text: ["text/html", "text/plain"],
  documents: ["application/pdf", "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
}

export const fileCategoriesList = Object.values(fileCategories).flat();

export function mimeToReadable(mime: string) {
  if (!fileCategoriesList.includes(mime)) return "Unknown";
  if (mime === "application/pdf") return "PDF Document";
  if (mime === "text/plain" || mime === "application/msword" || mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "Text Document";
  if (mime === "application/vnd.openxmlformats-officedocument.presentationml.presentation" || mime === "application/vnd.ms-powerpoint") return "Presentation";
  const parts = mime.split("/");
  if (parts.length < 2) return mime;
  if (parts[0] === "image") return parts[1].toUpperCase() + " Image";
  if (parts[0] === "text" || parts[0] === 'application') return parts[1].toUpperCase() + " File";
}

export function mimeToIcon(mime: string) {
    if (fileCategories.images.includes(mime)) return ImageIcon;
    if (fileCategories.text.includes(mime) || fileCategories.documents.includes(mime)) return FileText;
    return FileIcon;
  }