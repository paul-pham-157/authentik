import "#elements/forms/FormGroup";
import "#elements/forms/HorizontalFormElement";
import "#elements/forms/Radio";
import "#elements/forms/SearchSelect/index";

import { DEFAULT_CONFIG } from "#common/api/config";
import { dateTimeLocal } from "#common/temporal";

import { ModelForm } from "#elements/forms/ModelForm";

import { CoreApi, CoreUsersListRequest, IntentEnum, Token, User } from "@goauthentik/api";

import { msg } from "@lit/localize";
import { html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("ak-token-form")
export class TokenForm extends ModelForm<Token, string> {
    @state()
    showExpiry = true;

    async loadInstance(pk: string): Promise<Token> {
        const token = await new CoreApi(DEFAULT_CONFIG).coreTokensRetrieve({
            identifier: pk,
        });
        this.showExpiry = token.expiring || true;
        return token;
    }

    getSuccessMessage(): string {
        return this.instance
            ? msg("Successfully updated token.")
            : msg("Successfully created token.");
    }

    async send(data: Token): Promise<Token> {
        if (this.instance?.identifier) {
            return new CoreApi(DEFAULT_CONFIG).coreTokensUpdate({
                identifier: this.instance.identifier,
                tokenRequest: data,
            });
        }
        return new CoreApi(DEFAULT_CONFIG).coreTokensCreate({
            tokenRequest: data,
        });
    }

    renderExpiry(): TemplateResult {
        return html`<ak-form-element-horizontal label=${msg("Expires on")} name="expires">
            <input
                type="datetime-local"
                data-type="datetime-local"
                value="${dateTimeLocal(this.instance?.expires ?? new Date())}"
                class="pf-c-form-control"
            />
        </ak-form-element-horizontal>`;
    }

    renderForm(): TemplateResult {
        return html` <ak-form-element-horizontal
                label=${msg("Identifier")}
                name="identifier"
                required
            >
                <input
                    type="text"
                    value="${this.instance?.identifier ?? ""}"
                    class="pf-c-form-control pf-m-monospace"
                    autocomplete="off"
                    spellcheck="false"
                    required
                />
                <p class="pf-c-form__helper-text">
                    ${msg("Unique identifier the token is referenced by.")}
                </p>
            </ak-form-element-horizontal>
            <ak-form-element-horizontal label=${msg("User")} required name="user">
                <ak-search-select
                    .fetchObjects=${async (query?: string): Promise<User[]> => {
                        const args: CoreUsersListRequest = {
                            ordering: "username",
                        };
                        if (query !== undefined) {
                            args.search = query;
                        }
                        const users = await new CoreApi(DEFAULT_CONFIG).coreUsersList(args);
                        return users.results;
                    }}
                    .renderElement=${(user: User): string => {
                        return user.username;
                    }}
                    .renderDescription=${(user: User): TemplateResult => {
                        return html`${user.name}`;
                    }}
                    .value=${(user: User | undefined): number | undefined => {
                        return user?.pk;
                    }}
                    .selected=${(user: User): boolean => {
                        return this.instance?.user === user.pk;
                    }}
                >
                </ak-search-select>
            </ak-form-element-horizontal>
            <ak-form-element-horizontal label=${msg("Intent")} required name="intent">
                <ak-radio
                    .options=${[
                        {
                            label: msg("API Token"),
                            value: IntentEnum.Api,
                            default: true,
                            description: html`${msg("Used to access the API programmatically")}`,
                        },
                        {
                            label: msg("App password."),
                            value: IntentEnum.AppPassword,
                            description: html`${msg("Used to login using a flow executor")}`,
                        },
                    ]}
                    .value=${this.instance?.intent}
                >
                </ak-radio>
            </ak-form-element-horizontal>
            <ak-form-element-horizontal label=${msg("Description")} name="description">
                <input
                    type="text"
                    value="${this.instance?.description ?? ""}"
                    class="pf-c-form-control"
                />
            </ak-form-element-horizontal>
            <ak-form-element-horizontal name="expiring">
                <label class="pf-c-switch">
                    <input
                        class="pf-c-switch__input"
                        type="checkbox"
                        ?checked=${this.instance?.expiring ?? true}
                        @change=${(ev: Event) => {
                            const el = ev.target as HTMLInputElement;
                            this.showExpiry = el.checked;
                        }}
                    />
                    <span class="pf-c-switch__toggle">
                        <span class="pf-c-switch__toggle-icon">
                            <i class="fas fa-check" aria-hidden="true"></i>
                        </span>
                    </span>
                    <span class="pf-c-switch__label">${msg("Expiring")}</span>
                </label>
                <p class="pf-c-form__helper-text">
                    ${msg(
                        "If this is selected, the token will expire. Upon expiration, the token will be rotated.",
                    )}
                </p>
            </ak-form-element-horizontal>
            ${this.showExpiry ? this.renderExpiry() : html``}`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "ak-token-form": TokenForm;
    }
}
