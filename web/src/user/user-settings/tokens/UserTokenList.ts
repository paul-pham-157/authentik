import "#components/ak-status-label";
import "#elements/buttons/Dropdown";
import "#elements/buttons/ModalButton";
import "#elements/buttons/TokenCopyButton/index";
import "#elements/forms/DeleteBulkForm";
import "#elements/forms/ModalForm";
import "#user/user-settings/tokens/UserTokenForm";
import "@patternfly/elements/pf-tooltip/pf-tooltip.js";

import { DEFAULT_CONFIG } from "#common/api/config";
import { intentToLabel } from "#common/labels";
import { formatElapsedTime } from "#common/temporal";
import { me } from "#common/users";

import { PaginatedResponse, Table, TableColumn } from "#elements/table/Table";

import { CoreApi, IntentEnum, Token } from "@goauthentik/api";

import { msg } from "@lit/localize";
import { CSSResult, html, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

import PFDescriptionList from "@patternfly/patternfly/components/DescriptionList/description-list.css";

@customElement("ak-user-token-list")
export class UserTokenList extends Table<Token> {
    searchEnabled(): boolean {
        return true;
    }

    expandable = true;
    checkbox = true;
    clearOnRefresh = true;

    @property()
    order = "expires";

    async apiEndpoint(): Promise<PaginatedResponse<Token>> {
        return new CoreApi(DEFAULT_CONFIG).coreTokensList({
            ...(await this.defaultEndpointConfig()),
            managed: "",
            // The user might have access to other tokens that aren't for their user
            // but only show tokens for their user here
            userUsername: (await me()).user.username,
        });
    }

    columns(): TableColumn[] {
        return [new TableColumn(msg("Identifier"), "identifier"), new TableColumn("")];
    }

    static styles: CSSResult[] = [...super.styles, PFDescriptionList];

    renderToolbar(): TemplateResult {
        return html`
            <ak-forms-modal>
                <span slot="submit"> ${msg("Create")} </span>
                <span slot="header"> ${msg("Create Token")} </span>
                <ak-user-token-form intent=${IntentEnum.Api} slot="form"> </ak-user-token-form>
                <button slot="trigger" class="pf-c-button pf-m-secondary">
                    ${msg("Create Token")}
                </button>
            </ak-forms-modal>
            <ak-forms-modal>
                <span slot="submit"> ${msg("Create")} </span>
                <span slot="header"> ${msg("Create App password")} </span>
                <ak-user-token-form intent=${IntentEnum.AppPassword} slot="form">
                </ak-user-token-form>
                <button slot="trigger" class="pf-c-button pf-m-secondary">
                    ${msg("Create App password")}
                </button>
            </ak-forms-modal>
            ${super.renderToolbar()}
        `;
    }

    renderExpanded(item: Token): TemplateResult {
        return html` <td role="cell" colspan="3">
                <div class="pf-c-table__expandable-row-content">
                    <dl class="pf-c-description-list pf-m-horizontal">
                        <div class="pf-c-description-list__group">
                            <dt class="pf-c-description-list__term">
                                <span class="pf-c-description-list__text">${msg("User")}</span>
                            </dt>
                            <dd class="pf-c-description-list__description">
                                <div class="pf-c-description-list__text">
                                    ${item.userObj?.username}
                                </div>
                            </dd>
                        </div>
                        <div class="pf-c-description-list__group">
                            <dt class="pf-c-description-list__term">
                                <span class="pf-c-description-list__text">${msg("Expiring")}</span>
                            </dt>
                            <dd class="pf-c-description-list__description">
                                <div class="pf-c-description-list__text">
                                    <ak-status-label ?good=${item.expiring}></ak-status-label>
                                </div>
                            </dd>
                        </div>
                        <div class="pf-c-description-list__group">
                            <dt class="pf-c-description-list__term">
                                <span class="pf-c-description-list__text">${msg("Expiring")}</span>
                            </dt>
                            <dd class="pf-c-description-list__description">
                                <div class="pf-c-description-list__text">
                                    ${item.expiring
                                        ? html`<pf-tooltip
                                              position="top"
                                              .content=${item.expires?.toLocaleString()}
                                          >
                                              ${formatElapsedTime(item.expires!)}
                                          </pf-tooltip>`
                                        : msg("-")}
                                </div>
                            </dd>
                        </div>
                        <div class="pf-c-description-list__group">
                            <dt class="pf-c-description-list__term">
                                <span class="pf-c-description-list__text">${msg("Intent")}</span>
                            </dt>
                            <dd class="pf-c-description-list__description">
                                <div class="pf-c-description-list__text">
                                    ${intentToLabel(item.intent ?? IntentEnum.Api)}
                                </div>
                            </dd>
                        </div>
                    </dl>
                </div>
            </td>
            <td></td>`;
    }

    renderToolbarSelected(): TemplateResult {
        const disabled = this.selectedElements.length < 1;
        return html`<ak-forms-delete-bulk
            objectLabel=${msg("Token(s)")}
            .objects=${this.selectedElements}
            .metadata=${(item: Token) => [{ key: msg("Identifier"), value: item.identifier }]}
            .delete=${(item: Token) =>
                new CoreApi(DEFAULT_CONFIG).coreTokensDestroy({
                    identifier: item.identifier,
                })}
        >
            <button ?disabled=${disabled} slot="trigger" class="pf-c-button pf-m-danger">
                ${msg("Delete")}
            </button>
        </ak-forms-delete-bulk>`;
    }

    row(item: Token): TemplateResult[] {
        return [
            html`<span class="pf-m-monospace">${item.identifier}</span>`,
            html`
                <ak-forms-modal>
                    <span slot="submit"> ${msg("Update")} </span>
                    <span slot="header"> ${msg("Update Token")} </span>
                    <ak-user-token-form
                        intent=${item.intent ?? IntentEnum.Api}
                        slot="form"
                        .instancePk=${item.identifier}
                    >
                    </ak-user-token-form>
                    <button slot="trigger" class="pf-c-button pf-m-plain">
                        <pf-tooltip position="top" content=${msg("Edit")}>
                            <i class="fas fa-edit"></i>
                        </pf-tooltip>
                    </button>
                </ak-forms-modal>
                <ak-token-copy-button
                    class="pf-c-button pf-m-plain"
                    identifier="${item.identifier}"
                >
                    <pf-tooltip position="top" content=${msg("Copy token")}>
                        <i class="fas fa-copy"></i>
                    </pf-tooltip>
                </ak-token-copy-button>
            `,
        ];
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "ak-user-token-list": UserTokenList;
    }
}
