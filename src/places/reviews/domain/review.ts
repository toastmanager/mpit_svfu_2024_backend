class PlaceReview {
	id: number;
	score: number;
	text: string;
	createdAt: Date;
	updatedAt: Date;
	authorId: number;
	placeId: number;

	constructor(props: PlaceReview) {
		Object.assign(this, props);
	}
}
