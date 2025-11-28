export class Route {
	id: number;
	title: string;
	authorId: number;
	createdAt: Date;
	updatedAt: Date;

	constructor(props: Route) {
		Object.assign(this, props);
	}
}
