import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import PreferencesSettings from '../../components/Settings/PreferencesSettings';
import entryActions from '../../entry-actions';
import selectors from '../../selectors';

const mapStateToProps = (state) => {
  const { language, subscribeToOwnCards, sidebarCompact, defaultView, listViewStyle } = selectors.selectCurrentUserPrefs(state);

  return {
    language,
    subscribeToOwnCards,
    sidebarCompact,
    defaultView,
    listViewStyle,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onUpdate: entryActions.updateCurrentUserPrefs,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(PreferencesSettings);
