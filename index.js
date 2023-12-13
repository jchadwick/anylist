const AnyList = require("./lib");

const any = new AnyList({
  email: process.env.EMAIL,
  password: process.env.PASSWORD,
});

any.login().then(async () => {
  const newEvent = await any.createMealPlanningCalendarEvent({
    title: "Test",
    details: "this is a test"
  });

  await newEvent.save();

  any.teardown();
});
