import { PlaceReview } from '@prisma/client';

export function calcScore(reviews?: PlaceReview[]): string {
	let scoreSum = 0;
	if (reviews && reviews.length > 0) {
		for (const review of reviews) {
			scoreSum += review.score;
		}
		return (scoreSum / reviews.length).toFixed(2);
	}
	return '0';
}
