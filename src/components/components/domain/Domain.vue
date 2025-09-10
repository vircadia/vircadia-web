<template>
    <q-card flat bordered>
        <q-card-section class="row items-center justify-between q-gutter-sm">
            <div class="row items-center q-gutter-sm">
                <q-icon name="dns" />
                <div class="text-h6">Domains</div>
            </div>
            <div class="row items-center q-gutter-sm">
                <q-btn
                    v-if="isAdmin"
                    color="primary"
                    unelevated
                    label="Create domain"
                    @click="createNewDomainToken"
                />
                <q-input
                    v-model="search"
                    dense
                    outlined
                    clearable
                    placeholder="Search"
                    style="min-width: 220px;"
                />
                <q-btn icon="refresh" dense round flat @click="loadDomains" :loading="loading" />
            </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
            <div v-if="!isLoggedIn" class="text-grey-7">
                You must be logged in to view and manage your domains.
            </div>
            <div v-else>
                <q-table
                    flat
                    :rows="filteredDomains"
                    :columns="columns"
                    row-key="domainID"
                    :loading="loading"
                    hide-bottom
                    binary-state-sort
                >
                    <template #body-cell-name="props">
                        <q-td :props="props">
                            <div class="text-weight-medium">{{ props.row.name }}</div>
                            <div class="text-caption text-grey">ID: {{ props.row.domainID }}</div>
                        </q-td>
                    </template>
                    <template #body-cell-users="props">
                        <q-td :props="props">
                            <q-badge color="primary" text-color="white">{{ props.row.users }}</q-badge>
                        </q-td>
                    </template>
                    <template #body-cell-version="props">
                        <q-td :props="props">
                            <div>{{ props.row.version || '-' }}</div>
                            <div class="text-caption text-grey">{{ props.row.protocol || '' }}</div>
                        </q-td>
                    </template>
                    <template #body-cell-actions="props">
                        <q-td :props="props">
                            <q-btn
                                dense
                                outline
                                color="secondary"
                                label="Create domain token"
                                @click="createDomainToken(props.row)"
                                :loading="tokenLoadingId === props.row.domainID"
                            />
                        </q-td>
                    </template>
                </q-table>
            </div>
        </q-card-section>

        <q-inner-loading :showing="loading">
            <q-spinner-tail color="primary" size="2em" />
        </q-inner-loading>

        <q-dialog v-model="tokenDialog.show">
            <q-card style="min-width: 420px;">
                <q-card-section class="row items-center q-gutter-sm">
                    <q-icon name="vpn_key" />
                    <div class="text-h6">Domain Token</div>
                </q-card-section>
                <q-separator />
                <q-card-section class="q-gutter-sm">
                    <div v-if="tokenDialog.domain">
                        <div class="text-caption text-grey">Domain</div>
                        <div>{{ tokenDialog.domain?.name }} ({{ tokenDialog.domain?.domainID }})</div>
                    </div>
                    <q-input v-model="tokenDialog.token" readonly type="textarea" autogrow />
                    <div class="row q-gutter-sm">
                        <q-btn color="primary" label="Copy" @click="copyToken" />
                        <q-btn flat label="Close" v-close-popup />
                    </div>
                </q-card-section>
            </q-card>
        </q-dialog>
    </q-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { API } from "@Modules/metaverse/API";
import { applicationStore, userStore } from "@Stores/index";
import type { QTableColumn } from "quasar";

type TokenResponse = { token?: string, data?: { token?: string } };

interface DomainRow {
    name: string;
    domainID: string;
    users: number;
    protocol?: string;
    publicKey?: string;
    version?: string;
    iceServer?: string;
    sponsorAccountId?: string;
    networkingMode?: string;
}

interface GetDomainsResponseV2 {
    domains: Array<{
        name: string;
        domainId: string;
        total_users: number;
        protocol_version?: string;
        public_key?: string;
        version?: string;
        ice_server_address?: string;
        sponsor_account_id?: string;
        networking_mode?: string;
    }>;
}

export default defineComponent({
    name: "DomainManager",
    setup() {
        return { applicationStore, userStore };
    },
    data() {
        return {
            loading: false as boolean,
            tokenLoadingId: undefined as string | undefined,
            search: "" as string,
            rows: [] as DomainRow[],
            columns: [
                { name: "name", label: "Domain", field: "name", align: "left", sortable: true },
                { name: "users", label: "Users", field: "users", align: "left", sortable: true },
                { name: "version", label: "Version", field: "version", align: "left", sortable: true },
                { name: "actions", label: "Actions", field: "actions", align: "right" }
            ] as QTableColumn[],
            tokenDialog: {
                show: false as boolean,
                domain: undefined as DomainRow | undefined,
                token: "" as string
            }
        };
    },
    computed: {
        isLoggedIn(): boolean { return this.userStore.account.isLoggedIn; },
        isAdmin(): boolean { return this.userStore.account.isAdmin; },
        filteredDomains(): DomainRow[] {
            const q = (this.search || "").toLowerCase();
            return this.rows.filter(r =>
                r.name.toLowerCase().includes(q)
                || r.domainID.toLowerCase().includes(q)
            );
        }
    },
    methods: {
        async loadDomains(): Promise<void> {
            if (!this.isLoggedIn) { return; }
            this.loading = true;
            try {
                const params = new URLSearchParams({ per_page: "300" });
                if (this.userStore.account.isAdmin) {
                    params.set("asAdmin", "true");
                }
                const data = await API.get("/api/v1/domains?" + params.toString()) as GetDomainsResponseV2;
                this.rows = (data?.domains ?? []).map((item) => ({
                    name: item.name,
                    domainID: item.domainId,
                    users: item.total_users ?? 0,
                    protocol: item.protocol_version,
                    publicKey: item.public_key,
                    version: item.version,
                    iceServer: item.ice_server_address,
                    sponsorAccountId: item.sponsor_account_id,
                    networkingMode: item.networking_mode
                }));
            } catch {
                // noop; errors are surfaced by global handlers/logs
            } finally {
                this.loading = false;
            }
        },
        async createNewDomainToken(): Promise<void> {
            try {
                const tokenData = await API.post("/api/v1/token/new?scope=domain", {} as KeyedCollection) as TokenResponse;
                const token = tokenData.token || tokenData.data?.token || "";
                this.tokenDialog.domain = undefined;
                this.tokenDialog.token = token;
                this.tokenDialog.show = true;
            } catch {
                // noop
            }
        },
        async createDomainToken(row: DomainRow): Promise<void> {
            this.tokenLoadingId = row.domainID;
            try {
                const tokenData = await API.post("/api/v1/token/new?scope=domain", {} as KeyedCollection) as TokenResponse;
                // tokenData is wrapped in { status, data }, API.post unwraps data for standard endpoints
                // tokens endpoint returns in standard format via Token.create -> buildSimpleResponse
                const token = tokenData.token || tokenData.data?.token || "";
                this.tokenDialog.domain = row;
                this.tokenDialog.token = token;
                this.tokenDialog.show = true;
            } catch {
                // noop; global error handling/logs
            } finally {
                this.tokenLoadingId = undefined;
            }
        },
        async copyToken(): Promise<void> {
            try {
                await navigator.clipboard.writeText(this.tokenDialog.token);
            } catch {
                // ignore
            }
        }
    },
    mounted() {
        void this.loadDomains();
    }
});
</script>

<style scoped>
</style>


