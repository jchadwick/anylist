/// <reference path="./meal-planning-calendar-label.js" />
const FormData = require("form-data");
const uuid = require("./uuid");

/**
 * Meal Planning Calendar Event class.
 * @class
 *
 * @param {object} event event
 * @param {object[]} labels labels
 * @param {object} context context
 *
 * @property {string} identifier
 * @property {string} calendarId
 * @property {Date} date
 * @property {string=} details
 * @property {string=} labelId
 * @property {MealPlanningCalendarEventLabel} label
 * @property {number} logicalTimestamp
 * @property {number} orderAddedSortIndex
 * @property {string} recipeId
 * @property {number} recipeScaleFactor
 * @property {string=} title
 */
class MealPlanningCalendarEvent {
  /**
   * @hideconstructor
   */
  constructor(event, { client, protobuf, uid, calendarId }) {
    this._client = client;
    this.protobuf = protobuf;
    this.uid = uid;
    this.calendarId = calendarId;

    this._isNew = !event.identifier;
    this.identifier = event.identifier || uuid();
    this.date = event.date || new Date();
    this.details = event.details;
    this.labelId = event.labelId;
    this.orderAddedSortIndex = event.orderAddedSortIndex;
    this.recipeId = event.recipeId;
    this.recipeScaleFactor = event.recipeScaleFactor;
    this.title = event.title;
  }

  _encode() {
    return new this.protobuf.PBCalendarEvent({
      identifier: this.identifier,
    //   logicalTimestamp: this.logicalTimestamp,
    //   calendarId: this.calendarId,
      date: this.date.toISOString(),
      title: this.title,
      details: this.details,
      recipeId: this.recipeId,
      labelId: this.labelId,
      orderAddedSortIndex: this.orderAddedSortIndex,
      recipeScaleFactor: this.recipeScaleFactor,
    });
  }

  /**
   * Perform a recipe operation.
   * @private
   * @param {string} handlerId - Handler ID for the operation
   * @returns {Promise} - Promise representing the operation result
   */
  async performOperation(handlerId) {
    const ops = new this.protobuf.PBCalendarOperationList();
    const op = new this.protobuf.PBCalendarOperation();

    op.setMetadata({
      operationId: uuid(),
      handlerId,
      userId: this.uid,
    });

    op.setUpdatedEvent(this._encode());
    ops.setOperations(op);

    console.log(
      "PRE:",
      JSON.stringify({
        operation: handlerId,
        calendarId: this.calendarId,
        identifier: this.identifier,
        date: this.date.toISOString(),
        title: this.title,
      })
    );

    const form = new FormData();
    form.append("operations", ops.toBuffer());

    const resp = await this._client.post("data/meal-planning-calendar/update", {
      body: form,
      headers: {
        calendar_timestamp: Date.now() / 1000,
        calendar_id: this.calendarId,
      },
    });

    console.log(
      "SUCCESS:",
      JSON.stringify({
        operation: handlerId,
        calendarId: this.calendarId,
        identifier: this.identifier,
        date: this.date.toISOString(),
        title: this.title,
      })
    );
  }

  /**
   * Save local changes to meal event to AnyList's API.
   * @return {Promise}
   */
  async save() {
    const operation = this._isNew ? "new-event" : "update-event";
    await this.performOperation(operation);
  }

  /**
   * Delete a meal event from AnyList.
   * @return {Promise}
   */
  async delete() {
    await this.performOperation("delete-event");
  }
}

module.exports = MealPlanningCalendarEvent;
