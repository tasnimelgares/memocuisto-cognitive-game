export interface Patient {
    id?: number
    firstName: string;
    lastName: string;
    nickname?: string;
    age?: number;
    accessibility?: {
        isVisuallyImpaired: boolean;
        isHearingImpaired: boolean;
    };
    imageUrl?: string;
}