import React, { useCallback, useEffect, useState, useRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import TextareaAutosize from 'react-textarea-autosize';
import { TextArea } from 'semantic-ui-react';

import { useField } from '../../hooks';

import styles from './NameField.module.scss';

const NameField = React.forwardRef(({ children, defaultValue, onUpdate }, ref) => {
  const [isOpened, setIsOpened] = useState(false);
  const [value, handleFieldChange, setValue, handleFocus] = useField(defaultValue);
  const field = useRef(null);

  const open = useCallback(() => {
    setIsOpened(true);
    setValue(defaultValue);
  }, [defaultValue, setValue]);

  const close = useCallback(() => {
    setIsOpened(false);
    setValue(null);
  }, [setValue]);

  const submit = useCallback(() => {
    const cleanValue = value.trim();

    if (cleanValue && cleanValue !== defaultValue) {
      onUpdate(cleanValue);
    }

    close();
  }, [defaultValue, onUpdate, value, close]);

  useImperativeHandle(
    ref,
    () => ({
      open,
      close,
    }),
    [open, close],
  );

  const handleKeyDown = useCallback(
    (event) => {
      switch (event.key) {
        case 'Enter':
          event.preventDefault();
          submit();
          break;
        case 'Escape':
          close();
          break;
        default:
      }
    },
    [close, submit],
  );

  const handleFieldBlur = useCallback(() => {
    submit();
  }, [submit]);

  useEffect(() => {
    if (isOpened) {
      field.current.focus();
    }
  }, [isOpened]);

  if (!isOpened) {
    return children;
  }

  return (
    <TextArea
      ref={field}
      as={TextareaAutosize}
      spellCheck
      value={value}
      className={styles.field}
      onKeyDown={handleKeyDown}
      onChange={handleFieldChange}
      onBlur={handleFieldBlur}
      onFocus={handleFocus}
    />
  );
});

NameField.propTypes = {
  children: PropTypes.element.isRequired,
  defaultValue: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default React.memo(NameField);
