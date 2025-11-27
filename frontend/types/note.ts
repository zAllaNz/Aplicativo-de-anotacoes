export type NoteRequest = {
    title: string;
    content: string;
    type: 'text' | 'list';
}

export type NoteResponse = {
    id: string;
    title: string;
}