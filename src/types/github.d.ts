export interface Commit {
    commits: {
        id: string;
        tree_id: string;
        distinct: boolean;
        message: string;
        timestamp: string;
        url: string;
        author: {
            name: string;
            email: string;
            username: string;
        };
        committer: {
            name: string;
            email: string;
            username: string;
        };
        added: string[];
        removed: string[];
        modified: string[];
    }[];
}
