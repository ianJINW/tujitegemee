export declare const authConfig: {
    readonly jwtSecret: string;
    readonly jwtExpiry: string;
    readonly cookieOptions: {
        readonly httpOnly: true;
        readonly secure: boolean;
        readonly sameSite: "strict";
        readonly maxAge: number;
    };
    readonly refreshToken: {
        readonly expiry: "7d";
        readonly cookieName: "refreshToken";
    };
};
//# sourceMappingURL=auth.config.d.ts.map