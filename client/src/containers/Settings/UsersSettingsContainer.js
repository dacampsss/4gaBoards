import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../../selectors';
import entryActions from '../../entry-actions';
import UsersSettings from '../../components/Settings/UsersSettings';

const mapStateToProps = (state) => {
  const users = selectors.selectUsersExceptCurrent(state);
  const coreSettings = selectors.selectCoreSettings(state);

  const {
    ui: {
      userCreateForm: { data: defaultData, isSubmitting, error },
    },
  } = state;

  return {
    userCreateDefaultData: defaultData,
    userCreateIsSubmitting: isSubmitting,
    userCreateError: error,
    items: users,
    demoMode: coreSettings.demoMode,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onUserCreate: entryActions.createUser,
      onUserCreateMessageDismiss: entryActions.clearUserCreateError,
      onUpdate: entryActions.updateUser,
      onUsernameUpdate: entryActions.updateUserUsername,
      onUsernameUpdateMessageDismiss: entryActions.clearUserUsernameUpdateError,
      onEmailUpdate: entryActions.updateUserEmail,
      onEmailUpdateMessageDismiss: entryActions.clearUserEmailUpdateError,
      onPasswordUpdate: entryActions.updateUserPassword,
      onPasswordUpdateMessageDismiss: entryActions.clearUserPasswordUpdateError,
      onDelete: entryActions.deleteUser,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(UsersSettings);
