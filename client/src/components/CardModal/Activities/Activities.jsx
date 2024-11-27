import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { ActivityTypes } from '../../../constants/Enums';
import CommentEdit from './CommentEdit';
import Item from './Item';
import { Button, ButtonStyle, Icon, IconType, IconSize, Loader, LoaderSize } from '../../Utils';

import * as s from './Activities.module.scss';
import * as cStyles from '../CardModal.module.scss';

const Activities = React.memo(
  ({
    items,
    isFetching,
    isAllFetched,
    isDetailsVisible,
    isDetailsFetching,
    canEdit,
    canEditAllComments,
    commentMode,
    isGithubConnected,
    githubRepo,
    commentCount,
    onFetch,
    onDetailsToggle,
    onCommentCreate,
    onCommentUpdate,
    onCommentDelete,
    toggleCommShown,
    commShown,
    onCurrentUserUpdate,
  }) => {
    const [t] = useTranslation();
    const visibilityRef = useRef(null);
    const commentAddRef = useRef(null);

    const openAddComment = useCallback(() => {
      commentAddRef.current?.open();
    }, []);

    const handleToggleDetailsClick = useCallback(() => {
      if (!commShown) {
        toggleCommShown(true);
        if (!isDetailsVisible) {
          onDetailsToggle(true);
        }
      } else {
        onDetailsToggle(!isDetailsVisible);
      }
    }, [commShown, isDetailsVisible, onDetailsToggle, toggleCommShown]);

    const handleCommentUpdate = useCallback(
      (id, data) => {
        onCommentUpdate(id, data);
      },
      [onCommentUpdate],
    );

    const handleCommentDelete = useCallback(
      (id) => {
        onCommentDelete(id);
      },
      [onCommentDelete],
    );

    const handleVisibilityChange = useCallback(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onFetch();
          }
        });
      },
      [onFetch],
    );

    useEffect(() => {
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      };

      const observer = new IntersectionObserver(handleVisibilityChange, options);
      if (visibilityRef.current) {
        observer.observe(visibilityRef.current);
      }

      return () => {
        observer.disconnect();
      };
    }, [handleVisibilityChange, onFetch, items]);

    // TODO fix activities not in order - by date

    return (
      <div>
        <div className={cStyles.moduleHeader}>
          <Icon type={IconType.Comment} size={IconSize.Size20} className={cStyles.moduleIcon} />
          {t('common.actions')}
          {commentCount > 0 && <div className={cStyles.headerCount}>({commentCount})</div>}
          {canEdit && (
            <Button style={ButtonStyle.Icon} title={t('common.addComment')} onClick={openAddComment}>
              <Icon type={IconType.Plus} size={IconSize.Size10} className={cStyles.iconAddButton} />
            </Button>
          )}
          <Button style={ButtonStyle.Icon} title={t('common.toggleComments')} onClick={toggleCommShown} className={cStyles.buttonToggle}>
            <Icon type={commShown ? IconType.Minus : IconType.Plus} size={IconSize.Size10} className={s.icon} />
          </Button>
          <Button style={ButtonStyle.Icon} title={isDetailsVisible && commShown ? t('action.hideDetails') : t('action.showDetails')} onClick={handleToggleDetailsClick} className={s.toggleButton}>
            {isDetailsVisible && commShown ? t('action.hideDetails') : t('action.showDetails')}
          </Button>
        </div>
        <div>
          {commShown && (
            <>
              {canEdit && (
                <CommentEdit
                  ref={commentAddRef}
                  defaultData={{ text: '' }}
                  placeholder={`${t('common.enterComment')} ${t('common.writeCommentHint')}`}
                  commentMode={commentMode}
                  isGithubConnected={isGithubConnected}
                  githubRepo={githubRepo}
                  onUpdate={onCommentCreate}
                  onCurrentUserUpdate={onCurrentUserUpdate}
                >
                  <Button style={ButtonStyle.Default} content={t('common.addComment')} onClick={openAddComment} />
                </CommentEdit>
              )}
              <div className={s.comments}>
                {items.map((item) =>
                  item.type === ActivityTypes.COMMENT_CARD ? (
                    <Item.Comment
                      key={item.id}
                      data={item.data}
                      createdAt={item.createdAt}
                      updatedAt={item.updatedAt}
                      isPersisted={item.isPersisted}
                      user={item.user}
                      canEdit={(item.user.isCurrent && canEdit) || canEditAllComments}
                      commentMode={commentMode}
                      isGithubConnected={isGithubConnected}
                      githubRepo={githubRepo}
                      onUpdate={(data) => handleCommentUpdate(item.id, data)}
                      onDelete={() => handleCommentDelete(item.id)}
                      onCurrentUserUpdate={onCurrentUserUpdate}
                    />
                  ) : (
                    <Item key={item.id} type={item.type} data={item.data} createdAt={item.createdAt} user={item.user} />
                  ),
                )}
              </div>
            </>
          )}
          {isFetching || isDetailsFetching ? <Loader size={LoaderSize.Normal} /> : !isAllFetched && <div ref={visibilityRef} />}
        </div>
      </div>
    );
  },
);

Activities.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isFetching: PropTypes.bool.isRequired,
  isAllFetched: PropTypes.bool.isRequired,
  isDetailsVisible: PropTypes.bool.isRequired,
  isDetailsFetching: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool.isRequired,
  canEditAllComments: PropTypes.bool.isRequired,
  commentMode: PropTypes.string.isRequired,
  isGithubConnected: PropTypes.bool.isRequired,
  githubRepo: PropTypes.string.isRequired,
  commentCount: PropTypes.number.isRequired,
  onFetch: PropTypes.func.isRequired,
  onDetailsToggle: PropTypes.func.isRequired,
  onCommentCreate: PropTypes.func.isRequired,
  onCommentUpdate: PropTypes.func.isRequired,
  onCommentDelete: PropTypes.func.isRequired,
  toggleCommShown: PropTypes.func.isRequired,
  commShown: PropTypes.bool.isRequired,
  onCurrentUserUpdate: PropTypes.func.isRequired,
};

export default Activities;
