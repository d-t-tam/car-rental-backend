export interface CarSearchQuery {
    name?: string;
    brand?: string;
    model?: string;
    category_id?: number;
    min_price?: number;
    max_price?: number;
    status?: string;
}
