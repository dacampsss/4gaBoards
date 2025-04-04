const bcrypt = require('bcrypt');

exports.seed = async (knex) => {
  const date = new Date().toUTCString();

  const [{ id }] = await knex('user_account')
    .insert({
      email: 'demo@demo.demo',
      password: bcrypt.hashSync('demo', 10),
      isAdmin: true,
      name: 'Demo Demo',
      username: 'demo',
      createdAt: date,
      updatedAt: date,
    })
    .returning('id');

  await knex('user_prefs').insert({
    id,
    language: null,
    subscribeToOwnCards: false,
    descriptionMode: 'edit',
    commentMode: 'edit',
    descriptionShown: true,
    tasksShown: true,
    attachmentsShown: true,
    commentsShown: true,
    sidebarCompact: false,
    defaultView: 'board',
    listViewStyle: 'default',
    listViewColumnVisibility: {
      notificationsCount: true,
      coverUrl: false,
      name: true,
      labels: true,
      users: true,
      listName: true,
      hasDescription: true,
      attachmentsCount: true,
      commentCount: true,
      dueDate: true,
      timer: true,
      tasks: true,
      createdAt: false,
      updatedAt: false,
      description: false,
      actions: true,
    },
    createdAt: date,
  });
};
