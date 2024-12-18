import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import omit from 'lodash/omit';
import { push } from '../lib/redux-router';

import selectors from '../selectors';
import entryActions from '../entry-actions';
import Paths from '../constants/Paths';
import { BoardMembershipRoles } from '../constants/Enums';
import CardModal from '../components/CardModal';

const mapStateToProps = (state) => {
  const { projectId } = selectors.selectPath(state);
  const allProjectsToLists = selectors.selectProjectsToListsForCurrentUser(state);
  const isCurrentUserManager = selectors.selectIsCurrentUserManagerForCurrentProject(state);
  const allBoardMemberships = selectors.selectMembershipsForCurrentBoard(state);
  const allLabels = selectors.selectLabelsForCurrentBoard(state);
  const currentUserMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);

  const { name, description, dueDate, timer, isSubscribed, isActivitiesFetching, isAllActivitiesFetched, isActivitiesDetailsVisible, isActivitiesDetailsFetching, boardId, listId, id, commentCount } =
    selectors.selectCurrentCard(state);

  const users = selectors.selectUsersForCurrentCard(state);
  const labels = selectors.selectLabelsForCurrentCard(state);
  const tasks = selectors.selectTasksForCurrentCard(state).map((task) => ({
    ...task,
    users: selectors.selectUsersForTaskById(state, task.id),
  }));
  const attachments = selectors.selectAttachmentsForCurrentCard(state);
  const activities = selectors.selectActivitiesForCurrentCard(state);
  const user = selectors.selectCurrentUser(state);
  const userId = user.id;
  const { commentMode, descriptionMode, descriptionShown, tasksShown, attachmentsShown, commentsShown } = user;

  const { isGithubConnected, githubRepo } = selectors.selectCurrentBoard(state);

  let isCurrentUserEditor = false;
  let isCurrentUserEditorOrCanComment = false;

  if (currentUserMembership) {
    isCurrentUserEditor = currentUserMembership.role === BoardMembershipRoles.EDITOR;
    isCurrentUserEditorOrCanComment = isCurrentUserEditor || currentUserMembership.canComment;
  }
  const url = selectors.selectUrlForCard(state, id);

  return {
    name,
    id,
    description,
    dueDate,
    timer,
    isSubscribed,
    isActivitiesFetching,
    isAllActivitiesFetched,
    isActivitiesDetailsVisible,
    isActivitiesDetailsFetching,
    listId,
    boardId,
    projectId,
    users,
    labels,
    tasks,
    attachments,
    activities,
    descriptionMode,
    descriptionShown,
    tasksShown,
    attachmentsShown,
    commentsShown,
    userId,
    isGithubConnected,
    githubRepo,
    allProjectsToLists,
    allBoardMemberships,
    allLabels,
    commentCount,
    canEdit: isCurrentUserEditor,
    canEditCommentActivities: isCurrentUserEditorOrCanComment,
    canEditAllCommentActivities: isCurrentUserManager,
    commentMode,
    url,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onCurrentUserUpdate: entryActions.updateCurrentUser,
      onUpdate: entryActions.updateCurrentCard,
      onMove: entryActions.moveCurrentCard,
      onTransfer: entryActions.transferCurrentCard,
      onDuplicate: entryActions.duplicateCurrentCard,
      onDelete: entryActions.deleteCurrentCard,
      onUserAdd: entryActions.addUserToCurrentCard,
      onUserRemove: entryActions.removeUserFromCurrentCard,
      onBoardFetch: entryActions.fetchBoard,
      onLabelAdd: entryActions.addLabelToCurrentCard,
      onLabelRemove: entryActions.removeLabelFromCurrentCard,
      onLabelCreate: entryActions.createLabelInCurrentBoard,
      onLabelUpdate: entryActions.updateLabel,
      onLabelMove: entryActions.moveLabel,
      onLabelDelete: entryActions.deleteLabel,
      onTaskCreate: entryActions.createTaskInCurrentCard,
      onTaskUpdate: entryActions.updateTask,
      onTaskDuplicate: entryActions.duplicateTask,
      onTaskMove: entryActions.moveTask,
      onTaskDelete: entryActions.deleteTask,
      onUserToTaskAdd: entryActions.addUserToTask,
      onUserFromTaskRemove: entryActions.removeUserFromTask,
      onAttachmentCreate: entryActions.createAttachmentInCurrentCard,
      onAttachmentUpdate: entryActions.updateAttachment,
      onAttachmentDelete: entryActions.deleteAttachment,
      onActivitiesFetch: entryActions.fetchActivitiesInCurrentCard,
      onActivitiesDetailsToggle: entryActions.toggleActivitiesDetailsInCurrentCard,
      onCommentActivityCreate: entryActions.createCommentActivityInCurrentCard,
      onCommentActivityUpdate: entryActions.updateCommentActivity,
      onCommentActivityDelete: entryActions.deleteCommentActivity,
      push,
    },
    dispatch,
  );

const mergeProps = (stateProps, dispatchProps) => ({
  ...stateProps,
  ...omit(dispatchProps, 'push'),
  onClose: () => dispatchProps.push(Paths.BOARDS.replace(':id', stateProps.boardId)),
});

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(CardModal);
