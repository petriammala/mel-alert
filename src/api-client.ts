async function fetchJson<T>(url: string, method: string = 'GET', extraHeaders: object = {}, data?: object) {
    const headers = {
        ...extraHeaders,
        'Content-Type': 'application/json'
    }
    const body = data ? JSON.stringify(data) : undefined
    const res = await fetch(url, {method, headers, body})
    if (res.ok) {
        return (await res.json()) as T
    }
    throw new Error(`${res.status}: ${res.statusText}`)
}

export function getJson<T>(url: string, headers: { [key: string]: string }) {
    return fetchJson<T>(url, 'GET', headers)
}

export function postJson<T>(url: string, data: object) {
    return fetchJson<T>(url, 'POST', {}, data)
}
