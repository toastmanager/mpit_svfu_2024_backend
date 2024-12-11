import * as bcrypt from 'bcrypt';
import { Token } from './auth.service';

export const createTokenObject = (
	access_token: string,
	refresh_token: string,
): Token => {
	return {
		accessToken: access_token,
		refreshToken: refresh_token,
		tokenType: 'Bearer',
	};
};

export const encodePassword = async (rawPassword: string): Promise<string> => {
	const salt = await bcrypt.genSalt();
	return await bcrypt.hash(rawPassword, salt);
};

export const comparePasswords = async (
	rawPassword: string,
	hashedPassword: string,
): Promise<boolean> => {
	return await bcrypt.compare(rawPassword, hashedPassword);
};
