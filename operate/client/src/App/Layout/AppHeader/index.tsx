/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH under
 * one or more contributor license agreements. See the NOTICE file distributed
 * with this work for additional information regarding copyright ownership.
 * Licensed under the Camunda License 1.0. You may not use this file
 * except in compliance with the Camunda License 1.0.
 */

import {useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {Link} from 'react-router-dom';
import {ArrowRight} from '@carbon/react/icons';
import {Select, SelectItem} from '@carbon/react';
import {C3Navigation} from '@camunda/camunda-composite-components';
import {Locations, Paths} from 'modules/Routes';
import {tracking} from 'modules/tracking';
import {authenticationStore} from 'modules/stores/authentication';
import {useCurrentPage} from '../useCurrentPage';
import {licenseTagStore} from 'modules/stores/licenseTag';
import {currentTheme} from 'modules/stores/currentTheme';
import {useCurrentUser} from 'modules/queries/useCurrentUser';
import {isForbidden} from 'modules/auth/isForbidden';
import {languageItems, useLocalization} from 'modules/i18n';

function getInfoSidebarItems(isPaidPlan: boolean, t: (key: string) => string) {
  const BASE_INFO_SIDEBAR_ITEMS = [
    {
      key: 'docs',
      label: t('header.info.documentation'),
      onClick: () => {
        tracking.track({
          eventName: 'info-bar',
          link: 'documentation',
        });

        window.open('https://docs.camunda.io/', '_blank');
      },
    },
    {
      key: 'academy',
      label: t('header.info.academy'),
      onClick: () => {
        tracking.track({
          eventName: 'info-bar',
          link: 'academy',
        });

        window.open('https://academy.camunda.com/', '_blank');
      },
    },
  ];
  const FEEDBACK_AND_SUPPORT_ITEM = {
    key: 'feedbackAndSupport',
    label: t('header.info.feedbackSupport'),
    onClick: () => {
      tracking.track({
        eventName: 'info-bar',
        link: 'feedback',
      });

      window.open('https://jira.camunda.com/projects/SUPPORT/queues', '_blank');
    },
  } as const;
  const COMMUNITY_FORUM_ITEM = {
    key: 'communityForum',
    label: t('header.info.community'),
    onClick: () => {
      tracking.track({
        eventName: 'info-bar',
        link: 'forum',
      });

      window.open('https://forum.camunda.io', '_blank');
    },
  };

  return isPaidPlan
    ? [
        ...BASE_INFO_SIDEBAR_ITEMS,
        FEEDBACK_AND_SUPPORT_ITEM,
        COMMUNITY_FORUM_ITEM,
      ]
    : [...BASE_INFO_SIDEBAR_ITEMS, COMMUNITY_FORUM_ITEM];
}

type LanguageSelectorProps = {
  label: string;
  currentLanguage: string;
  onChangeLanguage: (language: string) => void;
};

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  label,
  currentLanguage,
  onChangeLanguage,
}) => (
  <Select
    id="operate-language-selector"
    size="sm"
    labelText={label}
    value={currentLanguage}
    onChange={(event) => onChangeLanguage(event.target.value)}
  >
    {languageItems.map(({id, label: languageLabel}) => (
      <SelectItem key={id} text={languageLabel} value={id} />
    ))}
  </Select>
);

const AppHeader: React.FC = observer(() => {
  const {t, language, changeLanguage} = useLocalization();
  const {data: currentUser} = useCurrentUser();
  const IS_SAAS = typeof window.clientConfig?.organizationId === 'string';
  const {currentPage} = useCurrentPage();
  const {theme, changeTheme} = currentTheme;
  const [isAppBarOpen, setIsAppBarOpen] = useState(false);

  useEffect(() => {
    if (currentUser !== undefined) {
      tracking.identifyUser({
        username: currentUser.username,
        salesPlanType: currentUser.salesPlanType,
        roles: currentUser.roles,
      });
    }
  }, [currentUser]);

  useEffect(() => {
    licenseTagStore.fetchLicense();

    return licenseTagStore.reset;
  }, []);

  return (
    <C3Navigation
      toggleAppbar={(isAppBarOpen) => setIsAppBarOpen(isAppBarOpen)}
      notificationSideBar={IS_SAAS ? {} : undefined}
      appBar={{
        ariaLabel: t('header.aria.appPanel'),
        isOpen: isAppBarOpen,
        elementClicked: (app: string) => {
          tracking.track({
            eventName: 'app-switcher-item-clicked',
            app,
          });
        },
        appTeaserRouteProps: IS_SAAS ? {} : undefined,
        elements: IS_SAAS ? undefined : [],
      }}
      app={{
        ariaLabel: 'Camunda Operate',
        name: t('header.app.name'),
        routeProps: {
          to: Paths.dashboard(),
          onClick: () => {
            tracking.track({
              eventName: 'navigation',
              link: 'header-logo',
            });
          },
        },
      }}
      forwardRef={Link}
      navbar={{
        elements: isForbidden(currentUser)
          ? []
          : [
              {
                key: 'dashboard',
                label: t('header.nav.dashboard'),
                isCurrentPage: currentPage === 'dashboard',
                routeProps: {
                  to: Paths.dashboard(),
                  onClick: () => {
                    tracking.track({
                      eventName: 'navigation',
                      link: 'header-dashboard',
                      currentPage,
                    });
                  },
                },
              },
              {
                key: 'processes',
                label: t('header.nav.processes'),
                isCurrentPage: currentPage === 'processes',
                routeProps: {
                  to: Locations.processes(),
                  state: {refreshContent: true, hideOptionalFilters: true},
                  onClick: () => {
                    tracking.track({
                      eventName: 'navigation',
                      link: 'header-processes',
                      currentPage,
                    });
                  },
                },
              },
              {
                key: 'decisions',
                label: t('header.nav.decisions'),
                isCurrentPage: currentPage === 'decisions',
                routeProps: {
                  to: Locations.decisions(),
                  state: {refreshContent: true, hideOptionalFilters: true},
                  onClick: () => {
                    tracking.track({
                      eventName: 'navigation',
                      link: 'header-decisions',
                      currentPage,
                    });
                  },
                },
              },
            ],
        licenseTag: {
          show: licenseTagStore.state.isTagVisible,
          isProductionLicense: licenseTagStore.state.isProductionLicense,
          isCommercial: licenseTagStore.state.isCommercial,
          expiresAt: licenseTagStore.state.expiresAt,
        },
      }}
      infoSideBar={{
        isOpen: false,
        ariaLabel: t('header.info.aria'),
        elements: getInfoSidebarItems(
          typeof currentUser?.salesPlanType === 'string' &&
            ['paid-cc', 'enterprise'].includes(currentUser.salesPlanType),
          t,
        ),
      }}
      userSideBar={{
        ariaLabel: t('header.user.settingsAria'),
        version: import.meta.env.VITE_VERSION,
        customElements: {
          customSection: (
            <LanguageSelector
              label={t('header.language.label')}
              currentLanguage={language}
              onChangeLanguage={changeLanguage}
            />
          ),
          profile: {
            label: t('header.user.profile'),
            user: {
              name: currentUser?.displayName ?? '',
              email: currentUser?.email ?? '',
            },
          },
          themeSelector: {
            currentTheme: theme,
            onChange: (theme: string) => {
              changeTheme(theme as 'system' | 'dark' | 'light');
            },
          },
        },
        elements: [
          ...(window.Osano?.cm === undefined
            ? []
            : [
                {
                  key: 'cookie',
                  label: t('header.user.cookiePreferences'),
                  onClick: () => {
                    tracking.track({
                      eventName: 'user-side-bar',
                      link: 'cookies',
                    });

                    window.Osano?.cm?.showDrawer(
                      'osano-cm-dom-info-dialog-open',
                    );
                  },
                },
              ]),
          {
            key: 'terms',
            label: t('header.user.terms'),
            onClick: () => {
              tracking.track({
                eventName: 'user-side-bar',
                link: 'terms-conditions',
              });

              window.open(
                'https://camunda.com/legal/terms/camunda-platform/camunda-platform-8-saas-trial/',
                '_blank',
              );
            },
          },
          {
            key: 'privacy',
            label: t('header.user.privacy'),
            onClick: () => {
              tracking.track({
                eventName: 'user-side-bar',
                link: 'privacy-policy',
              });

              window.open('https://camunda.com/legal/privacy/', '_blank');
            },
          },
          {
            key: 'imprint',
            label: t('header.user.imprint'),
            onClick: () => {
              tracking.track({
                eventName: 'user-side-bar',
                link: 'imprint',
              });

              window.open('https://camunda.com/legal/imprint/', '_blank');
            },
          },
        ],
        bottomElements: window.clientConfig?.canLogout
          ? [
              {
                key: 'logout',
                label: t('header.user.logout'),
                renderIcon: ArrowRight,
                kind: 'ghost',
                onClick: authenticationStore.handleLogout,
              },
            ]
          : undefined,
      }}
    />
  );
});

export {AppHeader};
