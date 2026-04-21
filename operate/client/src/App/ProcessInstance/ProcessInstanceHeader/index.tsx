/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH under
 * one or more contributor license agreements. See the NOTICE file distributed
 * with this work for additional information regarding copyright ownership.
 * Licensed under the Camunda License 1.0. You may not use this file
 * except in compliance with the Camunda License 1.0.
 */

import isNil from 'lodash/isNil';
import {formatDate} from 'modules/utils/date';
import {ProcessInstanceOperations} from './ProcessInstanceOperations';
import {getProcessDefinitionName} from 'modules/utils/instance';
import {Link} from 'modules/components/Link';
import {Locations, Paths} from 'modules/Routes';
import {panelStatesStore} from 'modules/stores/panelStates';
import {tracking} from 'modules/tracking';
import {InstanceHeader} from 'modules/components/InstanceHeader';
import {Skeleton} from 'modules/components/InstanceHeader/Skeleton';
import {VersionTag} from './styled';
import {useProcessDefinitionKeyContext} from 'App/Processes/ListView/processDefinitionKeyContext';
import {useProcessInstanceXml} from 'modules/queries/processDefinitions/useProcessInstanceXml';
import {hasCalledProcessInstances} from 'modules/bpmn-js/utils/hasCalledProcessInstances';
import {type ProcessInstance} from '@camunda/camunda-api-zod-schemas/8.8';
import {useAvailableTenants} from 'modules/queries/useAvailableTenants';
import {useLocalization} from 'modules/i18n';

type Props = {
  processInstance: ProcessInstance;
};

const ProcessInstanceHeader: React.FC<Props> = ({processInstance}) => {
  const {t} = useLocalization();
  const headerColumns = [
    t('Process Name'),
    t('Process Instance Key'),
    t('Version'),
    t('Version Tag'),
    t('Tenant'),
    t('Start Date'),
    t('End Date'),
    t('Parent Process Instance Key'),
    t('Called Process Instances'),
  ] as const;
  const skeletonColumns: {name: (typeof headerColumns)[number]; skeletonWidth: string}[] = [
    {
      name: t('Process Name'),
      skeletonWidth: '94px',
    },
    {
      name: t('Process Instance Key'),
      skeletonWidth: '136px',
    },
    {
      name: t('Version'),
      skeletonWidth: '34px',
    },
    {
      name: t('Start Date'),
      skeletonWidth: '142px',
    },
    {
      name: t('End Date'),
      skeletonWidth: '142px',
    },
    {
      name: t('Parent Process Instance Key'),
      skeletonWidth: '142px',
    },
    {
      name: t('Called Process Instances'),
      skeletonWidth: '142px',
    },
  ] as const;
  const {
    processInstanceKey,
    processDefinitionVersion,
    processDefinitionVersionTag,
    tenantId,
    startDate,
    endDate,
    parentProcessInstanceKey,
    state,
    hasIncident,
    processDefinitionId,
  } = processInstance;
  const tenantsById = useAvailableTenants();
  const tenantName = tenantsById[tenantId] ?? tenantId;

  const isMultiTenancyEnabled = window.clientConfig?.multiTenancyEnabled;

  const processDefinitionKey = useProcessDefinitionKeyContext();
  const {isPending, data: processInstanceXmlData} = useProcessInstanceXml({
    processDefinitionKey,
  });

  if (processInstance === null || isPending) {
    return <Skeleton headerColumns={skeletonColumns} />;
  }

  const versionColumnTitle = `View process "${getProcessDefinitionName(
    processInstance,
  )} version ${processDefinitionVersion}" instances${
    isMultiTenancyEnabled ? ` - ${tenantName}` : ''
  }`;
  const hasVersionTag = !isNil(processDefinitionVersionTag);
  const processInstanceState = hasIncident ? 'INCIDENT' : state;

  return (
    <InstanceHeader
      state={processInstanceState}
      hideBottomBorder={hasIncident}
      headerColumns={headerColumns.filter((name) => {
        if (name === t('Tenant')) {
          return isMultiTenancyEnabled;
        }
        if (name === t('Version Tag')) {
          return hasVersionTag;
        }
        return true;
      })}
      bodyColumns={[
        {
          title: getProcessDefinitionName(processInstance),
          content: getProcessDefinitionName(processInstance),
        },
        {title: processInstanceKey, content: processInstanceKey},
        {
          hideOverflowingContent: false,
          content: (
            <Link
              to={Locations.processes({
                version: processDefinitionVersion?.toString(),
                process: processDefinitionId,
                active: true,
                incidents: true,
                ...(isMultiTenancyEnabled
                  ? {
                      tenant: tenantId,
                    }
                  : {}),
              })}
              title={versionColumnTitle}
              aria-label={versionColumnTitle}
              onClick={() => {
                tracking.track({
                  eventName: 'navigation',
                  link: 'process-details-version',
                });
              }}
            >
              {processDefinitionVersion}
            </Link>
          ),
        },
        ...(hasVersionTag
          ? [
              {
                title: t('User-defined label identifying a definition.'),
                content: (
                  <VersionTag size="sm" type="outline">
                    {processDefinitionVersionTag}
                  </VersionTag>
                ),
              },
            ]
          : []),
        ...(isMultiTenancyEnabled
          ? [
              {
                title: tenantName,
                content: tenantName,
              },
            ]
          : []),
        {
          title: formatDate(startDate) ?? '--',
          content: formatDate(startDate),
          dataTestId: 'start-date',
        },
        {
          title: formatDate(endDate ?? null) ?? '--',
          content: formatDate(endDate ?? null),
          dataTestId: 'end-date',
        },
        {
          title: parentProcessInstanceKey ?? t('None'),
          hideOverflowingContent: false,
          content: (
            <>
              {parentProcessInstanceKey ? (
                <Link
                  to={Paths.processInstance(parentProcessInstanceKey)}
                  title={`${t('View parent instance')} ${parentProcessInstanceKey}`}
                  aria-label={`${t('View parent instance')} ${parentProcessInstanceKey}`}
                  onClick={() => {
                    tracking.track({
                      eventName: 'navigation',
                      link: 'process-details-parent-details',
                    });
                  }}
                >
                  {parentProcessInstanceKey}
                </Link>
              ) : (
                t('None')
              )}
            </>
          ),
        },
        {
          hideOverflowingContent: false,
          content: (
            <>
              {hasCalledProcessInstances(
                Object.values(processInstanceXmlData?.businessObjects ?? {}),
              ) ? (
                <Link
                  to={Locations.processes({
                    parentInstanceId: processInstanceKey,
                    active: true,
                    incidents: true,
                    canceled: true,
                    completed: true,
                  })}
                  onClick={() => {
                    panelStatesStore.expandFiltersPanel();
                    tracking.track({
                      eventName: 'navigation',
                      link: 'process-details-called-instances',
                    });
                  }}
                  title={t('View all called instances')}
                  aria-label={t('View all called instances')}
                >
                  {t('View All')}
                </Link>
              ) : (
                t('None')
              )}
            </>
          ),
        },
      ]}
      additionalContent={
        <ProcessInstanceOperations processInstance={processInstance} />
      }
    />
  );
};

export {ProcessInstanceHeader};
