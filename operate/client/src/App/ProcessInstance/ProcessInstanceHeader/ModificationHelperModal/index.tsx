/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH under
 * one or more contributor license agreements. See the NOTICE file distributed
 * with this work for additional information regarding copyright ownership.
 * Licensed under the Camunda License 1.0. You may not use this file
 * except in compliance with the Camunda License 1.0.
 */

import {observer} from 'mobx-react';

import {
  ModificationType,
  Modification,
  AddIcon,
  CancelIcon,
  MoveIcon,
  DiagramLight,
  DiagramDark,
  Container,
  Modifications,
} from './styled';
import {currentTheme} from 'modules/stores/currentTheme';
import {HelperModal} from 'modules/components/HelperModal';
import {useLocalization} from 'modules/i18n';

const localStorageKey = 'hideModificationHelperModal';

type Props = {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

const ModificationHelperModal: React.FC<Props> = observer(
  ({isVisible, onClose, onSubmit}) => {
    const {t} = useLocalization();
    return (
      <HelperModal
        title={t('Process Instance Modification Mode')}
        localStorageKey={localStorageKey}
        onClose={onClose}
        open={isVisible}
        onSubmit={onSubmit}
      >
        <Container>
          <p>
            {t(
              'Process instance modification mode allows you to plan multiple modifications on a process instance.',
            )}
          </p>
          <p>
            {t(
              'By clicking on a flow node, you can select one of following modifications if applicable:',
            )}
          </p>
          <Modifications>
            <Modification>
              <ModificationType>
                {t('Add')} <AddIcon />
              </ModificationType>
              {t('a single flow node instance')}
            </Modification>
            <Modification>
              <ModificationType>
                {t('Cancel')} <CancelIcon />
              </ModificationType>
              {t('all running flow node instances')}
            </Modification>
            <Modification>
              <ModificationType>
                {t('Move')} <MoveIcon />
              </ModificationType>
              {t(
                'all the running instances to a different target flow node in the diagram',
              )}
            </Modification>
          </Modifications>
          <p>
            {t(
              'Additionally, you add/edit variables by selecting the flow node scope in the Instance History panel.',
            )}
          </p>
          <p>
            {t(
              'A summary of all planned modifications will be shown after clicking on “Apply Modifications”. The modification will be applied after the confirmation of the summary.',
            )}
          </p>
          {currentTheme.theme === 'light' ? <DiagramLight /> : <DiagramDark />}
        </Container>
      </HelperModal>
    );
  },
);

export {ModificationHelperModal};
