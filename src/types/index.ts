export interface User {
    uid: string;
    email: string;
    displayName?: string;
    createdAt: Date;
    cash_money: number;
}

export interface Wallet {
    id: string;
    userId: string;
    balance: number;
    createdAt: Date;
    updatedAt: Date;
    transactions: Transaction[];
}

export interface Transaction {
    id: string;
    amount: number;
    type: 'add' | 'withdraw';
    timestamp: Date;
    description?: string;
}

export interface NewsArticle {
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    publishedAt: string;
    source: {
        name: string;
    };
    content: string;
    tags: string[];
}

export interface Course {
    id: string;
    title: string;
    provider: string;
    description: string;
    level: string;
    link: string;
    image: string;
    tags: string[];
}