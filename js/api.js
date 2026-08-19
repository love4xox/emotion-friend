export async function fetchEmpathyReply(userMessage) {
    const response = await fetch('/api/chat', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage })
    });

    const data = await response.json();
    if (!response.ok || data.error) {
        throw new Error(data.error || `서버 응답 오류 (${response.status})`);
    }
    return data.reply;
}