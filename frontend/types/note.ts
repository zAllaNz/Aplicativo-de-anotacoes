export type NoteRequest = {
    title: string;
    content: string;
    type: 'text' | 'list';
    color: string;
}

export type NoteResponse = {
    id: string;
    title: string;
    content: string;
    type: 'text' | 'list';
    user_id: string;
    created_at: string;
    updated_at: string | null;
    color: string;
    order_index: number;
    deleted: boolean;
    deleted_at: string | null;
}