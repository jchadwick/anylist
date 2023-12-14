const {env} = require('process');
const AnyList = require('./lib');

const any = new AnyList({
	email: env.EMAIL,
	password: env.PASSWORD,
});

await any.login().then(async () => {
	const recipes = await any.getRecipes();

	// Create new event
	const newEvent = await any.createMealPlanningCalendarEvent({
		title: 'Test',
		details: 'this is a test',
		recipeId: recipes[0].identifier,
	});
	await newEvent.save();

	// Update saved event (change recipe ID)
	const savedEvents = await any.getMealPlanningCalendarEvents();
	const savedEvent = savedEvents.find(x => x.identifier === newEvent.identifier);
	if (!savedEvent) {
		throw new Error('Failed to find saved event');
	}

	savedEvent.recipeId = recipes[1].identifier;
	await savedEvent.save();

	const updatedEvents = await any.getMealPlanningCalendarEvents();
	const updatedEvent = updatedEvents.find(x => x.identifier === newEvent.identifier);
	if (!updatedEvent) {
		throw new Error('Failed to find updated event');
	}

	if (updatedEvent.recipeId !== recipes[1].identifier) {
		throw new Error('Event was not updated');
	}

	// Delete test event
	await savedEvent.delete();
	const updatedEvents2 = await any.getMealPlanningCalendarEvents();
	const deletedEvent = updatedEvents2.find(x => x.identifier === newEvent.identifier);
	if (deletedEvent) {
		throw new Error('Failed to delete event');
	}

	any.teardown();
});
