import { DEFAULT_CONFIG } from "#common/api/config";

import { DualSelectPair } from "#elements/ak-dual-select/types";

import { OAuthSource, SourcesApi } from "@goauthentik/api";

const sourceToSelect = (source: OAuthSource) => [
    source.pk,
    `${source.name} (${source.slug})`,
    source.name,
    source,
];

export async function oauth2SourcesProvider(page = 1, search = "") {
    const oauthSources = await new SourcesApi(DEFAULT_CONFIG).sourcesOauthList({
        ordering: "name",
        hasJwks: true,
        pageSize: 20,
        search: search.trim(),
        page,
    });

    return {
        pagination: oauthSources.pagination,
        options: oauthSources.results.map(sourceToSelect),
    };
}

export function oauth2SourcesSelector(instanceMappings?: string[]) {
    if (!instanceMappings) {
        return async (mappings: DualSelectPair<OAuthSource>[]) =>
            mappings.filter(
                ([_0, _1, _2, source]: DualSelectPair<OAuthSource>) => source !== undefined,
            );
    }

    return async () => {
        const oauthSources = new SourcesApi(DEFAULT_CONFIG);
        const mappings = await Promise.allSettled(
            instanceMappings.map((instanceId) =>
                oauthSources.sourcesOauthList({ pbmUuid: instanceId }),
            ),
        );

        return mappings
            .filter((s) => s.status === "fulfilled")
            .map((s) => s.value)
            .filter((s) => s.pagination.count > 0)
            .map((s) => s.results[0])
            .map(sourceToSelect);
    };
}
