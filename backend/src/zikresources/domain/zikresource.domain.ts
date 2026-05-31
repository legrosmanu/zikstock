export interface Tag {
    label: string;
    value: string;
}

export interface Zikresource {
    id: string;
    createdBy: string;
    url: string;
    artist: string;
    title: string;
    type?: string;
    tags?: Tag[];
}
