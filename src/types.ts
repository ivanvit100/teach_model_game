export type Action = {
    description: string;
    effects: {
        administration: number;
        colleagues: number;
        parents: number;
        students: number;
        freeTime: number;
    };
};

export type Situation = {
    description: string;
    actions: Action[];
};

export type FixedEvent = {
    interval: number;
    description: string;
    actions: Action[];
};