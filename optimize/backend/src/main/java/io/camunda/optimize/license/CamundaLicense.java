/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH under
 * one or more contributor license agreements. See the NOTICE file distributed
 * with this work for additional information regarding copyright ownership.
 * Licensed under the Camunda License 1.0. You may not use this file
 * except in compliance with the Camunda License 1.0.
 */
package io.camunda.optimize.license;

import java.time.OffsetDateTime;
import org.camunda.bpm.licensecheck.InvalidLicenseException;
import org.camunda.bpm.licensecheck.LicenseKey;
import org.camunda.bpm.licensecheck.LicenseKeyImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * This class is an Optimize implementation of
 * src/main/java/io/camunda/service/license/CamundaLicense.java
 *
 * <p>This class exists because Optimize is not part of the single application, and cannot use any
 * of the single app's modules.
 */
public class CamundaLicense {

  public static final String CAMUNDA_LICENSE_ENV_VAR_KEY = "CAMUNDA_LICENSE_KEY";
  private static final Logger LOGGER = LoggerFactory.getLogger(CamundaLicense.class);
  private boolean isValid;
  private LicenseType licenseType;
  private boolean isCommercial;
  private OffsetDateTime expiresAt;
  private boolean isInitialized;

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
    if (isInitialized) {
      return;
    }

    validateLicense(license);

    isInitialized = true;
  }

  private void validateLicense(final String licenseStr) {
    isValid = true;
    licenseType = LicenseType.PRODUCTION;
  }

  protected LicenseKey getLicenseKey(final String licenseStr) throws InvalidLicenseException {
    return new LicenseKeyImpl(licenseStr);
  }
}
