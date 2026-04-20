/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH under
 * one or more contributor license agreements. See the NOTICE file distributed
 * with this work for additional information regarding copyright ownership.
 * Licensed under the Camunda License 1.0. You may not use this file
 * except in compliance with the Camunda License 1.0.
 */

import {Field} from 'react-final-form';
import {observer} from 'mobx-react';
import {Title, WarningFilled} from 'modules/components/FiltersPanel/styled';
import {CheckmarkOutline} from '@carbon/react/icons';
import {Checkbox} from 'modules/components/Checkbox';
import {useLocalization} from 'modules/i18n';

const InstancesStatesFormGroup: React.FC = observer(() => {
  const {t} = useLocalization();
  return (
    <div>
      <Title>{t('Instances States')}</Title>
      <Field name="evaluated" component="input" type="checkbox">
        {({input}) => (
          <Checkbox
            input={input}
            labelText={t('Evaluated')}
            Icon={CheckmarkOutline}
          />
        )}
      </Field>
      <Field name="failed" component="input" type="checkbox">
        {({input}) => (
          <Checkbox input={input} labelText={t('Failed')} Icon={WarningFilled} />
        )}
      </Field>
    </div>
  );
});

export {InstancesStatesFormGroup};
