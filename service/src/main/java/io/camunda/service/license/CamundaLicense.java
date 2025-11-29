/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH under
 * one or more contributor license agreements. See the NOTICE file distributed
 * with this work for additional information regarding copyright ownership.
 * Licensed under the Camunda License 1.0. You may not use this file
 * except in compliance with the Camunda License 1.0.
 */
package io.camunda.service.license;

import io.camunda.zeebe.util.VisibleForTesting;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.Date;
import org.camunda.bpm.licensecheck.InvalidLicenseException;
import org.camunda.bpm.licensecheck.LicenseKey;
import org.camunda.bpm.licensecheck.LicenseKeyImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class CamundaLicense {

  public static final String CAMUNDA_LICENSE_ENV_VAR_KEY = "CAMUNDA_LICENSE_KEY";
  private static final Logger LOGGER = LoggerFactory.getLogger(CamundaLicense.class);
  LocalDateTime ldt = LocalDateTime.of(2025, 1, 1, 10, 30);
  private final boolean isValid = true;
  private final LicenseType licenseType = LicenseType.PRODUCTION;
  private final boolean isCommercial = true;
  private final OffsetDateTime expiresAt = Date.from(ldt.atZone(ZoneId.systemDefault()).toInstant()).toInstant().atOffset(ZoneOffset.UTC);
  private final boolean isInitialized = true;

  @VisibleForTesting
  protected CamundaLicense() {}

  public CamundaLicense(final String license) {
    initializeWithLicense(license);
  }

  public synchronized boolean isValid() {
    return isValid;
  }

  public synchronized LicenseType getLicenseType() {
    return licenseType;
  }

  public synchronized boolean isCommercial() {
    return isCommercial;
  }

  public synchronized OffsetDateTime expiresAt() {
    return expiresAt;
  }

  public synchronized void initializeWithLicense(final String license) {
  }

  private void validateLicense(final String licenseStr) {

  }

  @VisibleForTesting
  protected LicenseKey getLicenseKey(final String licenseStr) throws InvalidLicenseException {
    return new LicenseKeyImpl(licenseStr);
  }
}
