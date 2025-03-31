/**
 * UserPrefs.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const DESCRIPTION_MODES = ['edit', 'live', 'preview'];
const VIEW_MODES = ['board', 'list'];
const LIST_VIEW_STYLES = ['default', 'compact'];

module.exports = {
  DESCRIPTION_MODES,
  VIEW_MODES,
  LIST_VIEW_STYLES,

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    language: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    subscribeToOwnCards: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'subscribe_to_own_cards',
    },
    descriptionMode: {
      type: 'string',
      isIn: DESCRIPTION_MODES,
      isNotEmptyString: true,
      columnName: 'description_mode',
      defaultsTo: 'edit',
    },
    commentMode: {
      type: 'string',
      isIn: DESCRIPTION_MODES,
      isNotEmptyString: true,
      columnName: 'comment_mode',
      defaultsTo: 'edit',
    },
    descriptionShown: {
      type: 'boolean',
      defaultsTo: true,
      columnName: 'description_shown',
    },
    tasksShown: {
      type: 'boolean',
      defaultsTo: true,
      columnName: 'tasks_shown',
    },
    attachmentsShown: {
      type: 'boolean',
      defaultsTo: true,
      columnName: 'attachments_shown',
    },
    commentsShown: {
      type: 'boolean',
      defaultsTo: true,
      columnName: 'comments_shown',
    },
    sidebarCompact: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'sidebar_compact',
    },
    defaultView: {
      type: 'string',
      isIn: VIEW_MODES,
      isNotEmptyString: true,
      columnName: 'default_view',
      defaultsTo: 'board',
    },
    listViewStyle: {
      type: 'string',
      isIn: LIST_VIEW_STYLES,
      isNotEmptyString: true,
      columnName: 'list_view_style',
      defaultsTo: 'default',
    },
  },

  tableName: 'user_prefs',
};
