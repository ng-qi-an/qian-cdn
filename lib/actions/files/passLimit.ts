export default function passLimit({incomingSize, currentSize, limit}: {incomingSize: number, currentSize: number, limit: number}) {
    const newSize = incomingSize + currentSize;
    if (newSize > limit) {
        return { success: false, exceedsBy: newSize - limit };
    } else {
        return { success: true };
    }
}