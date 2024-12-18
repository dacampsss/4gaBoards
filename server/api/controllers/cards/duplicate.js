const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
  },
  LIST_NOT_FOUND: {
    listNotFound: 'List not found',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    cardNotFound: {
      responseType: 'notFound',
    },
    listNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { card } = await sails.helpers.cards.getProjectPath(inputs.id).intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);
    const { list } = await sails.helpers.lists.getProjectPath(card.listId).intercept('pathNotFound', () => Errors.LIST_NOT_FOUND);

    const boardMembership = await BoardMembership.findOne({
      boardId: card.boardId,
      userId: currentUser.id,
    });

    if (!boardMembership) {
      throw Errors.CARD_NOT_FOUND;
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const values = _.omit(card, ['id']); // Omit the id to create a new card
    const copiedCard = await sails.helpers.cards.createOne
      .with({
        values: {
          ...values,
          list,
          creatorUser: currentUser,
          duplicate: true,
        },
        request: this.req,
      })
      .intercept('positionMustBeInValues', () => Errors.POSITION_MUST_BE_PRESENT);

    if (!copiedCard) {
      throw Errors.CARD_NOT_FOUND;
    }

    const cardLabels = await CardLabel.find({ cardId: card.id });
    const memberUsers = await CardMembership.find({ cardId: card.id });
    // TODO use task duplicate helper
    const tasks = await Task.find({ cardId: card.id });
    const taskIds = sails.helpers.utils.mapRecords(tasks);
    const taskMemberships = await sails.helpers.cards.getTaskMemberships(taskIds);
    const attachments = await Attachment.find({ cardId: card.id });
    const actions = await Action.find({ cardId: card.id });
    const actionsUsers = await User.find({ id: _.map(actions, 'userId') });
    const coverAttachment = attachments.find((attachment) => attachment.id === card.coverAttachmentId);
    const coverAttachmentDirname = coverAttachment != null ? coverAttachment.dirname : undefined;

    const newTaskIdMapping = {};

    await Promise.all(
      tasks.map(async (task) => {
        const newTask = await sails.helpers.tasks.createOne.with({
          values: {
            ..._.omit(task, ['id', 'cardId']), // Omit the id and cardId to ensure a new task is created for the copied card
            card: copiedCard,
          },
          request: this.req,
        });
        newTaskIdMapping[task.id] = newTask.id;
        return newTask;
      }),
    );

    const copiedItemsPromises = [
      ...cardLabels.map((cardLabel) => {
        return sails.helpers.cardLabels.createOne
          .with({
            values: {
              card: copiedCard,
              label: { id: cardLabel.labelId, boardId: copiedCard.boardId }, // Construct the label object expected by the helper
            },
            request: this.req,
          })
          .intercept('labelAlreadyInCard', () => Errors.LABEL_ALREADY_IN_CARD); // Handle the specific error if the label is already associated with the card
      }),
      ...memberUsers.map((memberUser) => {
        return sails.helpers.cardMemberships.createOne
          .with({
            values: {
              card: copiedCard, // Pass the copied card's ID
              userId: memberUser.userId, // Use the userId from the original memberUser
            },
            request: this.req,
          })
          .intercept('userAlreadyCardMember', () => Errors.USER_ALREADY_CARD_MEMBER); // Handle the specific error if the user is already a member of the card
      }),
      ...taskMemberships.map((taskMembership) => {
        return sails.helpers.taskMemberships.createOne.with({
          values: {
            card: copiedCard,
            taskId: newTaskIdMapping[taskMembership.taskId],
            userId: taskMembership.userId,
          },
          request: this.req,
        });
      }),
      ...attachments.map((attachment) => {
        return sails.helpers.attachments.createOne.with({
          values: {
            ..._.omit(attachment, ['id']),
            cardId: copiedCard.id,
            createdAt: attachment.createdAt,
            card: copiedCard,
            creatorUser: currentUser,
          },
          request: this.req,
        });
      }),
      ...actions.map((action) => {
        return sails.helpers.actions.createOne.with({
          values: {
            ..._.omit(action, ['id']),
            duplicate: true,
            card: copiedCard,
            user: actionsUsers.find((user) => user.id === action.userId),
          },
          request: this.req,
        });
      }),
    ];

    await Promise.all(copiedItemsPromises);

    const createdLabels = await sails.helpers.cards.getCardLabels(card.id);
    const createdMemberships = await sails.helpers.cards.getCardMemberships(card.id);
    const createdTasks = await sails.helpers.cards.getTasks(copiedCard.id);
    const createdTaskIds = sails.helpers.utils.mapRecords(createdTasks);
    const createdTaskMemberships = await sails.helpers.cards.getTaskMemberships(createdTaskIds);
    const createdActions = await sails.helpers.cards.getActions(copiedCard.id);
    const createdAttachments = await sails.helpers.cards.getAttachments(copiedCard.id);
    const createdCoverAttachment = createdAttachments.find((attachment) => attachment.dirname === coverAttachmentDirname);
    const createdCoverAttachmentId = createdCoverAttachment != null ? createdCoverAttachment.id : undefined;
    await Card.updateOne({ id: copiedCard.id }).set({ coverAttachmentId: createdCoverAttachmentId });

    return {
      item: copiedCard,
      included: {
        cardLabels: createdLabels,
        cardMemberships: createdMemberships,
        tasks: createdTasks,
        taskMemberships: createdTaskMemberships,
        attachments: createdAttachments,
        actions: createdActions,
        coverAttachmentId: createdCoverAttachmentId,
      },
    };
  },
};
