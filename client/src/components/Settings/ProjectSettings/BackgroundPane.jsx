import { dequal } from 'dequal';
import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, ButtonStyle, Icon, IconType, IconSize, FilePicker } from '../../Utils';
import ProjectBackgroundGradients from '../../../constants/ProjectBackgroundGradients';
import { ProjectBackgroundTypes } from '../../../constants/Enums';

import * as styles from './BackgroundPane.module.scss';
import * as globalStyles from '../../../styles.module.scss';

const BackgroundPane = React.memo(({ item, imageCoverUrl, isImageUpdating, onUpdate, onImageUpdate, onImageDelete }) => {
  const [t] = useTranslation();

  const field = useRef(null);

  const handleGradientClick = useCallback(
    (event) => {
      const background = {
        type: ProjectBackgroundTypes.GRADIENT,
        name: event.target.value,
      };

      if (!dequal(background, item)) {
        onUpdate(background);
      }
    },
    [item, onUpdate],
  );

  const handleImageClick = useCallback(() => {
    const background = {
      type: ProjectBackgroundTypes.IMAGE,
    };

    if (!dequal(background, item)) {
      onUpdate(background);
    }
  }, [item, onUpdate]);

  const handleFileSelect = useCallback(
    (file) => {
      onImageUpdate({
        file,
      });
    },
    [onImageUpdate],
  );

  const handleDeleteImageClick = useCallback(() => {
    onImageDelete();
  }, [onImageDelete]);

  const handleRemoveClick = useCallback(() => {
    onUpdate(null);
  }, [onUpdate]);

  useEffect(() => {
    field.current.focus();
  }, []);

  return (
    <>
      <div className={styles.gradientButtons}>
        {ProjectBackgroundGradients.map((gradient) => (
          <Button
            style={ButtonStyle.NoBackground}
            key={gradient}
            name="gradient"
            value={gradient}
            className={classNames(
              styles.gradientButton,
              item && item.type === ProjectBackgroundTypes.GRADIENT && gradient === item.name && styles.gradientButtonActive,
              globalStyles[`background${upperFirst(camelCase(gradient))}`],
            )}
            onClick={handleGradientClick}
          />
        ))}
      </div>
      {imageCoverUrl && (
        <Button ref={field} title={t('common.background')} onClick={handleImageClick} className={styles.imageButton}>
          <div className={styles.imageContainer}>
            <img src={imageCoverUrl} alt={t('common.background')} className={styles.image} />
            {item && item.type === 'image' && (
              <div className={styles.imageSelected}>
                <Icon type={IconType.Star} size={IconSize.Size14} className={styles.imageIcon} />
              </div>
            )}
          </div>
        </Button>
      )}
      <div className={styles.actions}>
        <div className={styles.action}>
          <FilePicker accept="image/*" onSelect={handleFileSelect}>
            <Button style={ButtonStyle.DefaultBorder} ref={field} content={t('action.uploadNewImage', { context: 'title' })} disabled={isImageUpdating} />
          </FilePicker>
        </div>
        {imageCoverUrl && (
          <div className={styles.action}>
            <Button style={ButtonStyle.DefaultBorder} content={t('action.deleteImage', { context: 'title' })} disabled={isImageUpdating} onClick={handleDeleteImageClick} />
          </div>
        )}
        {item && (
          <div className={styles.action}>
            <Button style={ButtonStyle.DefaultBorder} content={t('action.removeBackground', { context: 'title' })} disabled={isImageUpdating} onClick={handleRemoveClick} />
          </div>
        )}
      </div>
    </>
  );
});

BackgroundPane.propTypes = {
  item: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  imageCoverUrl: PropTypes.string,
  isImageUpdating: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onImageUpdate: PropTypes.func.isRequired,
  onImageDelete: PropTypes.func.isRequired,
};

BackgroundPane.defaultProps = {
  item: undefined,
  imageCoverUrl: undefined,
};

export default BackgroundPane;
