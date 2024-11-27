import upperFirst from 'lodash/upperFirst';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, Icon, IconType, IconSize } from '../Utils';

import * as s from './DueDate.module.scss';

const VARIANTS = {
  CARD: 'card',
  CARDMODAL: 'cardModal',
  TASKS_CARD: 'tasksCard',
};

const getDueStyle = (value) => {
  const msPerDay = 1000 * 60 * 60 * 24;
  const currDate = new Date();
  const utc1 = Date.UTC(value.getFullYear(), value.getMonth(), value.getDate());
  const utc2 = Date.UTC(currDate.getFullYear(), currDate.getMonth(), currDate.getDate());
  const diff = (utc2 - utc1) / msPerDay;

  if (diff >= -14 && diff <= 0) {
    return 'Close';
  }
  if (diff > 0) {
    return 'Over';
  }
  return 'Normal';
};

// TODO remove old onClick and Button variant
const DueDate = React.memo(({ value, variant, isDisabled, titlePrefix, iconSize, className, onClick }) => {
  const [t] = useTranslation();
  const [dueStyle, setDueStyle] = useState('Normal');

  useEffect(() => {
    if (value) {
      setDueStyle(getDueStyle(value));
    }
  }, [value]);

  const titlePrefixString = titlePrefix ? `${titlePrefix} ` : '';

  const contentNode = value && (
    <span className={classNames(s.wrapper, s[`wrapper${upperFirst(variant)}`], s[`due${dueStyle}`], className)} title={`${titlePrefixString}${t(`format:date`, { value, postProcess: 'formatDate' })}`}>
      {variant !== VARIANTS.TASKS_CARD && t(`format:date`, { value, postProcess: 'formatDate' })}
      {variant === VARIANTS.TASKS_CARD && <Icon type={IconType.Calendar} size={iconSize} className={s[`due${dueStyle}`]} />}
    </span>
  );

  return onClick ? (
    <Button title={t('common.editDueDate')} onClick={onClick} disabled={isDisabled} className={s.button}>
      {contentNode}
    </Button>
  ) : (
    contentNode
  );
});

DueDate.propTypes = {
  value: PropTypes.instanceOf(Date),
  variant: PropTypes.oneOf(Object.values(VARIANTS)),
  isDisabled: PropTypes.bool,
  titlePrefix: PropTypes.string,
  iconSize: PropTypes.oneOf(Object.values(IconSize)),
  className: PropTypes.string,
  onClick: PropTypes.func,
};

DueDate.defaultProps = {
  value: undefined,
  variant: VARIANTS.CARDMODAL,
  isDisabled: false,
  titlePrefix: undefined,
  iconSize: IconSize.Size13,
  className: undefined,
  onClick: undefined,
};

export default DueDate;
