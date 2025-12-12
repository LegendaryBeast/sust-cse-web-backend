export interface IFaculty {
    name: string;
    designation: string;
    email: string;
    phone?: string;
    image: string;
    education: string[];
    research: string[];
    publications?: string[];
}

export interface ICourse {
    title: string;
    code: string;
    level: 'Undergraduate' | 'M.Sc.' | 'Ph.D.';
    description: string;
    credits?: number;
    teacherId?: any;
    semester?: number;
    session?: string;
    isEnrollmentOpen?: boolean;
    department?: string;
}

export interface INews {
    title: string;
    excerpt: string;
    image: string;
    url?: string;
    isActive: boolean;
    order: number;
}

export interface IContact {
    name: string;
    email: string;
    subject: string;
    message: string;
    isRead: boolean;
}

export interface IUser {
    username: string;
    email: string;
    password: string;
    role: 'admin' | 'superadmin';
    comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IAuthRequest extends Request {
    user?: {
        id: string;
        username: string;
        email: string;
        role: string;
    };
}
