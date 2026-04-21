export default abstract class BaseRepository<T> {
    protected model: any;

    constructor(model: any) {
        this.model = model;
    }

    abstract create(data: Partial<T>): Promise<T>;
    abstract findById(id: string): Promise<T | null>;
    abstract findByUsername(username: string): Promise<T | null>;
    abstract findByEmail(email: string): Promise<T | null>;
    abstract findAll(): Promise<T[]>;
}