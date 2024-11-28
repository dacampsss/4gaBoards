import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import classNames from 'classnames';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../Utils';

import DroppableTypes from '../../constants/DroppableTypes';
import ListContainer from '../../containers/ListContainer';
import CardModalContainer from '../../containers/CardModalContainer';
import BoardActionsContainer from '../../containers/BoardActionsContainer';
import ListAdd from './ListAdd';

import * as s from './Board.module.scss';
import * as gStyles from '../../globalStyles.module.scss';

const parseDndDestination = (dndId) => dndId.split(':');

const Board = React.memo(({ listIds, isCardModalOpened, canEdit, onListCreate, onListMove, onCardMove, onTaskMove }) => {
  const [t] = useTranslation();
  const [isListAddOpened, setIsListAddOpened] = useState(false);
  const wrapper = useRef(null);
  const prevPosition = useRef(null);

  const handleAddListClick = useCallback(() => {
    setIsListAddOpened(true);
  }, []);

  const handleAddListClose = useCallback(() => {
    setIsListAddOpened(false);
  }, []);

  const handleDragEnd = useCallback(
    ({ draggableId, type, source, destination }) => {
      if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
        return;
      }

      const [, id] = parseDndDestination(draggableId);

      switch (type) {
        case DroppableTypes.LIST:
          onListMove(id, destination.index);

          break;
        case DroppableTypes.CARD: {
          const [, listId, indexOverride] = parseDndDestination(destination.droppableId);
          const [, sourceListId] = parseDndDestination(source.droppableId);

          onCardMove(id, listId, (listId === sourceListId ? indexOverride - 1 : indexOverride) || destination.index);

          break;
        }
        case DroppableTypes.TASK: {
          onTaskMove(draggableId, destination.index);

          break;
        }
        default:
      }
    },
    [onListMove, onCardMove, onTaskMove],
  );

  const handleMouseDown = useCallback(
    (event) => {
      if (event.button && event.button !== 0) {
        return;
      }

      if (event.target !== wrapper.current && !event.target.dataset.dragScroller) {
        return;
      }

      event.preventDefault(); // Prevent text selecton when dragging board
      prevPosition.current = event.screenX;

      const selection = window.getSelection();
      if (selection && selection.removeAllRanges) {
        selection.removeAllRanges();
      }
    },
    [wrapper],
  );

  const handleWindowMouseMove = useCallback(
    (event) => {
      if (!prevPosition.current) {
        return;
      }

      wrapper.current.scrollBy({ left: prevPosition.current - event.screenX });
      prevPosition.current = event.screenX;
    },
    [prevPosition],
  );

  const handleWindowMouseUp = useCallback(() => {
    prevPosition.current = null;
  }, [prevPosition]);

  useEffect(() => {
    if (isListAddOpened) {
      wrapper.current.scrollLeft = wrapper.current.scrollWidth;
    }
  }, [listIds, isListAddOpened]);

  useEffect(() => {
    window.addEventListener('mouseup', handleWindowMouseUp);
    window.addEventListener('mousemove', handleWindowMouseMove);

    return () => {
      window.removeEventListener('mouseup', handleWindowMouseUp);
      window.removeEventListener('mousemove', handleWindowMouseMove);
    };
  }, [handleWindowMouseUp, handleWindowMouseMove]);

  return (
    <div className={s.boardContainer}>
      <BoardActionsContainer />
      <div className={s.mainWrapper}>
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <div ref={wrapper} className={classNames(s.wrapper, gStyles.scrollableX)} onMouseDown={handleMouseDown}>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="board" type={DroppableTypes.LIST} direction="horizontal">
              {({ innerRef, droppableProps, placeholder }) => (
                <div
                  {...droppableProps} // eslint-disable-line react/jsx-props-no-spreading
                  data-drag-scroller
                  ref={innerRef}
                  className={classNames(s.lists, gStyles.cursorGrab)}
                >
                  {listIds.map((listId, index) => (
                    <ListContainer key={listId} id={listId} index={index} />
                  ))}
                  {placeholder}
                  {canEdit && (
                    <div data-drag-scroller className={s.list}>
                      {isListAddOpened ? (
                        <ListAdd onCreate={onListCreate} onClose={handleAddListClose} />
                      ) : (
                        <Button style={ButtonStyle.Icon} title={t('common.addList')} onClick={handleAddListClick} className={s.addListButton}>
                          <Icon type={IconType.PlusMath} size={IconSize.Size13} className={s.addListButtonIcon} />
                          <span className={s.addListButtonText}>{t('action.addList')}</span>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
        {isCardModalOpened && <CardModalContainer />}
      </div>
    </div>
  );
});

Board.propTypes = {
  listIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isCardModalOpened: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool.isRequired,
  onListCreate: PropTypes.func.isRequired,
  onListMove: PropTypes.func.isRequired,
  onCardMove: PropTypes.func.isRequired,
  onTaskMove: PropTypes.func.isRequired,
};

export default Board;
