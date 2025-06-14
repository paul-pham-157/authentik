---
title: Integrate with TrueNAS TrueCommand
sidebar_label: TrueNAS TrueCommand
support_level: community
---

## What is TrueNAS TrueCommand

> TrueCommand is a ZFS-aware solution allowing you to set custom alerts on statistics like ARC usage or pool capacity and ensuring storage uptime and future planning. TrueCommand also identifies and pinpoints errors on drives or vdevs (RAID groups), saving you valuable time when resolving issues.
>
> -- https://www.truenas.com/truecommand/

:::caution
This setup assumes you will be using HTTPS as TrueCommand generates ACS and Redirect URLs based on the complete URL.
:::

## Preparation

The following placeholders are used in this guide:

- `truecommand.company` is the FQDN of the snipe-it installation.
- `authentik.company` is the FQDN of the authentik installation.

:::note
This documentation lists only the settings that you need to change from their default values. Be aware that any changes other than those explicitly mentioned in this guide could cause issues accessing your application.
:::

## authentik configuration

To support the integration of TrueCommand with authentik, you need to create an application/provider pair in authentik.

### Create property mappings

1. Log in to authentik as an administrator and open the authentik Admin interface.
2. Navigate to **Customization** > **Property Mappings** and click **Create**. Create create three or five **SAML Provider Property Mapping**s, depending on your setup, with the following settings:
    - **Username Mapping:**
        - **Name**: Choose a descriptive name
        - **SAML Attribute Name**: `unique_name`
        - **Friendly Name**: Leave blank
        - **Expression**: `return request.user.username`
    - **Email Mapping:**
        - **Name**: Choose a descriptive name
        - **SAML Attribute Name**: `email`
        - **Friendly Name**: Leave blank
        - **Expression**: `return request.user.email`
    - **Name Mapping:**
        - **Name**: Choose a descriptive name
        - **SAML Attribute Name**: `given_name` or display_name
        - **Friendly Name**: Leave blank
        - **Expression**: `return request.user.name`
    - **Title Mapping:**
        - **Name**: Choose a descriptive name
        - **SAML Attribute Name**: `title`
        - **Friendly Name**: Leave blank
        - **Expression**: `return [custom_attribute]`
    - **Telephone Number Mapping:**
        - **Name**: Choose a descriptive name
        - **SAML Attribute Name**: `telephone_number`
        - **Friendly Name**: Leave blank
        - **Expression**: `return [custom_attribute]`

### Create an application and provider in authentik

1. Log in to authentik as an administrator and open the authentik Admin interface.
2. Navigate to **Applications** > **Applications** and click **Create with Provider** to create an application and provider pair. (Alternatively you can first create a provider separately, then create the application and connect it with the provider.)

- **Application**: provide a descriptive name, an optional group for the type of application, the policy engine mode, and optional UI settings. Take note of the **slug** as it will be required later.
- **Choose a Provider type**: select **SAML Provider** as the provider type.
- **Configure the Provider**: provide a name (or accept the auto-provided name), the authorization flow to use for this provider, and the following required configurations.
    - Set the **ACS URL** to `https://truecommand.company/saml/acs`.
    - Set the **Issuer** to `truecommand-saml`.
    - Set the **Service Provider Binding** to `Post`.
    - Under **Advanced protocol settings**, add the three or five **Property Mappings** you created in the previous section, then set the **NameID Property Mapping** to be based on the user's email. Finally, select an available signing certificate.
- **Configure Bindings** _(optional)_: you can create a [binding](/docs/add-secure-apps/flows-stages/bindings/) (policy, group, or user) to manage the listing and access to applications on a user's **My applications** page.

3. Click **Submit** to save the new application and provider.

4. Navigate to **Applications** > **Providers** > **_Provider_**, then click **Copy download URL** to save the **metadata URL** to your clipboard.

## TrueCommand configuration

- Click on the gear icon in the upper right corner.
- Select Administration
- Click on CONFIGURE
- SAML Identity Provider URL: `Paste the Metadata URL from your clipboard.`
- Click _Save_, then click _Configure_ again then select _Start the SAML service_, then click _Save_ to start the service.

## Additional Resources

- https://www.truenas.com/docs/truecommand/administration/settings/samlad/
