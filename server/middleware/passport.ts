import passport from "passport";
import {
	ExtractJwt,
	Strategy as JwtStrategy,
  type StrategyOptions,
} from "passport-jwt";
import type { Request } from "express";
import Admin from "../models/Admin.model.ts";
import { config } from "../config/config.ts";

const opts: StrategyOptions = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: config.jwt.secret,
	passReqToCallback: true,
};

passport.use(
	new JwtStrategy(opts, async (req: Request, payload: any, done: any) => {
		try {
			const user = await Admin.findById(payload.id);

			if (user) return done(null, user);

			return done(null, false);
		} catch (err) {
			return done(err, false);
		}
	})
);

export default passport;
